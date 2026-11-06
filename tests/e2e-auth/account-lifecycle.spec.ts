import { expect, test, type APIRequestContext } from "@playwright/test";

const mailpitURL = process.env.SUPABASE_MAILPIT_URL ?? "http://127.0.0.1:54324";

test("registers, confirms, recovers, exports, and deletes an account", async ({
  browser,
  page,
  request,
}) => {
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const email = `m3-e2e-${nonce}@example.test`;
  const originalPassword = "Repair1234!";
  const replacementPassword = "Reuse5678!";

  await clearMailpit(request);
  await page.goto("/sign-in");
  await page.locator("#display-name").fill("M3 Browser Test");
  await page.locator("#register-email").fill(email);
  await page.locator("#register-password").fill(originalPassword);
  await page.getByRole("button", { name: "Create private account" }).click();
  await expect(page.getByRole("status")).toContainText("Check your email");

  const confirmationLink = await waitForAuthLink(request, email, "signup");
  await page.goto(confirmationLink);
  await expect(page).toHaveURL(/\/dashboard(?:\?|$)/);
  await expect(page.getByRole("heading", { name: "Your repair projects" })).toBeVisible();
  await expect(page.getByText("M3 Browser Test")).toBeVisible();

  await page.goto("/update-password");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Your repair projects" })).toBeVisible();

  const replayContext = await browser.newContext();
  const replayPage = await replayContext.newPage();
  await replayPage.goto(confirmationLink);
  await replayPage.goto("/dashboard");
  await expect(replayPage).toHaveURL(/\/sign-in\?next=%2Fdashboard$/);
  await replayContext.close();

  const exportResponse = await page.request.get("/api/account/export");
  expect(exportResponse.status()).toBe(200);
  expect(exportResponse.headers()["cache-control"]).toContain("no-store");
  expect(exportResponse.headers()["content-disposition"]).toMatch(
    /attachment; filename="repair-reuse-export-\d{4}-\d{2}-\d{2}\.json"/,
  );
  const exported = await exportResponse.json();
  expect(exported).toMatchObject({
    version: 1,
    profile: { display_name: "M3 Browser Test" },
    projects: [],
  });

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/$/);
  await clearMailpit(request);

  await page.goto("/forgot-password");
  await page.getByLabel("Email address").fill(email);
  await page.getByRole("button", { name: "Send recovery link" }).click();
  await expect(page.getByRole("status")).toContainText("If an account matches");

  const recoveryLink = await waitForAuthLink(request, email, "recovery");
  await page.goto(recoveryLink);
  await expect(page).toHaveURL(/\/update-password(?:\?|$)/);
  await page.getByLabel("New password").fill(replacementPassword);
  await page.getByLabel("Confirm password").fill(replacementPassword);
  await page.getByRole("button", { name: "Update password" }).click();
  await expect(page).toHaveURL(/\/dashboard\?notice=/);
  await expect(page.getByRole("status")).toContainText("Password updated");

  const recoveryReplayContext = await browser.newContext();
  const recoveryReplayPage = await recoveryReplayContext.newPage();
  await recoveryReplayPage.goto(recoveryLink);
  await recoveryReplayPage.goto("/update-password");
  await expect(recoveryReplayPage).toHaveURL(/\/sign-in/);
  await recoveryReplayContext.close();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/sign-in");
  await page.locator("#sign-in-email").fill(email);
  await page.locator("#sign-in-password").fill(originalPassword);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText("Email or password is incorrect.", { exact: true })).toBeVisible();

  await page.locator("#sign-in-email").fill(email);
  await page.locator("#sign-in-password").fill(replacementPassword);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  const staleContext = await browser.newContext({
    storageState: await page.context().storageState(),
  });
  await page.getByRole("link", { name: "Settings" }).click();
  await page.getByLabel("Current password").fill(replacementPassword);
  await page.getByLabel("Type DELETE").fill("DELETE");
  await page.getByRole("button", { name: "Permanently delete account" }).click();
  await expect(page).toHaveURL(/\/\?accountDeleted=1$/);

  const stalePage = await staleContext.newPage();
  await stalePage.goto("/dashboard");
  await expect(stalePage).toHaveURL(/\/sign-in(?:\?next=%2Fdashboard)?$/);
  await staleContext.close();

  await page.goto("/sign-in");
  await page.locator("#sign-in-email").fill(email);
  await page.locator("#sign-in-password").fill(replacementPassword);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText("Email or password is incorrect.", { exact: true })).toBeVisible();
});

async function clearMailpit(request: APIRequestContext) {
  const response = await request.delete(`${mailpitURL}/api/v1/messages`);
  expect(response.ok()).toBe(true);
}

async function waitForAuthLink(
  request: APIRequestContext,
  email: string,
  type: "signup" | "recovery",
) {
  let found: string | undefined;

  await expect
    .poll(
      async () => {
        const inboxResponse = await request.get(`${mailpitURL}/api/v1/messages`);
        if (!inboxResponse.ok()) return "";
        const inbox = (await inboxResponse.json()) as { messages?: Array<Record<string, unknown>> };

        for (const summary of inbox.messages ?? []) {
          if (!JSON.stringify(summary).toLowerCase().includes(email.toLowerCase())) continue;
          const id = String(summary.ID ?? summary.Id ?? summary.id ?? "");
          if (!id) continue;
          const messageResponse = await request.get(`${mailpitURL}/api/v1/message/${id}`);
          if (!messageResponse.ok()) continue;
          const body = JSON.stringify(await messageResponse.json()).replaceAll("&amp;", "&");
          const links = body.match(/https?:\\?\/\\?\/[^\\"<>\s]+/g) ?? [];
          found = links
            .map((link) => link.replaceAll("\\/", "/"))
            .find((link) => link.includes("/auth/v1/verify") && link.includes(`type=${type}`));
          if (found) return found;
        }
        return "";
      },
      { message: `waiting for ${type} email to ${email}`, timeout: 20_000 },
    )
    .toContain(`type=${type}`);

  if (!found) throw new Error(`Mailpit did not contain a ${type} verification link.`);
  return found;
}
