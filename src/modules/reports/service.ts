import { prisma } from "@/lib/db";
import { generateSafeCsv } from "@/lib/security/formula-injection";
import { paiseToRupees } from "@/lib/money";

export interface ReportDateFilter {
  businessId: string;
  startDate?: Date;
  endDate?: Date;
}

export async function getDashboardKpiMetrics(businessId: string) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const [
    todayAppointments,
    unassignedJobs,
    inProgressJobs,
    pendingQuotations,
    completedJobs,
    invoicesAggregate,
    paymentsAggregate,
  ] = await Promise.all([
    // Today's appointments
    prisma.job.count({
      where: {
        businessId,
        scheduledStartTime: { gte: startOfToday, lte: endOfToday },
        status: { not: "CANCELLED" },
      },
    }),
    // Unassigned jobs
    prisma.job.count({
      where: {
        businessId,
        assignments: { none: {} },
        status: { in: ["SCHEDULED", "EN_ROUTE"] },
      },
    }),
    // In progress jobs
    prisma.job.count({
      where: {
        businessId,
        status: "IN_PROGRESS",
      },
    }),
    // Pending quotations
    prisma.quotation.count({
      where: {
        businessId,
        status: "SENT",
      },
    }),
    // Completed jobs count
    prisma.job.count({
      where: {
        businessId,
        status: "COMPLETED",
      },
    }),
    // Total invoiced revenue and outstanding balance
    prisma.invoice.aggregate({
      where: {
        businessId,
        status: { not: "CANCELLED" },
      },
      _sum: {
        totalPaise: true,
        balancePaise: true,
      },
    }),
    // Collected revenue (actual recorded successful payments)
    prisma.payment.aggregate({
      where: {
        businessId,
        status: "SUCCESS",
      },
      _sum: {
        amountPaise: true,
      },
    }),
  ]);

  return {
    todayAppointments,
    unassignedJobs,
    inProgressJobs,
    pendingQuotations,
    completedJobs,
    invoicedRevenuePaise: invoicesAggregate._sum.totalPaise || 0,
    outstandingRevenuePaise: invoicesAggregate._sum.balancePaise || 0,
    collectedRevenuePaise: paymentsAggregate._sum.amountPaise || 0,
  };
}

export async function getDetailedReports(filter: ReportDateFilter) {
  const dateRange = filter.startDate && filter.endDate ? {
    gte: filter.startDate,
    lte: filter.endDate,
  } : undefined;

  const [jobsByStatus, materialsConsumed, technicianWorkload, payments] = await Promise.all([
    // Jobs grouped by status
    prisma.job.groupBy({
      by: ["status"],
      where: {
        businessId: filter.businessId,
        createdAt: dateRange,
      },
      _count: { id: true },
    }),
    // Stock movements consumed by jobs
    prisma.stockMovement.findMany({
      where: {
        businessId: filter.businessId,
        type: "JOB_CONSUMPTION",
        createdAt: dateRange,
      },
      include: {
        item: true,
        job: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    // Technician workload
    prisma.jobAssignment.findMany({
      where: {
        businessId: filter.businessId,
        createdAt: dateRange,
      },
      include: {
        technician: true,
        job: true,
      },
    }),
    // Collected payments in date range
    prisma.payment.findMany({
      where: {
        businessId: filter.businessId,
        status: "SUCCESS",
        receivedAt: dateRange,
      },
      include: {
        customer: true,
        invoice: true,
      },
      orderBy: { receivedAt: "desc" },
    }),
  ]);

  return {
    jobsByStatus,
    materialsConsumed,
    technicianWorkload,
    payments,
  };
}

/**
 * Exports financial payments report to CSV with spreadsheet formula-injection protection
 */
export async function exportPaymentsCsv(businessId: string): Promise<string> {
  const payments = await prisma.payment.findMany({
    where: {
      businessId,
      status: "SUCCESS",
    },
    include: {
      customer: true,
      invoice: true,
    },
    orderBy: { receivedAt: "desc" },
  });

  const headers = [
    "Payment ID",
    "Date",
    "Invoice Number",
    "Customer Name",
    "Customer Phone",
    "Amount (INR)",
    "Method",
    "Reference",
  ];

  const rows = payments.map((p) => [
    p.id,
    p.receivedAt.toISOString().split("T")[0],
    p.invoice.invoiceNumber,
    p.customer.name,
    p.customer.phone,
    paiseToRupees(p.amountPaise).toFixed(2),
    p.method,
    p.transactionReference || "",
  ]);

  return generateSafeCsv(headers, rows);
}
