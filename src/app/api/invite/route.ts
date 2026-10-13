import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { InvitationStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";

// GET: Inspect invitation status and business details
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: {
      business: {
        select: { id: true, name: true, city: true, state: true },
      },
    },
  });

  if (!invitation) {
    return NextResponse.json({ error: "Invalid invitation link" }, { status: 404 });
  }

  if (invitation.status !== InvitationStatus.PENDING) {
    return NextResponse.json(
      { error: `This invitation has already been ${invitation.status.toLowerCase()}` },
      { status: 400 }
    );
  }

  if (invitation.expiresAt < new Date()) {
    return NextResponse.json({ error: "This invitation link has expired" }, { status: 400 });
  }

  return NextResponse.json({
    email: invitation.email,
    role: invitation.role,
    businessName: invitation.business.name,
    businessCity: invitation.business.city,
    expiresAt: invitation.expiresAt,
  });
}

// POST: Accept invitation and activate membership
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, name, password } = body;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { business: true },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invalid invitation link" }, { status: 404 });
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      return NextResponse.json(
        { error: `This invitation has already been ${invitation.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: "This invitation link has expired" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Find or create user
      let user = await tx.user.findUnique({
        where: { email: invitation.email.toLowerCase() },
      });

      if (!user) {
        if (!name || !password) {
          throw new Error("Name and password are required to create your staff account");
        }
        const passwordHash = await bcrypt.hash(password, 10);
        user = await tx.user.create({
          data: {
            email: invitation.email.toLowerCase(),
            name,
            phone: invitation.phone || null,
            passwordHash,
          },
        });
      }

      // Check if membership already exists
      const existingMembership = await tx.membership.findUnique({
        where: {
          userId_businessId: {
            userId: user.id,
            businessId: invitation.businessId,
          },
        },
      });

      if (existingMembership) {
        // Reactivate if inactive
        await tx.membership.update({
          where: { id: existingMembership.id },
          data: { role: invitation.role, isActive: true },
        });
      } else {
        // Create membership
        await tx.membership.create({
          data: {
            userId: user.id,
            businessId: invitation.businessId,
            role: invitation.role,
            isActive: true,
          },
        });
      }

      // Mark invitation as single-use accepted
      await tx.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.ACCEPTED },
      });

      return { user, business: invitation.business, role: invitation.role };
    });

    // Create session and set cookie
    const sessionToken = await createSessionToken({
      userId: result.user.id,
      email: result.user.email,
      name: result.user.name,
      isPlatformAdmin: false,
      activeBusinessId: result.business.id,
      activeRole: result.role,
    });

    await setSessionCookie(sessionToken);

    return NextResponse.json({
      success: true,
      businessName: result.business.name,
      role: result.role,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Acceptance failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
