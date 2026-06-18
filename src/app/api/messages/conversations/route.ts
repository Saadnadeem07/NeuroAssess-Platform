import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import { withRoute, ok } from "@/lib/apiHandler";
import { requirePatientOrPsychiatrist } from "@/lib/auth-guards";
import { messagingPrincipal } from "@/lib/messaging";
import Message from "@/models/Message";

export const dynamic = "force-dynamic";

export const GET = withRoute(async (req: NextRequest) => {
  const principal = await requirePatientOrPsychiatrist(req);
  const { id, model } = messagingPrincipal(principal);
  const userId = new mongoose.Types.ObjectId(id);

  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [
          { sender: userId, senderModel: model },
          { receiver: userId, receiverModel: model },
        ],
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ["$sender", userId] },
            { id: "$receiver", model: "$receiverModel" },
            { id: "$sender", model: "$senderModel" },
          ],
        },
        lastMessage: { $first: "$$ROOT" },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$receiver", userId] },
                  { $eq: ["$receiverModel", model] },
                  { $eq: ["$isRead", false] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        partnerId: "$_id.id",
        partnerModel: "$_id.model",
        partnerName: {
          $cond: [{ $eq: ["$lastMessage.sender", userId] }, "$lastMessage.receiverName", "$lastMessage.senderName"],
        },
        partnerRole: {
          $cond: [{ $eq: ["$lastMessage.sender", userId] }, "$lastMessage.receiverRole", "$lastMessage.senderRole"],
        },
        lastMessage: "$lastMessage.content",
        lastMessageTime: "$lastMessage.createdAt",
        unreadCount: 1,
      },
    },
    { $sort: { lastMessageTime: -1 } },
  ]);

  return ok(conversations);
});
