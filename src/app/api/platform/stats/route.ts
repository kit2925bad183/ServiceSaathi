import { NextRequest, NextResponse } from "next/server";
import { getTenantContext, requirePlatformAdmin } from "@/lib/auth/context";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getTenantContext();
    requirePlatformAdmin(ctx);

    const [
      businesses,
      subscriptions,
      outboxPendingCount,
      outboxFailedCount,
      recentAuditEvents,
      contactRequestsCount,
    ] = await Promise.all([
      prisma.business.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          city: true,
          state: true,
          phone: true,
          email: true,
          isVerified: true,
          createdAt: true,
          _count: {
            select: {
              memberships: true,
              jobs: true,
              invoices: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.subscription.findMany({
        include: {
          business: {
            select: { name: true, slug: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.outboxEvent.count({
        where: { status: "PENDING" },
      }),
      prisma.outboxEvent.count({
        where: { status: "FAILED" },
      }),
      prisma.auditEvent.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          business: { select: { name: true, slug: true } },
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.contactRequest.count(),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalBusinesses: businesses.length,
        verifiedBusinesses: businesses.filter((b) => b.isVerified).length,
        outboxPendingCount,
        outboxFailedCount,
        contactRequestsCount,
      },
      businesses,
      subscriptions,
      recentAuditEvents,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Access denied";
    const status = msg.includes("FORBIDDEN") ? 403 : msg.includes("UNAUTHORIZED") ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
