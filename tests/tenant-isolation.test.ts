import { describe, it, expect } from "vitest";
import { hasPermission, assertPermission } from "../src/lib/auth/permissions";
import { Role } from "@prisma/client";

describe("Tenant Isolation and RBAC Permission Matrix", () => {
  it("allows Business Owner full administrative authority", () => {
    expect(hasPermission(Role.OWNER, "business:manage")).toBe(true);
    expect(hasPermission(Role.OWNER, "business:settings")).toBe(true);
    expect(hasPermission(Role.OWNER, "staff:invite")).toBe(true);
    expect(hasPermission(Role.OWNER, "invoices:create")).toBe(true);
    expect(hasPermission(Role.OWNER, "payments:record")).toBe(true);
    expect(hasPermission(Role.OWNER, "reports:export_csv")).toBe(true);
  });

  it("restricts Dispatchers from sensitive business settings and CSV exports", () => {
    expect(hasPermission(Role.DISPATCHER, "bookings:manage")).toBe(true);
    expect(hasPermission(Role.DISPATCHER, "jobs:assign")).toBe(true);
    expect(hasPermission(Role.DISPATCHER, "invoices:create")).toBe(true);

    // Forbidden to Dispatcher:
    expect(hasPermission(Role.DISPATCHER, "business:settings")).toBe(false);
    expect(hasPermission(Role.DISPATCHER, "staff:invite")).toBe(false);
    expect(hasPermission(Role.DISPATCHER, "reports:export_csv")).toBe(false);
    expect(hasPermission(Role.DISPATCHER, "audit:view")).toBe(false);
  });

  it("strictly limits Technician to assigned jobs and checklists", () => {
    expect(hasPermission(Role.TECHNICIAN, "jobs:view_assigned")).toBe(true);
    expect(hasPermission(Role.TECHNICIAN, "checklist:submit")).toBe(true);
    expect(hasPermission(Role.TECHNICIAN, "jobs:update_status")).toBe(true);

    // Forbidden to Technician:
    expect(hasPermission(Role.TECHNICIAN, "jobs:assign")).toBe(false);
    expect(hasPermission(Role.TECHNICIAN, "invoices:create")).toBe(false);
    expect(hasPermission(Role.TECHNICIAN, "payments:record")).toBe(false);
    expect(hasPermission(Role.TECHNICIAN, "inventory:manage")).toBe(false);
    expect(hasPermission(Role.TECHNICIAN, "reports:view")).toBe(false);
    expect(hasPermission(Role.TECHNICIAN, "business:settings")).toBe(false);
  });

  it("assertPermission throws explicit Forbidden error for missing permission", () => {
    expect(() => {
      assertPermission(Role.TECHNICIAN, "invoices:create");
    }).toThrowError(/Forbidden/);
  });

  it("assertPermission succeeds without throwing when role possesses permission", () => {
    expect(() => {
      assertPermission(Role.OWNER, "invoices:create");
    }).not.toThrow();
  });
});
