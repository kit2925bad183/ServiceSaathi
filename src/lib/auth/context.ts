import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { Role } from "@prisma/client";
import { Permission, hasPermission } from "@/lib/auth/permissions";

export interface TenantContext {
  userId: string;
  email: string;
  name: string;
  businessId: string;
  businessSlug: string;
  businessName: string;
  currency: string;
  timezone: string;
  role: Role;
  isPlatformAdmin: boolean;
}

/**
 * Validates and retrieves the tenant context for the currently authenticated request.
 * Strictly derives the active business from verified database memberships.
 * Never trusts any client-supplied business ID.
 */
export async function getTenantContext(preferredBusinessId?: string): Promise<TenantContext> {
  const session = await getSession();
  if (!session || !session.userId) {
    throw new Error("UNAUTHORIZED: Active session required");
  }

  // Find all active memberships for the user
  const memberships = await prisma.membership.findMany({
    where: {
      userId: session.userId,
      isActive: true,
    },
    include: {
      business: true,
    },
  });

  if (!memberships || memberships.length === 0) {
    throw new Error("NO_MEMBERSHIP: User does not belong to any active business workspace");
  }

  // Determine active membership
  let activeMembership = memberships[0];

  const targetId = preferredBusinessId || session.activeBusinessId;
  if (targetId) {
    const matched = memberships.find((m) => m.businessId === targetId);
    if (matched) {
      activeMembership = matched;
    }
  }

  return {
    userId: session.userId,
    email: session.email,
    name: session.name,
    businessId: activeMembership.business.id,
    businessSlug: activeMembership.business.slug,
    businessName: activeMembership.business.name,
    currency: activeMembership.business.currency,
    timezone: activeMembership.business.timezone,
    role: activeMembership.role,
    isPlatformAdmin: session.isPlatformAdmin,
  };
}

/**
 * Assert that the tenant context has a specific permission.
 */
export function requirePermission(ctx: TenantContext, permission: Permission): void {
  if (!hasPermission(ctx.role, permission)) {
    throw new Error(`FORBIDDEN: Role '${ctx.role}' does not have permission '${permission}'`);
  }
}

/**
 * Assert that the tenant context has platform administrator authority.
 */
export function requirePlatformAdmin(ctx: TenantContext): void {
  if (!ctx.isPlatformAdmin) {
    throw new Error("FORBIDDEN: Platform administrator authority required");
  }
}

