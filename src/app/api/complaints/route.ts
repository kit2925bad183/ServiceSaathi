import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getTenantContext, requirePermission } from "@/lib/auth/context";
import { ComplaintStatus, JobStatus } from "@prisma/client";

// GET: List complaints (Owner / Dispatcher workspace)
export async function GET(req: NextRequest) {
  try {
    const ctx = await getTenantContext();
    requirePermission(ctx, "jobs:view_all");

    const complaints = await prisma.complaint.findMany({
      where: { businessId: ctx.businessId },
      include: {
        job: {
          select: {
            id: true,
            jobNumber: true,
            title: true,
            status: true,
            service: { select: { name: true } },
          },
        },
        customer: {
          select: { id: true, name: true, phone: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ complaints });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load complaints";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

// POST: Raise a complaint (Customer or Dispatcher)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessId, jobId, customerPhone, title, description } = body;

    if (!jobId || !title || !description) {
      return NextResponse.json(
        { error: "jobId, title, and description are required" },
        { status: 400 }
      );
    }

    // Verify job belongs to business
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { customer: true, business: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Linked job not found" }, { status: 404 });
    }

    // Generate unique complaint number
    const count = await prisma.complaint.count({ where: { businessId: job.businessId } });
    const complaintNumber = `CMP-${new Date().getFullYear()}-${1001 + count}`;

    const complaint = await prisma.complaint.create({
      data: {
        businessId: job.businessId,
        jobId: job.id,
        customerId: job.customerId,
        complaintNumber,
        title,
        description,
        status: ComplaintStatus.OPEN,
      },
    });

    return NextResponse.json({
      success: true,
      complaintNumber: complaint.complaintNumber,
      complaint,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to register complaint";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

// PATCH: Update complaint resolution & warranty decisions (Owner / Dispatcher)
export async function PATCH(req: NextRequest) {
  try {
    const ctx = await getTenantContext();
    requirePermission(ctx, "jobs:assign");

    const body = await req.json();
    const { complaintId, status, resolutionNotes } = body;

    if (!complaintId) {
      return NextResponse.json({ error: "complaintId is required" }, { status: 400 });
    }

    const complaint = await prisma.complaint.findFirst({
      where: { id: complaintId, businessId: ctx.businessId },
    });

    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
    }

    const updated = await prisma.complaint.update({
      where: { id: complaint.id },
      data: {
        ...(status ? { status: status as ComplaintStatus } : {}),
        ...(resolutionNotes ? { resolutionNotes } : {}),
      },
    });

    // Record audit event
    await prisma.auditEvent.create({
      data: {
        businessId: ctx.businessId,
        userId: ctx.userId,
        action: "COMPLAINT_UPDATED",
        entityType: "Complaint",
        entityId: complaint.id,
        metadata: JSON.stringify({ status, resolutionNotes }),
      },
    });

    return NextResponse.json({ success: true, complaint: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
