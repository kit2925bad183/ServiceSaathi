import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, recordVerifiedPayment } from "@/lib/adapters/payment";
import { PaymentMethod } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature header" }, { status: 400 });
    }

    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    // We process payment.captured event
    if (event.event === "payment.captured") {
      const paymentEntity = event.payload.payment.entity;
      const notes = paymentEntity.notes || {};

      const businessId = notes.businessId;
      const invoiceId = notes.invoiceId;
      const customerId = notes.customerId;

      if (!businessId || !invoiceId || !customerId) {
        console.warn("[Webhook] Payment captured without business/invoice notes metadata");
        return NextResponse.json({ status: "ignored_missing_metadata" });
      }

      const result = await recordVerifiedPayment({
        businessId,
        invoiceId,
        customerId,
        amountPaise: paymentEntity.amount,
        method: PaymentMethod.RAZORPAY_SANDBOX,
        transactionReference: paymentEntity.id,
        gatewayOrderId: paymentEntity.order_id,
        gatewayPaymentId: paymentEntity.id,
        gatewaySignature: signature,
      });

      return NextResponse.json({
        status: "processed",
        isDuplicate: result.isDuplicate,
        paymentId: result.payment.id,
      });
    }

    return NextResponse.json({ status: "ignored_unhandled_event" });
  } catch (error: unknown) {
    console.error("[Webhook Error]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}
