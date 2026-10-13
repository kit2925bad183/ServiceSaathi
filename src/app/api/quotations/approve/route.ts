import { NextRequest, NextResponse } from "next/server";
import { processCustomerQuotationResponse } from "@/modules/quotations/service";
import { z } from "zod";

const schema = z.object({
  token: z.string().min(1),
  approved: z.boolean(),
  approvedByName: z.string().optional(),
  rejectionReason: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const clientIp = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || undefined;

    const quotation = await processCustomerQuotationResponse({
      token: data.token,
      approved: data.approved,
      customerIp: clientIp,
      userAgent,
      approvedByName: data.approvedByName,
      rejectionReason: data.rejectionReason,
    });

    return NextResponse.json({
      success: true,
      quotationNumber: quotation.quotationNumber,
      status: quotation.status,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Quotation response failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
