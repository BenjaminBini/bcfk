const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on",
  },
  globalSetup: require.resolve("./tests/global-setup.js"),
  projects: [
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
  ],
  webServer: {
    command: "NODE_ENV=test npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    env: {
      NODE_ENV: "test",
    },
  },
});
