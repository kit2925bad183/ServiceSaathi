import { NextRequest, NextResponse } from "next/server";
import { getTenantContext, requirePermission } from "@/lib/auth/context";
import { manualPaymentSchema } from "@/lib/validation";
import { recordManualPayment } from "@/modules/invoices/service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ctx = await getTenantContext();
    requirePermission(ctx, "payments:record");

    const body = await req.json();
    const validated = manualPaymentSchema.parse({
      ...body,
      invoiceId: id,
    });

    const result = await recordManualPayment({
      businessId: ctx.businessId,
      invoiceId: id,
      amountPaise: validated.amountPaise,
      method: validated.method,
      transactionReference: validated.transactionReference,
      actorUserId: ctx.userId,
    });

    return NextResponse.json({
      success: true,
      payment: result.payment,
      newBalance: result.newBalance,
      status: result.status,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Payment recording failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
