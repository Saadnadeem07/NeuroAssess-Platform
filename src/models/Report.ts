import mongoose, { Schema, type Model, type Document, type Types } from "mongoose";

export type ReportType = "testing" | "learning-plan" | "learning-plan-completed";

export interface IReport extends Document {
  report_name: string;
  report_type: ReportType;
  user_id: Types.ObjectId;
  report_data: unknown;
  created_at: Date;
  updated_at: Date;
}

interface ReportModel extends Model<IReport> {
  findByUserId(userId: string | Types.ObjectId): Promise<IReport[]>;
  findByUserIdAndType(userId: string | Types.ObjectId, type: ReportType): Promise<IReport[]>;
}

const reportSchema = new Schema<IReport>(
  {
    report_name: { type: String, required: true, trim: true },
    report_type: {
      type: String,
      enum: ["testing", "learning-plan", "learning-plan-completed"],
      required: true,
    },
    user_id: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    report_data: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

reportSchema.index({ user_id: 1, report_name: 1 }, { unique: true });

reportSchema.statics.findByUserId = function (userId) {
  return this.find({ user_id: userId }).sort({ created_at: -1 });
};

reportSchema.statics.findByUserIdAndType = function (userId, type) {
  return this.find({ user_id: userId, report_type: type }).sort({ created_at: -1 });
};

const Report =
  (mongoose.models.Report as ReportModel) ||
  mongoose.model<IReport, ReportModel>("Report", reportSchema);

export default Report;
