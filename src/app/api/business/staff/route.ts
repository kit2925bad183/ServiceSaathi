import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getTenantContext, requirePermission } from "@/lib/auth/context";
import { Role, InvitationStatus } from "@prisma/client";
import crypto from "crypto";

// GET: List staff and invitations for the business
export async function GET(req: NextRequest) {
  try {
    const ctx = await getTenantContext();
    requirePermission(ctx, "staff:view");

    const [memberships, invitations] = await Promise.all([
      prisma.membership.findMany({
        where: { businessId: ctx.businessId },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.invitation.findMany({
        where: { businessId: ctx.businessId, status: InvitationStatus.PENDING },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      memberships: memberships.map((m) => ({
        id: m.id,
        userId: m.userId,
        name: m.user.name,
        email: m.user.email,
        phone: m.user.phone,
        role: m.role,
        isActive: m.isActive,
        joinedAt: m.joinedAt,
      })),
      invitations: invitations.map((inv) => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        status: inv.status,
        expiresAt: inv.expiresAt,
        token: inv.token,
      })),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch staff";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

// POST: Create staff invitation
export async function POST(req: NextRequest) {
  try {
    const ctx = await getTenantContext();
    requirePermission(ctx, "staff:invite");

    const body = await req.json();
    const { email, role, phone } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }

    const assignedRole: Role = role === "DISPATCHER" ? Role.DISPATCHER : Role.TECHNICIAN;

    // Check if user is already a member
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      const existingMembership = await prisma.membership.findUnique({
        where: {
          userId_businessId: {
            userId: existingUser.id,
            businessId: ctx.businessId,
          },
        },
      });

      if (existingMembership) {
        return NextResponse.json(
          { error: "User is already a member of this business workspace" },
          { status: 400 }
        );
      }
    }

    // Generate single-use invitation token with 7-day expiration
    const token = `inv_${crypto.randomBytes(24).toString("hex")}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = await prisma.invitation.create({
      data: {
        businessId: ctx.businessId,
        email: email.toLowerCase().trim(),
        phone: phone || null,
        role: assignedRole,
        token,
        expiresAt,
        status: InvitationStatus.PENDING,
        invitedByUserId: ctx.userId,
      },
    });

    const inviteUrl = `${process.env.APP_URL || "http://localhost:3000"}/invite/${token}`;

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        inviteUrl,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Invitation failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

// PATCH: Update member role or suspend/activate membership
// Enforces last active owner protection rule
export async function PATCH(req: NextRequest) {
  try {
    const ctx = await getTenantContext();
    requirePermission(ctx, "business:manage");

    const body = await req.json();
    const { membershipId, newRole, isActive } = body;

    if (!membershipId) {
      return NextResponse.json({ error: "membershipId is required" }, { status: 400 });
    }

    const targetMembership = await prisma.membership.findFirst({
      where: { id: membershipId, businessId: ctx.businessId },
    });

    if (!targetMembership) {
      return NextResponse.json({ error: "Membership not found in workspace" }, { status: 404 });
    }

    // Protection rule: Check if this action would demote or deactivate the last active owner
    if (targetMembership.role === Role.OWNER && (newRole !== Role.OWNER || isActive === false)) {
      const activeOwnerCount = await prisma.membership.count({
        where: {
          businessId: ctx.businessId,
          role: Role.OWNER,
          isActive: true,
        },
      });

      if (activeOwnerCount <= 1) {
        return NextResponse.json(
          {
            error:
              "ACTION BLOCKED: Cannot demote or suspend the last active business owner. Promote another member to OWNER first.",
          },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.membership.update({
      where: { id: targetMembership.id },
      data: {
        ...(newRole ? { role: newRole as Role } : {}),
        ...(typeof isActive === "boolean" ? { isActive } : {}),
      },
    });

    return NextResponse.json({ success: true, membership: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
