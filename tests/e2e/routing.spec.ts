import { expect, test } from "@playwright/test";

const protectedRoutes = [
  "/dashboard",
  "/clients",
  "/sites",
  "/equipment",
  "/maintenance",
  "/maintenance/example-job",
  "/reports",
  "/reports/example-report",
  "/technician/today",
  "/technician/jobs/example-job",
  "/client/dashboard",
  "/client/reports/example-report"
];

test.describe("routing smoke", () => {
  test("health endpoint responds", async ({ request }) => {
    const response = await request.get("/api/health");

    await expect(response).toBeOK();
    await expect(await response.json()).toEqual({
      status: "ok",
      service: "firemaint",
      version: "phase-0"
    });
  });

  test("login page renders", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
  });

  for (const route of protectedRoutes) {
    test(`redirects unauthenticated ${route}`, async ({ page }) => {
      await page.goto(route);

      await expect(page).toHaveURL(new RegExp(`/login\\?next=${encodeURIComponent(route).replace(/%2F/g, "%2F")}$`));
      await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    });
  }
});
