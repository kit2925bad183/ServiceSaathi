import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getTenantContext, requirePermission } from "@/lib/auth/context";
import { BookingStatus, JobStatus, PaymentStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getTenantContext();
    requirePermission(ctx, "reports:view");

    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    let dateFilter: { gte?: Date; lte?: Date } | undefined;
    if (startDateParam && endDateParam) {
      dateFilter = {
        gte: new Date(startDateParam),
        lte: new Date(endDateParam),
      };
    }

    const [
      bookingsTotal,
      bookingsAccepted,
      jobsCompleted,
      jobsCancelled,
      invoicesAggregate,
      paymentsAggregate,
      repeatCustomersCount,
      workerWorkload,
      servicesWithRevenue,
    ] = await Promise.all([
      // Bookings received
      prisma.booking.count({
        where: { businessId: ctx.businessId, ...(dateFilter ? { createdAt: dateFilter } : {}) },
      }),
      // Bookings accepted
      prisma.booking.count({
        where: {
          businessId: ctx.businessId,
          status: BookingStatus.CONFIRMED,
          ...(dateFilter ? { createdAt: dateFilter } : {}),
        },
      }),
      // Jobs completed
      prisma.job.count({
        where: {
          businessId: ctx.businessId,
          status: JobStatus.COMPLETED,
          ...(dateFilter ? { updatedAt: dateFilter } : {}),
        },
      }),
      // Jobs cancelled
      prisma.job.count({
        where: {
          businessId: ctx.businessId,
          status: JobStatus.CANCELLED,
          ...(dateFilter ? { updatedAt: dateFilter } : {}),
        },
      }),
      // Outstanding balance
      prisma.invoice.aggregate({
        where: {
          businessId: ctx.businessId,
          status: { not: "CANCELLED" },
          ...(dateFilter ? { issueDate: dateFilter } : {}),
        },
        _sum: { balancePaise: true, totalPaise: true },
      }),
      // Collected payments
      prisma.payment.aggregate({
        where: {
          businessId: ctx.businessId,
          status: PaymentStatus.SUCCESS,
          ...(dateFilter ? { receivedAt: dateFilter } : {}),
        },
        _sum: { amountPaise: true },
      }),
      // Repeat customers (customers with count of jobs > 1)
      prisma.customer.count({
        where: {
          businessId: ctx.businessId,
          jobs: { some: {} },
        },
      }),
      // Worker workload
      prisma.jobAssignment.groupBy({
        by: ["userId"],
        where: { businessId: ctx.businessId },
        _count: { jobId: true },
      }),
      // Service revenue breakdown
      prisma.job.findMany({
        where: {
          businessId: ctx.businessId,
          status: JobStatus.COMPLETED,
        },
        include: {
          service: { select: { name: true, categoryId: true, basePricePaise: true } },
        },
      }),
    ]);

    // Aggregate revenue by category
    const revenueByCategory: Record<string, number> = {};
    for (const job of servicesWithRevenue) {
      const category = job.service.categoryId || "General";
      revenueByCategory[category] =
        (revenueByCategory[category] || 0) + (job.service.basePricePaise || 0);
    }

    return NextResponse.json({
      timezone: ctx.timezone,
      metrics: {
        bookingsReceived: bookingsTotal,
        bookingsAccepted,
        jobsCompleted,
        jobsCancelled,
        collectedPaymentsPaise: paymentsAggregate._sum.amountPaise || 0,
        outstandingBalancePaise: invoicesAggregate._sum.balancePaise || 0,
        totalInvoicedPaise: invoicesAggregate._sum.totalPaise || 0,
        repeatCustomers: repeatCustomersCount,
        revenueByCategory,
        workerWorkload,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load report metrics";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
