import mongoose, { Schema, type Model, type Document, type Types } from "mongoose";

export interface IMessage extends Document {
  sender: Types.ObjectId;
  senderModel: "Patient" | "Psychiatrist";
  receiver: Types.ObjectId;
  receiverModel: "Patient" | "Psychiatrist";
  content: string;
  isRead: boolean;
  senderName: string;
  receiverName: string;
  senderRole: "patient" | "psychiatrist";
  receiverRole: "patient" | "psychiatrist";
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    sender: { type: Schema.Types.ObjectId, required: true, refPath: "senderModel" },
    senderModel: { type: String, required: true, enum: ["Patient", "Psychiatrist"] },
    receiver: { type: Schema.Types.ObjectId, required: true, refPath: "receiverModel" },
    receiverModel: { type: String, required: true, enum: ["Patient", "Psychiatrist"] },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    senderName: { type: String, required: true },
    receiverName: { type: String, required: true },
    senderRole: { type: String, enum: ["patient", "psychiatrist"], required: true },
    receiverRole: { type: String, enum: ["patient", "psychiatrist"], required: true },
  },
  { timestamps: true }
);

messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ receiver: 1, isRead: 1 });
messageSchema.index({ createdAt: -1 });

const Message =
  (mongoose.models.Message as Model<IMessage>) || mongoose.model<IMessage>("Message", messageSchema);

export default Message;
