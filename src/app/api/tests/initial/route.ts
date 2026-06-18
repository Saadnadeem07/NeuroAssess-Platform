import { NextResponse, type NextRequest } from "next/server";
import { withRoute } from "@/lib/apiHandler";
import { requirePatient } from "@/lib/auth-guards";
import { AppError } from "@/lib/AppError";
import { ERROR_CODES } from "@/lib/errorCodes";
import { analyzeHandwriting } from "@/lib/ai";
import Report from "@/models/Report";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/gif", "image/jpg"]);

function generateReportName(type: string): string {
  const now = new Date();
  const time = now
    .toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
    .replace(":", "-");
  const date = now.toISOString().split("T")[0];
  return `${time}_${date}_${type}`;
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

  const bytes = Buffer.from(await file.arrayBuffer());
  const analysis = await analyzeHandwriting(bytes);
  const base64Image = `data:${file.type};base64,${bytes.toString("base64")}`;

  const response: Record<string, unknown> = {
    success: true,
    message: "Image processed successfully",
    results: analysis,
  };

  if (analysis.classification?.class === "Potential Dysgraphia") {
    const relevantData = {
      classification: analysis.classification,
      feedback: analysis.feedback ? { summary: analysis.feedback.summary || null } : null,
      dysgraphic_words: analysis.dysgraphic_words || [],
      spelling_errors: analysis.spelling_errors || [],
      alignment_issues: analysis.alignment_issues || [],
      spacing_issues: analysis.spacing_issues || [],
      image: base64Image,
    };

    const report = await Report.create({
      report_name: generateReportName("testing"),
      report_type: "testing",
      user_id: user._id,
      report_data: relevantData,
    });

    response.report = {
      _id: report._id,
      report_name: report.report_name,
      report_type: report.report_type,
      created_at: report.created_at,
    };
    response.message = "Initial test report created successfully";
  } else {
    response.message =
      "Image processed successfully. No dysgraphia detected, so no report was saved.";
  }

  return NextResponse.json(response);
});
