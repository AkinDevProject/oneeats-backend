/**
 * Authentication Setup for E2E Tests
 *
 * This file handles Keycloak SSO login and saves the authenticated session
 * to a storage state file that can be reused by all tests.
 *
 * BUG-013 Fix: Tests E2E dashboard ne peuvent pas interagir avec l'interface
 */

import { chromium, Browser, BrowserContext, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

// Storage state file path
export const STORAGE_STATE_PATH = path.join(__dirname, '..', '.auth', 'storageState.json');

// Test credentials (from keycloak/realms/oneeats-realm.json)
const TEST_CREDENTIALS = {
  restaurant: {
    email: process.env.TEST_RESTAURANT_EMAIL || 'restaurant@oneeats.com',
    password: process.env.TEST_RESTAURANT_PASSWORD || 'restaurant123',
  },
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || 'admin@oneeats.com',
    password: process.env.TEST_ADMIN_PASSWORD || 'admin123',
  },
  client: {
    email: process.env.TEST_CLIENT_EMAIL || 'client@oneeats.com',
    password: process.env.TEST_CLIENT_PASSWORD || 'client123',
  },
};

/**
 * Authenticates a user via Keycloak and saves the session state
 */
export async function authenticateUser(
  userType: 'restaurant' | 'admin' | 'client' = 'restaurant'
): Promise<void> {
  console.log(`🔐 Authentification utilisateur ${userType}...`);

  const credentials = TEST_CREDENTIALS[userType];
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;

  try {
    // Ensure .auth directory exists
    const authDir = path.dirname(STORAGE_STATE_PATH);
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
      console.log(`📁 Répertoire .auth créé`);
    }

    // Launch browser
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to dashboard (will redirect to Keycloak)
    console.log(`🌐 Navigation vers le dashboard...`);
    const dashboardUrl = userType === 'admin'
      ? 'http://localhost:8080/admin'
      : 'http://localhost:8080/restaurant';

    await page.goto(dashboardUrl, { waitUntil: 'networkidle', timeout: 30000 });

    // Check if we're on Keycloak login page
    const currentUrl = page.url();
    const isKeycloakLogin = currentUrl.includes('/realms/oneeats/') ||
                           currentUrl.includes('login-actions');

    if (!isKeycloakLogin) {
      // Already authenticated or different auth mechanism
      console.log(`⚠️ Pas sur la page Keycloak, URL actuelle: ${currentUrl}`);

      // Try to check if we're already authenticated
      if (currentUrl.includes('/restaurant') || currentUrl.includes('/admin')) {
        console.log(`✅ Déjà authentifié, sauvegarde de la session...`);
        await context.storageState({ path: STORAGE_STATE_PATH });
        return;
      }
    }

    console.log(`🔑 Page de login Keycloak détectée`);

    // Wait for login form
    await page.waitForSelector('#username, input[name="username"]', { timeout: 10000 });

    // Fill credentials
    console.log(`📝 Saisie des identifiants...`);

    // Try different selectors for username field
    const usernameSelector = await page.$('#username')
      ? '#username'
      : 'input[name="username"]';
    await page.fill(usernameSelector, credentials.email);

    // Try different selectors for password field
    const passwordSelector = await page.$('#password')
      ? '#password'
      : 'input[name="password"]';
    await page.fill(passwordSelector, credentials.password);

    // Click login button
    console.log(`🖱️ Clic sur le bouton de connexion...`);
    const loginButtonSelector = await page.$('#kc-login')
      ? '#kc-login'
      : 'input[type="submit"], button[type="submit"]';
    await page.click(loginButtonSelector);

    // Wait for redirect back to dashboard
    console.log(`⏳ Attente de la redirection...`);
    await page.waitForURL(
      (url) => url.toString().includes('/restaurant') ||
               url.toString().includes('/admin') ||
               url.toString().includes('/callback'),
      { timeout: 30000 }
    );

    // If redirected to callback, wait for final redirect
    if (page.url().includes('/callback')) {
      await page.waitForURL(
        (url) => url.toString().includes('/restaurant') ||
                 url.toString().includes('/admin'),
        { timeout: 15000 }
      );
    }

    // Wait a bit for session to be fully established
    await page.waitForTimeout(1000);

    // Save storage state (cookies + localStorage)
    console.log(`💾 Sauvegarde de la session...`);
    await context.storageState({ path: STORAGE_STATE_PATH });

    console.log(`✅ Authentification ${userType} réussie!`);
    console.log(`📄 Session sauvegardée dans: ${STORAGE_STATE_PATH}`);

  } catch (error) {
    console.error(`❌ Erreur d'authentification:`, error);

    // Log more details for debugging
    if (error instanceof Error) {
      console.error(`   Message: ${error.message}`);
    }

    throw new Error(`Échec de l'authentification ${userType}: ${error}`);
  } finally {
    if (context) await context.close();
    if (browser) await browser.close();
  }
}

/**
 * Checks if a valid storage state exists
 */
export function hasValidStorageState(): boolean {
  if (!fs.existsSync(STORAGE_STATE_PATH)) {
    return false;
  }

  try {
    const stats = fs.statSync(STORAGE_STATE_PATH);
    const fileAge = Date.now() - stats.mtimeMs;
    const maxAge = 30 * 60 * 1000; // 30 minutes

    // Check if file is not too old (Keycloak tokens expire)
    if (fileAge > maxAge) {
      console.log(`⚠️ Session expirée (${Math.round(fileAge / 60000)} min)`);
      return false;
    }

    // Check if file has content
    const content = fs.readFileSync(STORAGE_STATE_PATH, 'utf-8');
    const state = JSON.parse(content);

    // Check if there are cookies
    if (!state.cookies || state.cookies.length === 0) {
      console.log(`⚠️ Session vide (pas de cookies)`);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Clears the storage state (logout)
 */
export function clearStorageState(): void {
  if (fs.existsSync(STORAGE_STATE_PATH)) {
    fs.unlinkSync(STORAGE_STATE_PATH);
    console.log(`🗑️ Session supprimée`);
  }
}

/**
 * Gets the storage state path if valid, otherwise authenticates first
 */
export async function getOrCreateStorageState(
  userType: 'restaurant' | 'admin' | 'client' = 'restaurant'
): Promise<string> {
  if (!hasValidStorageState()) {
    await authenticateUser(userType);
  }
  return STORAGE_STATE_PATH;
}

export default authenticateUser;
