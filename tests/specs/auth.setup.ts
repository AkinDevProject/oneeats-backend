/**
 * Authentication Setup Test
 *
 * This file is run as a Playwright "setup" project before the dashboard tests.
 * It authenticates via Keycloak and saves the session state for reuse.
 *
 * BUG-013 Fix: Tests E2E dashboard ne peuvent pas interagir avec l'interface
 *
 * IMPORTANT: Keycloak has brute force protection enabled (5 attempts, 60s lockout).
 * This script clears any lockout before attempting login.
 */

import { test as setup, expect, request } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Storage state file path
const STORAGE_STATE_PATH = path.join(__dirname, '..', '.auth', 'storageState.json');

// Keycloak configuration
// Note: Use IP address if Keycloak is configured to redirect to IP instead of localhost
const KEYCLOAK_BASE_URL = process.env.KEYCLOAK_URL || 'http://192.168.1.111:8580';
const KEYCLOAK_REALM = 'oneeats';
const KEYCLOAK_ADMIN_USER = 'admin';
const KEYCLOAK_ADMIN_PASSWORD = 'admin';

// Test credentials (from keycloak/realms/oneeats-realm.json)
const RESTAURANT_CREDENTIALS = {
  email: process.env.TEST_RESTAURANT_EMAIL || 'restaurant@oneeats.com',
  password: process.env.TEST_RESTAURANT_PASSWORD || 'restaurant123',
};

/**
 * Clear brute force lockout for a user via Keycloak Admin API
 */
