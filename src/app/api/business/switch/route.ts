import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession, createSessionToken, setSessionCookie } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetBusinessId } = await req.json();
    if (!targetBusinessId) {
      return NextResponse.json({ error: "targetBusinessId is required" }, { status: 400 });
    }

    // Verify user has an active membership in the target business
    const targetMembership = await prisma.membership.findFirst({
      where: {
        userId: session.userId,
        businessId: targetBusinessId,
        isActive: true,
      },
      include: {
        business: true,
      },
    });

    if (!targetMembership) {
      return NextResponse.json(
        { error: "Access denied: You do not have an active membership in this business" },
        { status: 403 }
      );
    }

    // Generate new session token with the updated active business and role
    const newToken = await createSessionToken({
      userId: session.userId,
      email: session.email,
      name: session.name,
      isPlatformAdmin: session.isPlatformAdmin,
      activeBusinessId: targetMembership.business.id,
      activeRole: targetMembership.role,
    });

    await setSessionCookie(newToken);

    return NextResponse.json({
      success: true,
      activeBusiness: {
        id: targetMembership.business.id,
        name: targetMembership.business.name,
        slug: targetMembership.business.slug,
        role: targetMembership.role,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Switch failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
