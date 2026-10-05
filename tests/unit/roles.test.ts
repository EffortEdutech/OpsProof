import { describe, expect, it } from "vitest";
import {
  canAccessClientPortal,
  canAccessManagement,
  canAccessTechnician,
  isInternalRole
} from "@/lib/permissions/roles";

describe("role helpers", () => {
  it("keeps management access to internal leadership roles", () => {
    expect(canAccessManagement("OWNER")).toBe(true);
    expect(canAccessManagement("ADMIN")).toBe(true);
    expect(canAccessManagement("SUPERVISOR")).toBe(true);
    expect(canAccessManagement("TECHNICIAN")).toBe(false);
    expect(canAccessManagement("CLIENT")).toBe(false);
  });

  it("allows technicians and management into the field shell", () => {
    expect(canAccessTechnician("TECHNICIAN")).toBe(true);
    expect(canAccessTechnician("ADMIN")).toBe(true);
    expect(canAccessTechnician("CLIENT")).toBe(false);
  });

  it("keeps the client portal client-only", () => {
    expect(canAccessClientPortal("CLIENT")).toBe(true);
    expect(canAccessClientPortal("SUPERVISOR")).toBe(false);
    expect(isInternalRole("CLIENT")).toBe(false);
  });
});
