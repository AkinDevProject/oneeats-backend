/**
 * Configuration Playwright spécifique pour les tests Admin Dashboard
 * Pas de global setup (les tests admin gèrent leur propre authentification)
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/web',
  testMatch: /admin\.spec\.ts/,
  outputDir: './test-results-admin',

  // Timeout configurations
  timeout: 60000, // 60 seconds per test
  expect: { timeout: 10000 }, // 10 seconds for assertions

  // Test execution
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,

  // Reporting
  reporter: [
    ['html', { outputFolder: './reports/admin-html' }],
    ['json', { outputFile: './reports/admin-results.json' }],
    ['list'],
  ],

  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Browser settings
    ...devices['Desktop Chrome'],
    channel: 'msedge',
    headless: !process.env.HEADED,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,

    // Timeouts
    actionTimeout: 15000,
    navigationTimeout: 60000,
  },

  // NO global setup/teardown - tests admin gèrent leur propre auth
  // globalSetup: undefined,
  // globalTeardown: undefined,
});