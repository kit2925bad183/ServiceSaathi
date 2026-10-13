import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getTenantContext, requirePermission } from "@/lib/auth/context";
import { queueOutboxEvent } from "@/lib/queue/outbox";
import { AssignmentRole, JobStatus } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getTenantContext();
    requirePermission(ctx, "jobs:assign");

    const { id: jobId } = await params;
    const body = await req.json();
    const {
      technicianUserId,
      scheduledStartTime,
      scheduledEndTime,
      role = "LEAD",
      notes,
    } = body;

    if (!technicianUserId) {
      return NextResponse.json({ error: "technicianUserId is required" }, { status: 400 });
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Fetch job ensuring business scope
      const job = await tx.job.findFirst({
        where: { id: jobId, businessId: ctx.businessId },
        include: { service: true, customer: true },
      });

      if (!job) {
        return NextResponse.json({ error: "Job not found in workspace" }, { status: 404 });
      }

      // 2. Fetch technician membership ensuring active technician in this business
      const technicianMembership = await tx.membership.findFirst({
        where: {
          userId: technicianUserId,
          businessId: ctx.businessId,
          isActive: true,
        },
        include: { user: true },
      });

      if (!technicianMembership) {
        return NextResponse.json(
          { error: "Assigned technician is not an active member of this business" },
          { status: 400 }
        );
      }

      // Determine times
      const startTime = scheduledStartTime
        ? new Date(scheduledStartTime)
        : job.scheduledStartTime;
      const endTime = scheduledEndTime
        ? new Date(scheduledEndTime)
        : job.scheduledEndTime;

      // 3. Server-side Conflict Enforcement: Check if worker has overlapping job
      const conflictingAssignments = await tx.jobAssignment.findMany({
        where: {
          businessId: ctx.businessId,
          userId: technicianUserId,
          jobId: { not: job.id },
          job: {
            status: { in: [JobStatus.SCHEDULED, JobStatus.EN_ROUTE, JobStatus.IN_PROGRESS] },
            // Overlap condition: jobStart < proposedEnd AND jobEnd > proposedStart
            scheduledStartTime: { lt: endTime },
            scheduledEndTime: { gt: startTime },
          },
        },
        include: {
          job: true,
        },
      });

      if (conflictingAssignments.length > 0) {
        const conflict = conflictingAssignments[0];
        return NextResponse.json(
          {
            error: `SCHEDULING CONFLICT: ${technicianMembership.user.name} is already assigned to ${conflict.job.jobNumber} (${conflict.job.title}) between ${conflict.job.scheduledStartTime.toISOString().substring(11, 16)} and ${conflict.job.scheduledEndTime.toISOString().substring(11, 16)}.`,
            conflict: {
              jobNumber: conflict.job.jobNumber,
              title: conflict.job.title,
              startTime: conflict.job.scheduledStartTime,
              endTime: conflict.job.scheduledEndTime,
            },
          },
          { status: 409 }
        );
      }

      // 4. Update Job schedule and status
      const updatedJob = await tx.job.update({
        where: { id: job.id },
        data: {
          scheduledStartTime: startTime,
          scheduledEndTime: endTime,
          status: JobStatus.SCHEDULED,
        },
      });

      // 5. Upsert Job Assignment
      const existingAssignment = await tx.jobAssignment.findFirst({
        where: { jobId: job.id, businessId: ctx.businessId },
      });

      let assignment;
      if (existingAssignment) {
        assignment = await tx.jobAssignment.update({
          where: { id: existingAssignment.id },
          data: {
            userId: technicianUserId,
            role: role as AssignmentRole,
            notes: notes || existingAssignment.notes,
          },
        });
      } else {
        assignment = await tx.jobAssignment.create({
          data: {
            jobId: job.id,
            businessId: ctx.businessId,
            userId: technicianUserId,
            role: role as AssignmentRole,
            notes: notes || null,
          },
        });
      }

      // 6. Record Audit Event
      await tx.auditEvent.create({
        data: {
          businessId: ctx.businessId,
          userId: ctx.userId,
          action: "JOB_ASSIGNED",
          entityType: "Job",
          entityId: job.id,
          metadata: JSON.stringify({
            assignedTo: technicianMembership.user.name,
            startTime,
            endTime,
          }),
        },
      });

      // 7. Queue Outbox Event for SMS / WhatsApp / Email
      await queueOutboxEvent(tx, {
        businessId: ctx.businessId,
        eventType: "JOB_ASSIGNED",
        aggregateType: "Job",
        aggregateId: job.id,
        payload: {
          technicianName: technicianMembership.user.name,
          technicianEmail: technicianMembership.user.email,
          technicianPhone: technicianMembership.user.phone,
          jobNumber: job.jobNumber,
          scheduledTime: startTime.toISOString(),
          customerName: job.customer.name,
          customerPhone: job.customer.phone,
        },
      });

      return NextResponse.json({
        success: true,
        job: updatedJob,
        assignment,
        technicianName: technicianMembership.user.name,
      });
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Assignment failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
