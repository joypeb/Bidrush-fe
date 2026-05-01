import { defineConfig, devices } from "@playwright/test";

const port = process.env.PLAYWRIGHT_PORT ?? "3100";
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  webServer: {
    command: `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:59999 npm run dev -- --hostname 127.0.0.1 --port ${port}`,
    reuseExistingServer: false,
    timeout: 120_000,
    url: baseURL,
  },
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
