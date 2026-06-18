import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  let dbState = 0;
  try {
    await connectDB();
    dbState = mongoose.connection.readyState;
  } catch {
    dbState = 0;
  }
  return NextResponse.json({
    status: dbState === 1 ? "ok" : "degraded",
    db: dbState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
}