async function clearBruteForceLockout(username: string): Promise<void> {
  console.log(`🔓 Réinitialisation du verrouillage brute-force pour ${username}...`);

  try {
    const apiContext = await request.newContext();

    // Get admin token from master realm
    const tokenResponse = await apiContext.post(
      `${KEYCLOAK_BASE_URL}/realms/master/protocol/openid-connect/token`,
      {
        form: {
          grant_type: 'password',
          client_id: 'admin-cli',
          username: KEYCLOAK_ADMIN_USER,
          password: KEYCLOAK_ADMIN_PASSWORD,
        },
      }
    );

    if (!tokenResponse.ok()) {
      console.log(`⚠️ Impossible d'obtenir le token admin: ${tokenResponse.status()}`);
      return;
    }

    const tokenData = await tokenResponse.json();
    const adminToken = tokenData.access_token;

    // Get user ID by username
    const usersResponse = await apiContext.get(
      `${KEYCLOAK_BASE_URL}/admin/realms/${KEYCLOAK_REALM}/users?username=${encodeURIComponent(username)}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    if (!usersResponse.ok()) {
      console.log(`⚠️ Impossible de trouver l'utilisateur: ${usersResponse.status()}`);
      return;
    }

    const users = await usersResponse.json();
    if (users.length === 0) {
      console.log(`⚠️ Utilisateur non trouvé: ${username}`);
      return;
    }

    const userId = users[0].id;

    // Clear brute force lockout
    const clearResponse = await apiContext.delete(
      `${KEYCLOAK_BASE_URL}/admin/realms/${KEYCLOAK_REALM}/attack-detection/brute-force/users/${userId}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    if (clearResponse.ok() || clearResponse.status() === 204) {
      console.log(`✅ Verrouillage réinitialisé pour ${username}`);
    } else {
      console.log(`⚠️ Réinitialisation échouée: ${clearResponse.status()}`);
    }

    await apiContext.dispose();
  } catch (error) {
    console.log(`⚠️ Erreur lors de la réinitialisation: ${error}`);
  }
}

setup('authenticate as restaurant user', async ({ page }) => {
  console.log('🔐 Démarrage de l\'authentification restaurant...');

  // Ensure .auth directory exists
  const authDir = path.dirname(STORAGE_STATE_PATH);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
    console.log('📁 Répertoire .auth créé');
  }

  // IMPORTANT: Clear any brute force lockout before attempting login
  await clearBruteForceLockout(RESTAURANT_CREDENTIALS.email);

  // Intercept network requests to see form submission data
  await page.route('**/login-actions/**', async (route, request) => {
    const postData = request.postData();
    console.log(`🔍 POST to ${request.url()}`);
    console.log(`   Data: ${postData}`);
    await route.continue();
  });

  // Navigate to restaurant dashboard (will redirect to Keycloak)
  console.log('🌐 Navigation vers /restaurant...');
  await page.goto('http://localhost:8080/restaurant', {
    waitUntil: 'networkidle',
    timeout: 30000,
  });

  // Check current URL
  const currentUrl = page.url();
  console.log(`📍 URL actuelle: ${currentUrl}`);

  // If already on dashboard, we're authenticated
  if (currentUrl.includes('/restaurant/') && !currentUrl.includes('login')) {
    console.log('✅ Déjà authentifié!');
    await page.context().storageState({ path: STORAGE_STATE_PATH });
    return;
  }

  // Check if on Keycloak login page
  const isKeycloakPage = currentUrl.includes('/realms/oneeats') ||
                         currentUrl.includes('login-actions') ||
                         currentUrl.includes(':8580') ||
                         currentUrl.includes(':8180');

  if (!isKeycloakPage) {
    console.log('⚠️ Page inattendue, tentative de login direct...');
  }

  // Wait for the form to be fully loaded
  console.log('⏳ Attente du formulaire de login...');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000); // Give JS time to fully initialize

  // Debug: Log the page HTML to understand the form structure
  const formHtml = await page.locator('form').first().innerHTML().catch(() => 'No form found');
  console.log('📄 Form HTML (truncated):', formHtml.substring(0, 500));

  // Try to find all input fields to understand the structure
  const inputs = await page.locator('input').all();
  console.log(`📝 Found ${inputs.length} input fields:`);
  for (const input of inputs) {
    const id = await input.getAttribute('id') || 'no-id';
    const name = await input.getAttribute('name') || 'no-name';
    const type = await input.getAttribute('type') || 'text';
    const value = await input.inputValue().catch(() => '(no value)');
    console.log(`   - id="${id}" name="${name}" type="${type}" value="${value}"`);
  }

  // Check the form action URL
  const formAction = await page.locator('form').first().getAttribute('action');
  console.log(`📤 Form action: ${formAction}`);

  // Find username field - Keycloak uses #username
  const usernameField = page.locator('#username');
  await usernameField.waitFor({ state: 'visible', timeout: 10000 });

  // Try setting values via JavaScript to bypass any input handling issues
  console.log('📝 Saisie via JavaScript...');
  await page.evaluate(({ email, password }) => {
    const usernameInput = document.getElementById('username') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    if (usernameInput) {
      usernameInput.value = email;
      usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
      usernameInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (passwordInput) {
      passwordInput.value = password;
      passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
      passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, { email: RESTAURANT_CREDENTIALS.email, password: RESTAURANT_CREDENTIALS.password });

  // Verify the values
  const emailValue = await page.locator('#username').inputValue();
  const passwordValue = await page.locator('#password').inputValue();
  console.log(`   Email saisi: ${emailValue}`);
  console.log(`   Mot de passe saisi: ${passwordValue.length} caractères (valeur: "${passwordValue}")`);

  // Wait before clicking to ensure form is ready
  await page.waitForTimeout(500);

  // Take a screenshot before clicking to verify values are filled
  const preSubmitPath = path.join(authDir, 'before-submit.png');
  await page.screenshot({ path: preSubmitPath });
  console.log(`📸 Screenshot avant soumission: ${preSubmitPath}`);

  // Verify values are still in fields just before submission
  const preSubmitEmail = await page.locator('#username').inputValue();
  const preSubmitPassword = await page.locator('#password').inputValue();
  console.log(`   Valeurs avant soumission: email="${preSubmitEmail}", password=${preSubmitPassword.length} chars`);

  // Find and click login button - Keycloak uses #kc-login
  console.log('🖱️ Clic sur le bouton de connexion...');
  const loginButton = page.locator('#kc-login');
  await loginButton.waitFor({ state: 'visible', timeout: 5000 });

  // Click the login button
  console.log('   Soumission via clic sur le bouton...');
  await loginButton.click();

  // Wait for redirect to dashboard or error
  console.log('⏳ Attente de la redirection vers le dashboard...');

  try {
    await page.waitForURL((url) => {
      const urlStr = url.toString();
      return urlStr.includes('/restaurant') ||
             urlStr.includes('/callback') ||
             urlStr.includes('/admin');
    }, { timeout: 15000 });
  } catch (error) {
    // Check if we got an error message
    const errorMessage = await page.locator('.alert-error, .kc-feedback-text, #input-error').textContent().catch(() => null);
    if (errorMessage) {
      console.log(`❌ Erreur Keycloak: ${errorMessage.trim()}`);
    }

    // Take screenshot for debugging
    const screenshotPath = path.join(authDir, 'login-error.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Screenshot sauvegardé: ${screenshotPath}`);

    throw new Error(`Login échoué: ${errorMessage || 'redirection timeout'}`);
  }

  // If on callback page, wait for final redirect
  if (page.url().includes('/callback')) {
    console.log('🔄 Callback en cours...');
    await page.waitForURL((url) => {
      const urlStr = url.toString();
      return (urlStr.includes('/restaurant') || urlStr.includes('/admin')) &&
             !urlStr.includes('/callback');
    }, { timeout: 15000 });
  }

  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle');

  // Verify we're on the dashboard
  const finalUrl = page.url();
  console.log(`📍 URL finale: ${finalUrl}`);

  // Check that we're not on login page anymore
  expect(finalUrl).not.toContain('login-actions');
  expect(finalUrl).not.toContain('/realms/oneeats/protocol');

  // Save storage state
  console.log('💾 Sauvegarde de la session...');
  await page.context().storageState({ path: STORAGE_STATE_PATH });

  console.log(`✅ Authentification réussie!`);
  console.log(`📄 Session sauvegardée: ${STORAGE_STATE_PATH}`);
});
