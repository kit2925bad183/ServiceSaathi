import { Role } from "@prisma/client";

export type Permission =
  | "business:manage"
  | "business:settings"
  | "staff:invite"
  | "staff:view"
  | "services:manage"
  | "customers:create"
  | "customers:read"
  | "customers:update"
  | "bookings:manage"
  | "jobs:create"
  | "jobs:assign"
  | "jobs:view_all"
  | "jobs:view_assigned"
  | "jobs:update_status"
  | "checklist:submit"
  | "quotations:create"
  | "quotations:view"
  | "quotations:send"
  | "invoices:create"
  | "invoices:view"
  | "payments:record"
  | "inventory:view"
  | "inventory:manage"
  | "reports:view"
  | "reports:export_csv"
  | "audit:view";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  OWNER: [
    "business:manage",
    "business:settings",
    "staff:invite",
    "staff:view",
    "services:manage",
    "customers:create",
    "customers:read",
    "customers:update",
    "bookings:manage",
    "jobs:create",
    "jobs:assign",
    "jobs:view_all",
    "jobs:view_assigned",
    "jobs:update_status",
    "checklist:submit",
    "quotations:create",
    "quotations:view",
    "quotations:send",
    "invoices:create",
    "invoices:view",
    "payments:record",
    "inventory:view",
    "inventory:manage",
    "reports:view",
    "reports:export_csv",
    "audit:view",
  ],
  DISPATCHER: [
    "staff:view",
    "customers:create",
    "customers:read",
    "customers:update",
    "bookings:manage",
    "jobs:create",
    "jobs:assign",
    "jobs:view_all",
    "jobs:view_assigned",
    "jobs:update_status",
    "checklist:submit",
    "quotations:create",
    "quotations:view",
    "quotations:send",
    "invoices:create",
    "invoices:view",
    "payments:record",
    "inventory:view",
    "reports:view",
  ],
  TECHNICIAN: [
    "customers:read",
    "jobs:view_assigned",
    "jobs:update_status",
    "checklist:submit",
    "quotations:view",
    "inventory:view",
  ],
};

export function hasPermission(role: Role | undefined, permission: Permission): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

export function assertPermission(role: Role | undefined, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Forbidden: Role '${role || "NONE"}' lacks permission '${permission}'`);
  }
}
