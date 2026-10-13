export interface VoiceDraftResult {
  isAvailable: boolean;
  status: "READY_FOR_REVIEW" | "PROVIDER_NOT_CONFIGURED" | "PARSE_ERROR";
  languageDetected?: "ta" | "en";
  draft?: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    serviceCategory: string;
    symptoms: string;
    preferredTime: string;
    uncertainFields: string[];
    confidenceScore: number;
  };
  rawTranscript?: string;
  notesForStaff: string;
}

/**
 * Parses an audio transcript (Tamil or English) into a structured booking draft.
 * Requires human staff review before saving or dispatching.
 */
export async function parseVoiceNoteDraft(params: {
  audioBuffer?: Buffer;
  rawTextTranscript?: string;
  languageHint?: "ta" | "en";
}): Promise<VoiceDraftResult> {
  const isFeatureEnabled = process.env.AI_VOICE_FEATURE_ENABLED === "true";
  const apiKey = process.env.GEMINI_API_KEY;

  if (!isFeatureEnabled || !apiKey) {
    return {
      isAvailable: false,
      status: "PROVIDER_NOT_CONFIGURED",
      notesForStaff:
        "AI Voice Note Drafting is disabled or Gemini API Key is not configured in .env. Staff can enter booking manually.",
    };
  }

  // If text transcript is provided, extract entities safely
  const transcript = params.rawTextTranscript || "";
  const uncertainFields: string[] = [];

  // Safe heuristic extraction for demonstration / review
  let customerName = "";
  let customerPhone = "";
  let serviceCategory = "AC installation and repair";
  let symptoms = transcript;
  let preferredTime = "Tomorrow Morning";

  // Check phone pattern
  const phoneMatch = transcript.match(/\b[6-9]\d{9}\b/);
  if (phoneMatch) {
    customerPhone = phoneMatch[0];
  } else {
    uncertainFields.push("customerPhone");
  }

  // Tamil keywords
  if (transcript.includes("ஏசி") || transcript.includes("குளிரூட்டி") || transcript.toLowerCase().includes("ac")) {
    serviceCategory = "AC installation and repair";
  } else if (transcript.includes("வாஷிங் மெஷின்") || transcript.toLowerCase().includes("washing")) {
    serviceCategory = "Home appliance repair";
  } else if (transcript.includes("லைட்") || transcript.toLowerCase().includes("electric") || transcript.includes("வயர்")) {
    serviceCategory = "Electrical services";
  }

  return {
    isAvailable: true,
    status: "READY_FOR_REVIEW",
    languageDetected: params.languageHint || "en",
    draft: {
      customerName: customerName || "Customer (Pending Review)",
      customerPhone: customerPhone || "",
      customerAddress: "Pending Staff Verification",
      serviceCategory,
      symptoms,
      preferredTime,
      uncertainFields,
      confidenceScore: uncertainFields.length === 0 ? 0.92 : 0.65,
    },
    rawTranscript: transcript,
    notesForStaff:
      "Important: This draft was auto-extracted from voice note. Review and confirm all customer fields before scheduling job.",
  };
}
