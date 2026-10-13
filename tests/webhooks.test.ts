import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { verifyWebhookSignature, verifyPaymentSignature, isPaymentSandbox } from "../src/lib/adapters/payment";

describe("Webhook Signatures & Payment Security", () => {
  const testSecret = "test_webhook_secret_key_12345";

  it("verifies genuine Razorpay webhook HMAC-SHA256 signature", () => {
    const rawPayload = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_123456789",
            amount: 100000,
          },
        },
      },
    });

    const expectedSignature = crypto
      .createHmac("sha256", testSecret)
      .update(rawPayload)
      .digest("hex");

    const isValid = verifyWebhookSignature(rawPayload, expectedSignature, testSecret);
    expect(isValid).toBe(true);
  });

  it("rejects tampered or fraudulent webhook payloads", () => {
    const originalPayload = JSON.stringify({ event: "payment.captured", amount: 1000 });
    const tamperedPayload = JSON.stringify({ event: "payment.captured", amount: 9999 });

    const originalSignature = crypto
      .createHmac("sha256", testSecret)
      .update(originalPayload)
      .digest("hex");

    const isValid = verifyWebhookSignature(tamperedPayload, originalSignature, testSecret);
    expect(isValid).toBe(false);
  });

  it("rejects bad signature header format gracefully without crashing", () => {
    const isValid = verifyWebhookSignature("{}", "bad_signature_length", testSecret);
    expect(isValid).toBe(false);
  });

  it("verifies standard client checkout payment signature", () => {
    const orderId = "order_98765";
    const paymentId = "pay_54321";
    const secret = "rzp_secret_servicesaathi";

    const body = `${orderId}|${paymentId}`;
    const validSignature = crypto.createHmac("sha256", secret).update(body).digest("hex");

    const isValid = verifyPaymentSignature({
      orderId,
      paymentId,
      signature: validSignature,
    });
    expect(isValid).toBe(true);
  });

  it("detects sandbox mode properly when test placeholders are present", () => {
    expect(isPaymentSandbox()).toBe(true);
  });
});
