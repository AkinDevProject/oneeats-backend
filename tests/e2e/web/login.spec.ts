/**
 * Tests de connexion Dashboard Restaurant
 * URL: http://localhost:8080/restaurant
 */

import { test, expect } from '@playwright/test';

test.describe('Authentification Dashboard Restaurant', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/restaurant');
  });

  test('affiche la page de connexion', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /connexion/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible();
  });

  test('connexion restaurateur valide', async ({ page }) => {
    // Saisir les identifiants
    await page.getByLabel(/email/i).fill('restaurant@oneeats.com');
    await page.getByLabel(/mot de passe/i).fill('Test123!');

    // Cliquer sur connexion
    await page.getByRole('button', { name: /se connecter/i }).click();

    // Vérifier la redirection vers le dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByText(/bienvenue/i)).toBeVisible();
  });

  test('affiche erreur pour identifiants invalides', async ({ page }) => {
    await page.getByLabel(/email/i).fill('invalid@email.com');
    await page.getByLabel(/mot de passe/i).fill('wrongpassword');
    await page.getByRole('button', { name: /se connecter/i }).click();

    await expect(page.getByText(/identifiants invalides/i)).toBeVisible();
  });

  test('validation email format', async ({ page }) => {
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/mot de passe/i).fill('password');
    await page.getByRole('button', { name: /se connecter/i }).click();

    await expect(page.getByText(/email invalide/i)).toBeVisible();
  });
});
