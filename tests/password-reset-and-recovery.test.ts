import { describe, it, expect } from "vitest";
import { createPasswordResetToken, verifyPasswordResetToken } from "../src/lib/auth/password-reset";

describe("Password Reset Token & Recovery Flow", () => {
  it("generates a verifiable cryptographic token for valid email", async () => {
    const email = "rajesh@coolbreeze.in";
    const token = await createPasswordResetToken(email);

    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(20);

    const verified = await verifyPasswordResetToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.email).toBe(email);
  });

  it("normalizes email to lowercase", async () => {
    const email = "Karthik.Natarajan@ApexCare.IN";
    const token = await createPasswordResetToken(email);

    const verified = await verifyPasswordResetToken(token);
    expect(verified?.email).toBe("karthik.natarajan@apexcare.in");
  });

  it("rejects tampered or forged tokens", async () => {
    const email = "rajesh@coolbreeze.in";
    const token = await createPasswordResetToken(email);
    const tampered = token.slice(0, -6) + "xyz123";

    const verified = await verifyPasswordResetToken(tampered);
    expect(verified).toBeNull();
  });

  it("rejects completely invalid strings", async () => {
    const verified = await verifyPasswordResetToken("not_a_valid_jwt_token_at_all");
    expect(verified).toBeNull();
  });
});
