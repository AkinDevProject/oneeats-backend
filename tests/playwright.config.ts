import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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
    // Tests Web Dashboard - Chrome
    {
      name: 'web-dashboard',
      testMatch: /phase1-dashboard|dashboard-ui/,
      use: { 
        ...devices['Desktop Chrome'],
        // Paramètres spécifiques pour les tests UI
        actionTimeout: 15000,
        navigationTimeout: 30000,
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
    
    // Tests Intégration complète
    {
      name: 'integration',
      testMatch: /integration-complete/,
      use: { 
        ...devices['Desktop Chrome'],
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