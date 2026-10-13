import { NextRequest, NextResponse } from "next/server";
import { getTenantContext, requirePermission } from "@/lib/auth/context";
import { quotationCreateSchema } from "@/lib/validation";
import { createQuotation } from "@/modules/quotations/service";

export async function POST(req: NextRequest) {
  try {
    const ctx = await getTenantContext();
    requirePermission(ctx, "quotations:create");

    const body = await req.json();
    const data = quotationCreateSchema.parse(body);

    const quotation = await createQuotation({
      businessId: ctx.businessId,
      customerId: data.customerId,
      jobId: data.jobId,
      validityDays: data.validityDays,
      discountPaise: data.discountPaise,
      notes: data.notes,
      terms: data.terms,
      items: data.items,
    });

    return NextResponse.json({
      success: true,
      quotation,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create quotation";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
