const { defineConfig } = require("@playwright/test");

const TEST_PORT = 18998;
process.env.TEST_URL = `http://127.0.0.1:${TEST_PORT}`;

module.exports = defineConfig({
  testDir: "./test",
  testMatch: "**/*.test.js",
  webServer: {
    command: "node server.js",
    url: `http://127.0.0.1:${TEST_PORT}/api/health`,
    env: { ...process.env, PORT: String(TEST_PORT), LEADERSHIP_DATA_DIR: "e2e-data" },
    reuseExistingServer: false,
    timeout: 30000
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox" } },
    { name: "webkit", use: { browserName: "webkit" } }
  ]
});