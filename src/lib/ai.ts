import crypto from "crypto";

/**
 * Handwriting analysis.
 *
 * This port ships a DETERMINISTIC MOCK so every patient flow works end-to-end
 * without a trained model. The output shape matches what the original Hugging
 * Face endpoint returned, so the rest of the app (reports, learning plans) is
 * unchanged.
 *
 * To wire a real model: set MOCK_AI=false and HANDWRITING_API_URL, then
 * implement `callRealModel()` below (multipart POST of the image).
 */

export type HandwritingAnalysis = {
  classification: { class: string; confidence: number };
  feedback: { summary: string; learning_plan?: string };
  dysgraphic_words: string[];
  spelling_errors: string[];
  alignment_issues: string[];
  spacing_issues: string[];
};

const SAMPLE_WORDS = ["because", "friend", "would", "their", "through", "wednesday", "beautiful", "necessary"];
const SAMPLE_ALIGNMENT = ["Baseline drifts upward on line 2", "Inconsistent letter height in 'tall' letters"];
const SAMPLE_SPACING = ["Crowded spacing between words", "Uneven gaps after punctuation"];

/** Stable pseudo-random in [0,1) derived from a seed buffer. */
function seededUnit(seed: Buffer): number {
  const hash = crypto.createHash("sha256").update(seed).digest();
  // Use first 6 bytes for a 0..1 float.
  const n = hash.readUIntBE(0, 6);
  return n / 0xffffffffffff;
}

function buildAnalysis(seed: Buffer, previousLearningPlan?: string | null): HandwritingAnalysis {
  const score = seededUnit(seed);
  const isDysgraphic = score > 0.45; // ~55% of samples flagged, deterministic per image

  if (!isDysgraphic) {
    return {
      classification: { class: "Typical Handwriting", confidence: Number((0.7 + score * 0.29).toFixed(2)) },
      feedback: { summary: "No significant markers of dysgraphia were detected in this sample." },
      dysgraphic_words: [],
      spelling_errors: [],
      alignment_issues: [],
      spacing_issues: [],
    };
  }

  const wordCount = 1 + Math.floor(score * 4);
  const dysgraphic_words = SAMPLE_WORDS.slice(0, wordCount);

  const learning_plan = previousLearningPlan
    ? `Building on your previous module, this plan reinforces letter-formation consistency and word spacing. Practice the ${wordCount} flagged words with guided tracing for 10 minutes daily, then free-write two sentences using each. Focus especially on maintaining a steady baseline.`
    : `Your sample shows markers consistent with dysgraphia. This starter plan focuses on letter formation, spacing, and baseline control. Begin with 10 minutes of guided tracing per day for the ${wordCount} flagged words, progressing to copying short sentences while keeping even spacing.`;

  return {
    classification: { class: "Potential Dysgraphia", confidence: Number((0.6 + score * 0.39).toFixed(2)) },
    feedback: {
      summary: `Markers consistent with dysgraphia were detected: irregular letter formation and spacing across ${wordCount} word(s).`,
      learning_plan,
    },
    dysgraphic_words,
    spelling_errors: dysgraphic_words.slice(0, Math.max(1, wordCount - 1)),
    alignment_issues: SAMPLE_ALIGNMENT.slice(0, 1 + (score > 0.7 ? 1 : 0)),
    spacing_issues: SAMPLE_SPACING.slice(0, 1 + (score > 0.6 ? 1 : 0)),
  };
}

async function callRealModel(_bytes: Buffer, _previousLearningPlan?: string | null): Promise<HandwritingAnalysis> {
  // Placeholder for a live model integration.
  // const form = new FormData(); form.append("file", new Blob([_bytes]));
  // const res = await fetch(process.env.HANDWRITING_API_URL!, { method: "POST", body: form, ... });
  // return res.json();
  throw new Error("Real handwriting model not configured. Set MOCK_AI=true or implement callRealModel().");
}

export async function analyzeHandwriting(
  bytes: Buffer,
  previousLearningPlan?: string | null
): Promise<HandwritingAnalysis> {
  const useMock = process.env.MOCK_AI !== "false";
  if (useMock || !process.env.HANDWRITING_API_URL) {
    // Seed by image content + (optional) previous plan so results are stable per image.
    const seed = Buffer.concat([bytes.subarray(0, 4096), Buffer.from(previousLearningPlan || "")]);
    return buildAnalysis(seed, previousLearningPlan);
  }
  return callRealModel(bytes, previousLearningPlan);
}

export function extractLearningPlanParagraph(a: HandwritingAnalysis): string {
  return (
    a.feedback?.learning_plan ||
    "A personalized learning plan will be generated based on your handwriting sample."
  );
}
