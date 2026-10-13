import crypto from "crypto";
import { prisma } from "@/lib/db";
import { PaymentMethod, PaymentStatus } from "@prisma/client";

export interface CreateOrderParams {
  businessId: string;
  invoiceId: string;
  amountPaise: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface PaymentOrderResult {
  orderId: string;
  amountPaise: number;
  currency: string;
  keyId: string;
  isSandbox: boolean;
}

/**
 * Determine if running in real mode or explicit sandbox simulation
 */
export function isPaymentSandbox(): boolean {
  const keyId = process.env.RAZORPAY_KEY_ID;
  return !keyId || keyId.startsWith("rzp_test_placeholder") || keyId === "rzp_test_servicesaathi";
}

/**
 * Create a payment order.
 * If live credentials are not present, uses the explicit sandbox simulator.
 */
export async function createPaymentOrder(
  params: CreateOrderParams
): Promise<PaymentOrderResult> {
  const isSandbox = isPaymentSandbox();
  const currency = params.currency || "INR";

  if (isSandbox) {
    const fakeOrderId = `order_sandbox_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      orderId: fakeOrderId,
      amountPaise: params.amountPaise,
      currency,
      keyId: "rzp_test_sandbox_mode",
      isSandbox: true,
    };
  }

  // Live Razorpay API call
  const keyId = process.env.RAZORPAY_KEY_ID!;
  const keySecret = process.env.RAZORPAY_KEY_SECRET!;
  const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.amountPaise,
      currency,
      receipt: params.receipt,
      notes: params.notes,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Failed to create Razorpay order: ${errorBody}`);
  }

  const data = (await res.json()) as { id: string; amount: number; currency: string };

  return {
    orderId: data.id,
    amountPaise: data.amount,
    currency: data.currency,
    keyId,
    isSandbox: false,
  };
}

/**
 * Verifies standard client checkout payment signature (orderId + paymentId HMAC)
 */
export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET || "rzp_secret_servicesaathi";
  const body = `${params.orderId}|${params.paymentId}`;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(params.signature)
  );
}

/**
 * Verifies Webhook signature using timingSafeEqual to prevent timing attacks
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  secretOverride?: string
): boolean {
  const secret = secretOverride || process.env.RAZORPAY_WEBHOOK_SECRET || "rzp_webhook_secret_servicesaathi";

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signatureHeader)
    );
  } catch {
    return false;
  }
}

/**
 * Processes incoming payment with idempotency & deduplication
 */
export async function recordVerifiedPayment(params: {
  businessId: string;
  invoiceId: string;
  customerId: string;
  amountPaise: number;
  method: PaymentMethod;
  transactionReference?: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  gatewaySignature?: string;
  actorUserId?: string;
}) {
  return await prisma.$transaction(async (tx) => {
    // 1. Check for duplicate payment by gatewayPaymentId or transactionReference
    if (params.gatewayPaymentId) {
      const existing = await tx.payment.findFirst({
        where: {
          businessId: params.businessId,
          gatewayPaymentId: params.gatewayPaymentId,
        },
      });
      if (existing) {
        return { payment: existing, isDuplicate: true };
      }
    }

    // 2. Fetch invoice and ensure business scope
    const invoice = await tx.invoice.findFirst({
      where: {
        id: params.invoiceId,
        businessId: params.businessId,
      },
    });

    if (!invoice) {
      throw new Error("Invoice not found or does not belong to business");
    }

    // 3. Create payment record
    const payment = await tx.payment.create({
      data: {
        businessId: params.businessId,
        invoiceId: params.invoiceId,
        customerId: params.customerId,
        amountPaise: params.amountPaise,
        method: params.method,
        transactionReference: params.transactionReference,
        status: PaymentStatus.SUCCESS,
        recordedByUserId: params.actorUserId,
        gatewayOrderId: params.gatewayOrderId,
        gatewayPaymentId: params.gatewayPaymentId,
        gatewaySignature: params.gatewaySignature,
      },
    });

    // 4. Update invoice paid amount and balance
    const newPaidAmount = invoice.paidAmountPaise + params.amountPaise;
    const newBalance = Math.max(0, invoice.totalPaise - newPaidAmount);
    const newStatus =
      newBalance === 0
        ? "PAID"
        : newPaidAmount > 0
        ? "PARTIALLY_PAID"
        : invoice.status;

    await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        paidAmountPaise: newPaidAmount,
        balancePaise: newBalance,
        status: newStatus,
      },
    });

    // 5. Audit event
    await tx.auditEvent.create({
      data: {
        businessId: params.businessId,
        userId: params.actorUserId,
        action: "PAYMENT_RECORDED",
        entityType: "Payment",
        entityId: payment.id,
        metadata: JSON.stringify({
          amountPaise: params.amountPaise,
          method: params.method,
          invoiceId: params.invoiceId,
        }),
      },
    });

    return { payment, isDuplicate: false };
  });
}
