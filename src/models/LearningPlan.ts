import mongoose, { Schema, type Model, type Document, type Types } from "mongoose";

export interface ILearningPlan extends Document {
  user_id: Types.ObjectId;
  module_number: 1 | 2;
  learning_plan_paragraph: string;
  report_id: Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

interface LearningPlanModel extends Model<ILearningPlan> {
  findByUserId(userId: string | Types.ObjectId): Promise<ILearningPlan[]>;
  findByUserIdAndModule(
    userId: string | Types.ObjectId,
    moduleNumber: number
  ): Promise<ILearningPlan | null>;
}

const learningPlanSchema = new Schema<ILearningPlan>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    module_number: { type: Number, enum: [1, 2], required: true },
    learning_plan_paragraph: { type: String, required: true },
    report_id: { type: Schema.Types.ObjectId, ref: "Report", required: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

learningPlanSchema.index({ user_id: 1, module_number: 1 }, { unique: true });

learningPlanSchema.statics.findByUserId = function (userId) {
  return this.find({ user_id: userId }).sort({ module_number: 1 });
};

learningPlanSchema.statics.findByUserIdAndModule = function (userId, moduleNumber) {
  return this.findOne({ user_id: userId, module_number: moduleNumber });
};

const LearningPlan =
  (mongoose.models.LearningPlan as LearningPlanModel) ||
  mongoose.model<ILearningPlan, LearningPlanModel>("LearningPlan", learningPlanSchema);

export default LearningPlan;
