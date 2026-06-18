import { NextResponse, type NextRequest } from "next/server";
import { withRoute } from "@/lib/apiHandler";
import { requirePatient } from "@/lib/auth-guards";
import { AppError } from "@/lib/AppError";
import { ERROR_CODES } from "@/lib/errorCodes";
import { analyzeHandwriting, extractLearningPlanParagraph } from "@/lib/ai";
import LearningPlan from "@/models/LearningPlan";
import Report from "@/models/Report";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/gif", "image/jpg"]);

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

  const form = await req.formData();
  const file = form.get("image");
  if (!(file instanceof File)) {
    throw AppError.badRequest("No image file provided", ERROR_CODES.UPLOAD_INVALID);
  }
  if (!ALLOWED.has(file.type)) {
    throw AppError.badRequest("Only JPG/PNG/GIF images are allowed", ERROR_CODES.UPLOAD_INVALID);
  }

  const moduleNumber = parseInt(String(form.get("moduleNumber") || "1"), 10);
  if (![1, 2].includes(moduleNumber)) throw AppError.badRequest("Invalid module number. Must be 1 or 2.");

  if (moduleNumber === 2) {
    const module1 = await LearningPlan.findByUserIdAndModule(String(user._id), 1);
    if (!module1) throw AppError.badRequest("You must complete Module 1 before proceeding to Module 2.");
  }

  const previousLearningPlan =
    moduleNumber === 2 && form.get("previousLearningPlan") ? String(form.get("previousLearningPlan")) : null;

  const bytes = Buffer.from(await file.arrayBuffer());
  const analysis = await analyzeHandwriting(bytes, previousLearningPlan);

  const report = await Report.create({
    report_name: generateReportName(),
    report_type: "learning-plan",
    user_id: user._id,
    report_data: analysis,
  });

  const paragraph = extractLearningPlanParagraph(analysis);

  let learningPlan = await LearningPlan.findByUserIdAndModule(String(user._id), moduleNumber);
  if (learningPlan) {
    learningPlan.learning_plan_paragraph = paragraph;
    learningPlan.report_id = report._id as typeof learningPlan.report_id;
    await learningPlan.save();
  } else {
    learningPlan = await LearningPlan.create({
      user_id: user._id,
      module_number: moduleNumber,
      learning_plan_paragraph: paragraph,
      report_id: report._id,
    });
  }

  return NextResponse.json(
    {
      success: true,
      message: `Learning plan for Module ${moduleNumber} created/updated successfully`,
      results: analysis,
      learningPlan,
    },
    { status: 201 }
  );
});
