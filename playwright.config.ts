import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";

const isMock = process.env.MOCK !== "false";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 1,
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:8080",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 8080",
    port: 8080,
    timeout: 120_000,
    reuseExistingServer: true,
    env: {
      MOCK: String(isMock),
      VITE_API_BASE_URL: process.env.VITE_API_BASE_URL ?? "http://localhost:3000/api",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
