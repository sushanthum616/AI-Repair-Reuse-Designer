import { defineConfig, devices } from "@playwright/test";

const port = 4174;
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./tests/e2e-auth",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 120_000,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report-auth" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
  webServer: {
    command: `npm run start -- --hostname 127.0.0.1 --port ${port}`,
    env: { NEXT_PUBLIC_APP_URL: baseURL },
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: "auth-chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
