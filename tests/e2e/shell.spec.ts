import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("public application shell", () => {
  test("presents an accessible landing page with real destinations", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "See what your broken things could become." }),
    ).toBeVisible();
    await expect(page.getByText("Illustrative preview", { exact: true })).toBeVisible();

    const skipLink = page.getByRole("link", { name: "Skip to main content" });
    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();

    await expect(page.getByRole("link", { name: "Demo dashboard", exact: true })).toHaveAttribute(
      "href",
      "/demo",
    );
    await expect(page.getByRole("banner").getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/sign-in",
    );

    await expectNoA11yViolations(page);
    expect(await hasNoHorizontalOverflow(page)).toBe(true);

    const demoLink = page.getByRole("link", { name: "Demo dashboard", exact: true });
    await demoLink.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/demo$/);
  });

  test("labels all dashboard content as public fixture data", async ({ page }) => {
    await page.goto("/demo");

    await expect(page.getByText("Public product preview.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Illustrative projects" })).toBeVisible();
    await expect(page.getByText("Sample project")).toHaveCount(3);
    await expect(page.getByRole("button", { name: "New project in M4" })).toBeDisabled();
    await expectNoA11yViolations(page);
    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });

  test("offers active sign-in and registration forms", async ({ page }) => {
    await page.goto("/sign-in");

    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible();
    await expect(page.locator("#sign-in-email")).toBeEnabled();
    await expect(page.locator("#sign-in-password")).toBeEnabled();
    await expect(page.locator("#register-email")).toBeEnabled();
    await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Create private account" })).toBeEnabled();
    await expectNoA11yViolations(page);
    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });

  test("redirects a signed-out visitor away from the private dashboard", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/sign-in\?next=%2Fdashboard$/);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });

  test("rejects an unauthenticated account export", async ({ request }) => {
    const response = await request.get("/api/account/export");

    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ error: "Authentication required" });
  });
});

async function expectNoA11yViolations(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
}

async function hasNoHorizontalOverflow(page: import("@playwright/test").Page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  );
}
