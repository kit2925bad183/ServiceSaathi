import { NextRequest, NextResponse } from "next/server";
import { getTenantContext, requirePermission } from "@/lib/auth/context";
import { createInvoice } from "@/modules/invoices/service";
import { z } from "zod";

const invoiceSchema = z.object({
  customerId: z.string().min(1),
  jobId: z.string().optional(),
  quotationId: z.string().optional(),
  dueDays: z.number().int().positive().default(7),
  discountPaise: z.number().int().nonnegative().default(0),
  notes: z.string().optional(),
  terms: z.string().optional(),
  items: z.array(
    z.object({
      type: z.enum(["LABOUR", "MATERIAL", "INSPECTION", "OTHER"]),
      description: z.string().min(1),
      quantity: z.number().int().positive(),
      unitPricePaise: z.number().int().nonnegative(),
    })
  ).min(1),
});

export async function POST(req: NextRequest) {
  try {
    const ctx = await getTenantContext();
    requirePermission(ctx, "invoices:create");

    const body = await req.json();
    const data = invoiceSchema.parse(body);

    const invoice = await createInvoice({
      businessId: ctx.businessId,
      customerId: data.customerId,
      jobId: data.jobId,
      quotationId: data.quotationId,
      dueDays: data.dueDays,
      discountPaise: data.discountPaise,
      notes: data.notes,
      terms: data.terms,
      items: data.items,
    });

    return NextResponse.json({
      success: true,
      invoice,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create invoice";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
