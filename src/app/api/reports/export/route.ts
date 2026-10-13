import { NextRequest, NextResponse } from "next/server";
import { getTenantContext, requirePermission } from "@/lib/auth/context";
import { exportPaymentsCsv } from "@/modules/reports/service";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getTenantContext();
    requirePermission(ctx, "reports:export_csv");

    const csvData = await exportPaymentsCsv(ctx.businessId);

    const filename = `payments-export-${ctx.businessSlug}-${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Export failed";
    return NextResponse.json({ error: msg }, { status: 403 });
  }
}
