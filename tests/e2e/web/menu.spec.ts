/**
 * Tests de gestion du menu Dashboard Restaurant
 * URL: http://localhost:8080/restaurant/menu
 */

import { test, expect } from '@playwright/test';

test.describe('Gestion du Menu', () => {

  test.beforeEach(async ({ page }) => {
    // Login avant chaque test
    await page.goto('http://localhost:8080/restaurant');
    await page.getByLabel(/email/i).fill('restaurant@oneeats.com');
    await page.getByLabel(/mot de passe/i).fill('Test123!');
    await page.getByRole('button', { name: /se connecter/i }).click();
    await expect(page).toHaveURL(/.*dashboard/);

    // Naviguer vers le menu
    await page.getByRole('link', { name: /menu/i }).click();
  });

  test('affiche la liste des catégories et plats', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /menu/i })).toBeVisible();
    await expect(page.getByText(/catégories/i)).toBeVisible();
  });

  test('ajoute une nouvelle catégorie', async ({ page }) => {
    await page.getByRole('button', { name: /nouvelle catégorie/i }).click();

    // Remplir le formulaire
    await page.getByLabel(/nom/i).fill('Desserts');
    await page.getByLabel(/description/i).fill('Nos délicieux desserts maison');

    await page.getByRole('button', { name: /créer/i }).click();

    // Vérifier la création
    await expect(page.getByText('Desserts')).toBeVisible();
  });

  test('ajoute un nouveau plat', async ({ page }) => {
    await page.getByRole('button', { name: /nouveau plat/i }).click();

    // Remplir le formulaire
    await page.getByLabel(/nom/i).fill('Tiramisu');
    await page.getByLabel(/description/i).fill('Tiramisu maison au café');
    await page.getByLabel(/prix/i).fill('7.50');
    await page.getByRole('combobox', { name: /catégorie/i }).selectOption('Desserts');

    await page.getByRole('button', { name: /créer/i }).click();

    // Vérifier la création
    await expect(page.getByText('Tiramisu')).toBeVisible();
    await expect(page.getByText('7,50 €')).toBeVisible();
  });

  test('modifie un plat existant', async ({ page }) => {
    // Trouver un plat existant
    const dish = page.locator('[data-testid="dish-card"]').first();
    await dish.getByRole('button', { name: /modifier/i }).click();

    // Modifier le prix
    await page.getByLabel(/prix/i).clear();
    await page.getByLabel(/prix/i).fill('9.00');

    await page.getByRole('button', { name: /sauvegarder/i }).click();

    // Vérifier la modification
    await expect(dish.getByText('9,00 €')).toBeVisible();
  });

  test('désactive/active un plat', async ({ page }) => {
    const dish = page.locator('[data-testid="dish-card"]').first();

    // Désactiver
    await dish.getByRole('switch', { name: /disponible/i }).click();
    await expect(dish.getByText(/indisponible/i)).toBeVisible();

    // Réactiver
    await dish.getByRole('switch', { name: /disponible/i }).click();
    await expect(dish.getByText(/disponible/i)).toBeVisible();
  });

  test('supprime un plat avec confirmation', async ({ page }) => {
    const dishName = 'Plat à supprimer';
    const dish = page.locator('[data-testid="dish-card"]').filter({ hasText: dishName });

    await dish.getByRole('button', { name: /supprimer/i }).click();

    // Confirmer la suppression
    await expect(page.getByText(/êtes-vous sûr/i)).toBeVisible();
    await page.getByRole('button', { name: /supprimer/i }).click();

    // Vérifier la suppression
    await expect(page.getByText(dishName)).not.toBeVisible();
  });
});
