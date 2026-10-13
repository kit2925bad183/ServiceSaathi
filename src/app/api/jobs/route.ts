import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getTenantContext, requirePermission } from "@/lib/auth/context";
import { Role, JobStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getTenantContext();
    if (ctx.role === Role.TECHNICIAN) {
      requirePermission(ctx, "jobs:view_assigned");
    } else {
      requirePermission(ctx, "jobs:view_all");
    }

    const { searchParams } = new URL(req.url);
    const technicianId = searchParams.get("technicianId");
    const status = searchParams.get("status");
    const dateStr = searchParams.get("date"); // YYYY-MM-DD

    // Technician role can ONLY view assigned jobs
    const isTechnician = ctx.role === Role.TECHNICIAN;

    let dateFilter: { gte?: Date; lte?: Date } | undefined;
    if (dateStr) {
      const d = new Date(dateStr);
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));
      dateFilter = { gte: startOfDay, lte: endOfDay };
    }

    const [allJobs, unassignedJobs, technicians] = await Promise.all([
      prisma.job.findMany({
        where: {
          businessId: ctx.businessId,
          ...(isTechnician ? { assignments: { some: { userId: ctx.userId } } } : {}),
          ...(technicianId && !isTechnician
            ? { assignments: { some: { userId: technicianId } } }
            : {}),
          ...(status ? { status: status as JobStatus } : {}),
          ...(dateFilter ? { scheduledStartTime: dateFilter } : {}),
        },
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          service: { select: { id: true, name: true, pricingType: true, basePricePaise: true } },
          assignments: {
            include: {
              technician: { select: { id: true, name: true, email: true } },
            },
          },
          quotations: {
            select: { id: true, quotationNumber: true, status: true, totalPaise: true },
          },
          invoices: {
            select: { id: true, invoiceNumber: true, status: true, balancePaise: true },
          },
        },
        orderBy: { scheduledStartTime: "asc" },
      }),

      // Unassigned pending jobs (if owner/dispatcher)
      !isTechnician
        ? prisma.job.findMany({
            where: {
              businessId: ctx.businessId,
              assignments: { none: {} },
              status: { in: [JobStatus.SCHEDULED, JobStatus.EN_ROUTE] },
            },
            include: {
              customer: { select: { name: true, phone: true } },
              service: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
          })
        : [],

      // Available technicians roster
      !isTechnician
        ? prisma.membership.findMany({
            where: {
              businessId: ctx.businessId,
              role: Role.TECHNICIAN,
              isActive: true,
            },
            include: {
              user: {
                select: { id: true, name: true, phone: true },
              },
            },
          })
        : [],
    ]);

    return NextResponse.json({
      jobs: allJobs,
      unassignedJobs,
      technicians: technicians.map((t) => ({
        id: t.userId,
        name: t.user.name,
        phone: t.user.phone,
      })),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load jobs";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
