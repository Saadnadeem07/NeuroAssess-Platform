import { NextResponse, type NextRequest } from "next/server";
import { withRoute } from "@/lib/apiHandler";
import { requirePatient } from "@/lib/auth-guards";
import { AppError } from "@/lib/AppError";
import LearningPlan from "@/models/LearningPlan";
import Report from "@/models/Report";

function generateReportName(): string {
  const now = new Date();
  const time = now
    .toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
    .replace(":", "-");
  const date = now.toISOString().split("T")[0];
  return `${time}_${date}_learning-plan`;
}

export const POST = withRoute(async (req: NextRequest) => {
  const { user } = await requirePatient(req);
  const module1 = await LearningPlan.findByUserIdAndModule(String(user._id), 1);
  const module2 = await LearningPlan.findByUserIdAndModule(String(user._id), 2);

  if (!module1 || !module2) {
    throw AppError.badRequest("Cannot reset learning plans. Both modules must be completed first.");
  }

  const report = await Report.create({
    report_name: generateReportName() + "-completed",
    report_type: "learning-plan-completed",
    user_id: user._id,
    report_data: {
      module1: module1.learning_plan_paragraph,
      module2: module2.learning_plan_paragraph,
      completed_at: new Date().toISOString(),
    },
  });

  await LearningPlan.deleteMany({ user_id: user._id });

  return NextResponse.json({
    success: true,
    message: "Learning plans have been reset successfully. A backup has been saved in reports.",
    report_id: report._id,
  });
});
