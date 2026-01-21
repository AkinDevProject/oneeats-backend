/**
 * Configuration de l'orchestrateur de tests cross-platform
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '..', '.env') });

export interface OrchestratorConfig {
  // URLs
  baseUrl: string;
  apiUrl: string;
  keycloakUrl: string;
  mobileApiUrl: string;

  // Chemins
  projectRoot: string;
  testsDir: string;
  reportsDir: string;
  screenshotsDir: string;
  maestroFlowsDir: string;

  // Credentials de test
  testClient: {
    email: string;
    password: string;
  };
  testRestaurant: {
    email: string;
    password: string;
  };
  testAdmin: {
    email: string;
    password: string;
  };

  // Timeouts (en ms)
  timeouts: {
    default: number;
    navigation: number;
    apiCall: number;
    sync: number;
    maestroCommand: number;
  };

  // Retry configuration
  retry: {
    maxAttempts: number;
    delayMs: number;
    backoffMultiplier: number;
  };

  // Options
  headless: boolean;
  verbose: boolean;
  screenshotOnStep: boolean;
  screenshotOnError: boolean;
}

export const config: OrchestratorConfig = {
  // URLs
  baseUrl: process.env.BASE_URL || 'http://localhost:8080',
  apiUrl: process.env.API_URL || 'http://localhost:8080/api',
  keycloakUrl: process.env.KEYCLOAK_URL || 'http://localhost:8580',
  mobileApiUrl: process.env.MOBILE_API_URL || 'http://10.0.2.2:8080/api', // Pour émulateur Android

  // Chemins
  projectRoot: path.resolve(__dirname, '..', '..'),
  testsDir: path.resolve(__dirname, '..'),
  reportsDir: path.resolve(__dirname, '..', 'reports', 'orchestrator'),
  screenshotsDir: path.resolve(__dirname, '..', 'reports', 'orchestrator', 'screenshots'),
  maestroFlowsDir: path.resolve(__dirname, '..', 'e2e', 'mobile'),

  // Credentials de test
  testClient: {
    email: process.env.TEST_CLIENT_EMAIL || 'client@test.com',
    password: process.env.TEST_CLIENT_PASSWORD || 'Test123!',
  },
  testRestaurant: {
    email: process.env.TEST_RESTAURANT_EMAIL || 'restaurant@pizzapalace.com',
    password: process.env.TEST_RESTAURANT_PASSWORD || 'password123',
  },
  testAdmin: {
    email: process.env.TEST_ADMIN_EMAIL || 'admin@oneeats.com',
    password: process.env.TEST_ADMIN_PASSWORD || 'Admin123!',
  },

  // Timeouts (en ms)
  timeouts: {
    default: 30000,       // 30 secondes
    navigation: 15000,    // 15 secondes
    apiCall: 10000,       // 10 secondes
    sync: 5000,           // 5 secondes entre plateformes
    maestroCommand: 60000, // 60 secondes pour commande Maestro
  },

  // Retry configuration
  retry: {
    maxAttempts: 5,
    delayMs: 2000,
    backoffMultiplier: 1.5,
  },

  // Options
  headless: process.env.HEADED !== 'true',
  verbose: process.env.VERBOSE === 'true',
  screenshotOnStep: process.env.SCREENSHOT_ON_STEP === 'true',
  screenshotOnError: process.env.SCREENSHOT_ON_ERROR !== 'false', // true par défaut
};

export default config;