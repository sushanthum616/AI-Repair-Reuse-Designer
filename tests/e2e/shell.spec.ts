import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("M2 application shell", () => {
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
      "/dashboard",
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
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("labels all dashboard content as public fixture data", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page.getByText("Public product preview.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Illustrative projects" })).toBeVisible();
    await expect(page.getByText("Sample project")).toHaveCount(3);
    await expect(page.getByRole("button", { name: "New project in M4" })).toBeDisabled();
    await expectNoA11yViolations(page);
    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });

  test("keeps the sign-in preview non-submitting", async ({ page }) => {
    await page.goto("/sign-in");

    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await expect(page.getByLabel("Email address")).toBeDisabled();
    await expect(page.getByLabel("Password")).toBeDisabled();
    await expect(page.getByRole("button", { name: "Authentication arrives in M3" })).toBeDisabled();
    await expect(page.locator("form")).toHaveCount(0);
    await expectNoA11yViolations(page);
    expect(await hasNoHorizontalOverflow(page)).toBe(true);
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
