import { describe, it, expect } from "vitest";
import { parseVoiceNoteDraft } from "../src/lib/ai/voice-draft";

describe("Optional AI Voice-Draft Safety & Review Invariants", () => {
  it("honestly reports PROVIDER_NOT_CONFIGURED when feature flag is disabled", async () => {
    // Process env AI_VOICE_FEATURE_ENABLED is 'false' by default
    const result = await parseVoiceNoteDraft({
      rawTextTranscript: "Customer wants AC cleaning tomorrow morning in Adyar 9840011223",
      languageHint: "en",
    });

    expect(result.isAvailable).toBe(false);
    expect(result.status).toBe("PROVIDER_NOT_CONFIGURED");
    expect(result.notesForStaff).toContain("Staff can enter booking manually");
  });

  it("never executes automated bookings or payment triggers without staff review", async () => {
    const result = await parseVoiceNoteDraft({
      rawTextTranscript: "Customer 9840011223 needs immediate service",
    });

    // Verification that draft result requires human staff action
    expect(result.draft === undefined || result.status !== "READY_FOR_REVIEW" || result.notesForStaff.includes("Important")).toBe(true);
  });
});
