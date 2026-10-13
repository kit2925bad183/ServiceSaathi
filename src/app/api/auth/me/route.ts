import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      memberships: {
        where: { isActive: true },
        include: { business: true },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isPlatformAdmin: user.isPlatformAdmin,
    },
    memberships: user.memberships.map((m) => ({
      businessId: m.businessId,
      businessName: m.business.name,
      businessSlug: m.business.slug,
      role: m.role,
    })),
    activeBusinessId: session.activeBusinessId || user.memberships[0]?.businessId,
  });
}
