import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/health/route";

describe("health route", () => {
  it("returns the phase 0 health payload", async () => {
    const response = GET();
    await expect(response.json()).resolves.toEqual({
      status: "ok",
      service: "firemaint",
      version: "phase-0"
    });
  });
});
