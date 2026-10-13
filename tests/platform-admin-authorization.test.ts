import { describe, it, expect } from "vitest";
import { requirePlatformAdmin, TenantContext } from "../src/lib/auth/context";
import { Role } from "@prisma/client";

describe("Platform Administration Authorization & Tenant Boundary", () => {
  const standardOwnerCtx: TenantContext = {
    userId: "u-owner-1",
    email: "rajesh@coolbreeze.in",
    name: "Rajesh Kumar",
    businessId: "biz-coolbreeze-1",
    businessSlug: "coolbreeze",
    businessName: "CoolBreeze Climate Solutions",
    currency: "INR",
    timezone: "Asia/Kolkata",
    role: Role.OWNER,
    isPlatformAdmin: false,
  };

  const platformAdminCtx: TenantContext = {
    ...standardOwnerCtx,
    isPlatformAdmin: true,
  };

  it("strictly forbids regular business owners from accessing platform administration", () => {
    expect(() => {
      requirePlatformAdmin(standardOwnerCtx);
    }).toThrowError(/FORBIDDEN: Platform administrator authority required/);
  });

  it("permits verified platform administrators", () => {
    expect(() => {
      requirePlatformAdmin(platformAdminCtx);
    }).not.toThrow();
  });

  it("forbids dispatchers and technicians from platform admin operations", () => {
    const dispatcherCtx: TenantContext = {
      ...standardOwnerCtx,
      role: Role.DISPATCHER,
      isPlatformAdmin: false,
    };
    const technicianCtx: TenantContext = {
      ...standardOwnerCtx,
      role: Role.TECHNICIAN,
      isPlatformAdmin: false,
    };

    expect(() => requirePlatformAdmin(dispatcherCtx)).toThrowError(/FORBIDDEN/);
    expect(() => requirePlatformAdmin(technicianCtx)).toThrowError(/FORBIDDEN/);
  });
});
