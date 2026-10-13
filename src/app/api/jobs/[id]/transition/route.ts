import { NextRequest, NextResponse } from "next/server";
import { getTenantContext, requirePermission } from "@/lib/auth/context";
import { jobStatusTransitionSchema } from "@/lib/validation";
import { transitionJobStatus } from "@/modules/jobs/service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ctx = await getTenantContext();
    requirePermission(ctx, "jobs:update_status");

    const body = await req.json();
    const validated = jobStatusTransitionSchema.parse({
      ...body,
      jobId: id,
    });

    const updatedJob = await transitionJobStatus({
      businessId: ctx.businessId,
      jobId: id,
      actorUserId: ctx.userId,
      targetStatus: validated.targetStatus,
      completionNotes: validated.notes,
      checklistResponses: validated.checklistResponses,
      materialsConsumed: validated.materialsConsumed,
    });

    return NextResponse.json({
      success: true,
      job: updatedJob,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to transition job status";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
