/**
 * Tests de gestion des commandes Dashboard Restaurant
 * URL: http://localhost:8080/restaurant/orders
 */

import { test, expect } from '@playwright/test';

test.describe('Gestion des Commandes', () => {

  test.beforeEach(async ({ page }) => {
    // Login avant chaque test
    await page.goto('http://localhost:8080/restaurant');
    await page.getByLabel(/email/i).fill('restaurant@oneeats.com');
    await page.getByLabel(/mot de passe/i).fill('Test123!');
    await page.getByRole('button', { name: /se connecter/i }).click();
    await expect(page).toHaveURL(/.*dashboard/);

    // Naviguer vers les commandes
    await page.getByRole('link', { name: /commandes/i }).click();
  });

  test('affiche la liste des commandes', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /commandes/i })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('filtre les commandes par statut', async ({ page }) => {
    // Filtrer par "En attente"
    await page.getByRole('combobox', { name: /statut/i }).selectOption('PENDING');

    // Vérifier que seules les commandes en attente sont affichées
    const rows = page.locator('table tbody tr');
    for (const row of await rows.all()) {
      await expect(row.getByText(/en attente/i)).toBeVisible();
    }
  });

  test('accepte une commande en attente', async ({ page }) => {
    // Trouver une commande en attente
    const pendingOrder = page.locator('table tbody tr').filter({ hasText: /en attente/i }).first();

    // Cliquer sur Accepter
    await pendingOrder.getByRole('button', { name: /accepter/i }).click();

    // Confirmer
    await page.getByRole('button', { name: /confirmer/i }).click();

    // Vérifier le changement de statut
    await expect(pendingOrder.getByText(/acceptée/i)).toBeVisible();
  });

  test('refuse une commande avec motif', async ({ page }) => {
    const pendingOrder = page.locator('table tbody tr').filter({ hasText: /en attente/i }).first();

    // Cliquer sur Refuser
    await pendingOrder.getByRole('button', { name: /refuser/i }).click();

    // Saisir le motif
    await page.getByLabel(/motif/i).fill('Restaurant fermé exceptionnellement');
    await page.getByRole('button', { name: /confirmer/i }).click();

    // Vérifier le changement de statut
    await expect(pendingOrder.getByText(/refusée/i)).toBeVisible();
  });

  test('marque une commande comme prête', async ({ page }) => {
    // Filtrer par "Acceptée"
    await page.getByRole('combobox', { name: /statut/i }).selectOption('ACCEPTED');

    const acceptedOrder = page.locator('table tbody tr').first();

    // Cliquer sur "Prête"
    await acceptedOrder.getByRole('button', { name: /prête/i }).click();
    await page.getByRole('button', { name: /confirmer/i }).click();

    // Vérifier le changement de statut
    await expect(acceptedOrder.getByText(/prête/i)).toBeVisible();
  });

  test('visualise les détails d\'une commande', async ({ page }) => {
    // Cliquer sur une commande
    await page.locator('table tbody tr').first().click();

    // Vérifier le modal de détails
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/détails de la commande/i)).toBeVisible();
    await expect(page.getByText(/items/i)).toBeVisible();
    await expect(page.getByText(/total/i)).toBeVisible();
  });
});
