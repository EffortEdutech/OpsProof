import type { AppRole } from "@/lib/supabase/types";

export type UserRole = AppRole;

const managementRoles = new Set<UserRole>(["OWNER", "ADMIN", "SUPERVISOR"]);

export function canAccessManagement(role: UserRole) {
  return managementRoles.has(role);
}

export function canAccessTechnician(role: UserRole) {
  return role === "TECHNICIAN" || managementRoles.has(role);
}

export function canAccessClientPortal(role: UserRole) {
  return role === "CLIENT";
}

export function isInternalRole(role: UserRole) {
  return role !== "CLIENT";
}
