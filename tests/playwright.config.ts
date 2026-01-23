import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config();

// Storage state path for authenticated sessions
const STORAGE_STATE_PATH = path.join(__dirname, '.auth', 'storageState.json');

export default defineConfig({
  testDir: './specs',
  outputDir: './test-results',
  
  // Timeout configurations
  timeout: 60000, // 60 seconds per test
  expect: { timeout: 10000 }, // 10 seconds for assertions
  
  // Test execution
  fullyParallel: false, // Sequential pour éviter conflits BDD
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1, // Un seul worker pour éviter conflits
  
  // Reporting
  reporter: [
    ['html', { outputFolder: './reports/html' }],
    ['json', { outputFile: './reports/results.json' }],
    ['junit', { outputFile: './reports/junit.xml' }],
    ['list']
  ],
  
  use: {
    // Global test settings - Solution professionnelle : Quarkus avec SPA routing
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Browser settings
    headless: !process.env.HEADED,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // API testing
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  },

  projects: [
    // Setup project - runs authentication before dashboard tests
    // IMPORTANT: Use Edge channel instead of Chromium bundled (Keycloak incompatible with Chromium)
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      use: {
        channel: 'msedge', // Use installed Edge instead of Chromium (BUG-013 fix)
        // CRITICAL: Do NOT use JSON headers for form submissions to Keycloak
        // Keycloak expects application/x-www-form-urlencoded, not application/json
        extraHTTPHeaders: {}, // Override global JSON headers
      },
    },

    // Tests Web Dashboard - Edge (requires authentication)
    {
      name: 'restaurant-dashboard',
      testMatch: /restaurant\//,
      dependencies: ['setup'], // Run setup first
      use: {
        ...devices['Desktop Chrome'],
        channel: 'msedge', // Use Edge for Keycloak compatibility
        storageState: STORAGE_STATE_PATH, // Use authenticated session
        extraHTTPHeaders: {}, // Don't override form Content-Type
        actionTimeout: 15000,
        navigationTimeout: 60000, // Increased from 30s to 60s for stability
      },
    },

    // Tests Legacy (à migrer) - Requires authentication
    {
      name: 'legacy-tests',
      testMatch: /phase1-dashboard|dashboard-ui/,
      dependencies: ['setup'], // Run setup first for authentication
      use: {
        ...devices['Desktop Chrome'],
        channel: 'msedge', // Use Edge for Keycloak compatibility
        storageState: STORAGE_STATE_PATH, // Use authenticated session
        extraHTTPHeaders: {}, // Don't override form Content-Type
        actionTimeout: 15000,
        navigationTimeout: 60000, // Increased from 30s to 60s for stability
      },
    },
    
    // Tests API Backend
    {
      name: 'api-backend',
      testMatch: /simple-api-tests/,
      use: {
        baseURL: 'http://localhost:8080/api',
        // Timeouts plus courts pour API
        actionTimeout: 10000,
        navigationTimeout: 10000,
      },
    },
    
    // Tests Intégration complète - Requires authentication
    {
      name: 'integration',
      testMatch: /integration-complete/,
      dependencies: ['setup'], // Run setup first for authentication
      use: {
        ...devices['Desktop Chrome'],
        channel: 'msedge', // Use Edge for Keycloak compatibility
        storageState: STORAGE_STATE_PATH, // Use authenticated session
        extraHTTPHeaders: {}, // Don't override form Content-Type
        actionTimeout: 20000,
        navigationTimeout: 30000,
      },
    },
  ],

  // Global setup/teardown
  globalSetup: './setup/global-setup.ts',
  globalTeardown: './setup/global-teardown.ts',
  
  // Dev server - Pas de démarrage auto car lancé depuis IntelliJ
  // Les tests s'attendent à ce que Quarkus soit déjà démarré sur :8080
  // avec Quinoa qui sert le dashboard React intégré
  
  // webServer: [] // Commenté - manuel depuis IntelliJ
});