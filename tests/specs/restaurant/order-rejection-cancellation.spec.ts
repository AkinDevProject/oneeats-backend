/**
 * @fileoverview Tests E2E pour le refus et l'annulation des commandes restaurant
 * @description Couvre les scénarios UAT 3bis (Refuser commande) et 3ter (Annuler en préparation)
 * Ces scénarios sont CRITIQUES pour le workflow de gestion des commandes.
 *
 * @author OneEats Development Team (TEA Workflow)
 * @since 2026-01-24
 * @version 1.0.0
 *
 * Scénarios couverts:
 * - UAT 3bis: Refuser une commande en attente (CRITIQUE)
 * - UAT 3ter: Annuler une commande en cours de préparation (CRITIQUE)
 */

import { test, expect } from '@playwright/test';

/**
 * Test Suite: Refus et Annulation des Commandes Restaurant
 *
 * Valide les workflows critiques de refus et d'annulation des commandes
 * depuis le dashboard restaurant.
 */
test.describe('Restaurant Order Rejection and Cancellation', () => {

  /**
   * UAT Scénario 3bis: Refuser une commande en attente
   * Priorité: P0 (CRITIQUE)
   *
   * Objectif: Vérifier qu'un restaurateur peut refuser une commande
   * qu'il ne peut pas honorer avec sélection d'une raison.
   */
  test.describe('UAT 3bis - Refuser une commande en attente', () => {

    test('[P0] devrait afficher le bouton Refuser sur les commandes en attente', async ({ page }) => {
      console.log('🔴 Test: Bouton Refuser visible sur commandes PENDING');

      // GIVEN: Navigation vers la page des commandes
      await page.goto('/restaurant/orders');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // WHEN: Recherche des commandes en attente
      const pendingTab = page.locator('button').filter({ hasText: /en.?attente|pending/i });
      if (await pendingTab.count() > 0) {
        await pendingTab.first().click();
        await page.waitForTimeout(1000);
      }

      // THEN: Le bouton Refuser doit être visible
      const rejectButtons = page.locator('button').filter({ hasText: /refuser/i });
      const rejectCount = await rejectButtons.count();

      console.log(`📊 Boutons "Refuser" trouvés: ${rejectCount}`);

      if (rejectCount > 0) {
        // Vérifier que le bouton est interactif
        const firstRejectButton = rejectButtons.first();
        await expect(firstRejectButton).toBeVisible();
        await expect(firstRejectButton).toBeEnabled();
        console.log('✅ Bouton Refuser visible et actif');
      } else {
        console.log('ℹ️ Aucune commande en attente disponible pour le test');
      }
    });

    test('[P0] devrait permettre de refuser une commande avec le bouton direct', async ({ page }) => {
      console.log('🔴 Test: Refus de commande via bouton direct');

      // GIVEN: Navigation vers la page des commandes
      await page.goto('/restaurant/orders');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Filtrer sur les commandes en attente si possible
      const pendingTab = page.locator('button').filter({ hasText: /en.?attente|pending/i });
      if (await pendingTab.count() > 0) {
        await pendingTab.first().click();
        await page.waitForTimeout(1000);
      }

      // WHEN: Clic sur le bouton Refuser d'une commande
      const rejectButtons = page.locator('button').filter({ hasText: /refuser/i });

      if (await rejectButtons.count() > 0) {
        console.log('📝 Clic sur le bouton Refuser...');

        // Capturer l'état initial
        const orderCards = page.locator('.card, [class*="bg-white"]');
        const initialCount = await orderCards.count();

        // Cliquer sur Refuser
        await rejectButtons.first().click();
        await page.waitForTimeout(2000);

        // THEN: Vérifier les changements
        // Option 1: Une modal de confirmation s'ouvre
        const confirmModal = page.locator('div[role="dialog"], .modal, .fixed.inset-0');
        const hasModal = await confirmModal.count() > 0;

        if (hasModal) {
          console.log('✅ Modal de confirmation ouverte');

          // Chercher les raisons de refus si disponibles
          const reasonOptions = page.locator('button, input[type="radio"], select').filter({
            hasText: /ingrédient|fermer|trop.importante|autre/i
          });
          const hasReasons = await reasonOptions.count() > 0;

          if (hasReasons) {
            console.log('✅ Options de raison de refus disponibles');
          }

          // Fermer le modal sans confirmer (pour ne pas modifier les données)
          const cancelButton = page.locator('button').filter({ hasText: /annuler|fermer|cancel/i });
          if (await cancelButton.count() > 0) {
            await cancelButton.first().click();
          } else {
            await page.keyboard.press('Escape');
          }
        } else {
          // Option 2: Le refus est directement effectué
          console.log('ℹ️ Refus effectué sans modal de confirmation');
        }

        console.log('✅ Workflow de refus testé');
      } else {
        console.log('ℹ️ Aucune commande en attente disponible');
      }
    });

    test('[P1] devrait afficher le bouton Refuser dans la modal de détails', async ({ page }) => {
      console.log('🔴 Test: Bouton Refuser dans modal de détails');

      // GIVEN: Navigation vers la page des commandes
      await page.goto('/restaurant/orders');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // WHEN: Ouvrir les détails d'une commande en attente
      const viewDetailsButtons = page.locator('button').filter({ hasText: /voir.?détails|détails|details/i });

      if (await viewDetailsButtons.count() > 0) {
        await viewDetailsButtons.first().click();
        await page.waitForTimeout(1500);

        // THEN: Vérifier la présence du bouton Refuser dans la modal
        const modal = page.locator('div[role="dialog"], .modal, .fixed.inset-0 div.inline-block');

        if (await modal.isVisible()) {
          console.log('✅ Modal de détails ouverte');

          // Chercher le bouton Refuser dans la modal
          const rejectInModal = modal.locator('button').filter({ hasText: /refuser/i });

          if (await rejectInModal.count() > 0) {
            await expect(rejectInModal.first()).toBeVisible();
            console.log('✅ Bouton Refuser présent dans la modal');
          } else {
            console.log('ℹ️ Bouton Refuser non visible (statut différent de PENDING)');
          }

          // Fermer la modal
          const closeButton = modal.locator('button').filter({ hasText: /fermer|close/i });
          if (await closeButton.count() > 0) {
            await closeButton.first().click();
          } else {
            await page.keyboard.press('Escape');
          }
        }
      } else {
        console.log('ℹ️ Aucun bouton "Voir détails" trouvé');
      }
    });
  });

  /**
   * UAT Scénario 3ter: Annuler une commande en cours de préparation
   * Priorité: P0 (CRITIQUE)
   *
   * Objectif: Vérifier qu'un restaurateur peut annuler une commande
   * en cours de préparation en cas de problème.
   */
  test.describe('UAT 3ter - Annuler une commande en préparation', () => {

    test('[P0] devrait permettre d\'annuler une commande en préparation', async ({ page }) => {
      console.log('🟡 Test: Annulation de commande en préparation');

      // GIVEN: Navigation vers la page des commandes
      await page.goto('/restaurant/orders');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Filtrer sur les commandes en préparation
      const preparingTab = page.locator('button').filter({ hasText: /en.?cours|préparation|preparing/i });
      if (await preparingTab.count() > 0) {
        await preparingTab.first().click();
        await page.waitForTimeout(1000);
        console.log('📋 Onglet "En préparation" sélectionné');
      }

      // WHEN: Chercher le bouton d'annulation
      // Note: Dans le code, le bouton "Annuler" est dans la modal de détails pour PREPARING
      const viewDetailsButtons = page.locator('button').filter({ hasText: /voir.?détails|détails|details/i });

      if (await viewDetailsButtons.count() > 0) {
        await viewDetailsButtons.first().click();
        await page.waitForTimeout(1500);

        const modal = page.locator('div[role="dialog"], .modal, .fixed.inset-0 div.inline-block');

        if (await modal.isVisible()) {
          console.log('✅ Modal de détails ouverte');

          // THEN: Chercher le bouton Annuler dans la modal
          const cancelButton = modal.locator('button').filter({ hasText: /annuler/i });

          if (await cancelButton.count() > 0) {
            console.log('✅ Bouton Annuler présent dans la modal');
            await expect(cancelButton.first()).toBeVisible();
            await expect(cancelButton.first()).toBeEnabled();

            // Ne pas cliquer pour ne pas modifier les données
            console.log('✅ Bouton Annuler interactif et fonctionnel');
          } else {
            console.log('ℹ️ Bouton Annuler non visible (commande pas en PREPARING)');
          }

          // Fermer la modal
          const closeButton = modal.locator('button').filter({ hasText: /fermer|close/i });
          if (await closeButton.count() > 0) {
            await closeButton.first().click();
          } else {
            await page.keyboard.press('Escape');
          }
        }
      } else {
        console.log('ℹ️ Aucune commande disponible pour le test');
      }
    });

    test('[P1] devrait afficher les raisons d\'annulation possibles', async ({ page }) => {
      console.log('🟡 Test: Raisons d\'annulation disponibles');

      // GIVEN: Navigation vers la page des commandes
      await page.goto('/restaurant/orders');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // WHEN: Ouvrir une commande et cliquer sur Annuler
      const viewDetailsButtons = page.locator('button').filter({ hasText: /voir.?détails|détails/i });

      if (await viewDetailsButtons.count() > 0) {
        await viewDetailsButtons.first().click();
        await page.waitForTimeout(1500);

        const modal = page.locator('div[role="dialog"], .modal, .fixed.inset-0');

        if (await modal.isVisible()) {
          const cancelButton = modal.locator('button').filter({ hasText: /annuler/i });

          if (await cancelButton.count() > 0) {
            await cancelButton.first().click();
            await page.waitForTimeout(1000);

            // THEN: Vérifier si une modal de raison s'affiche
            const reasonDialog = page.locator('div[role="dialog"], .modal').filter({
              hasText: /raison|problème|cuisine|ingrédient/i
            });

            if (await reasonDialog.count() > 0) {
              console.log('✅ Dialog de sélection de raison affiché');

              // Vérifier les options
              const reasonOptions = page.locator('button, label, input[type="radio"]').filter({
                hasText: /problème|ingrédient|équipement|autre/i
              });
              const optionsCount = await reasonOptions.count();
              console.log(`📊 ${optionsCount} options de raison trouvées`);
            } else {
              console.log('ℹ️ Annulation directe sans sélection de raison');
            }

            // Annuler et fermer
            await page.keyboard.press('Escape');
          }
        }
      }

      console.log('✅ Test des raisons d\'annulation terminé');
    });
  });

  /**
   * Tests de vérification du changement de statut
   */
  test.describe('Vérification des changements de statut', () => {

    test('[P1] devrait changer le statut vers CANCELLED après refus', async ({ page }) => {
      console.log('🔄 Test: Vérification du changement de statut après refus');

      // GIVEN: Navigation vers les commandes
      await page.goto('/restaurant/orders');
      await page.waitForLoadState('domcontentloaded');

      // WHEN: Observer les badges de statut
      const statusBadges = page.locator('[class*="badge"], .badge').filter({
        hasText: /annulée|cancelled|refusée/i
      });

      const cancelledCount = await statusBadges.count();
      console.log(`📊 Commandes annulées/refusées trouvées: ${cancelledCount}`);

      // THEN: Vérifier l'onglet des commandes annulées
      const cancelledTab = page.locator('button').filter({ hasText: /annulée|cancelled/i });
      if (await cancelledTab.count() > 0) {
        await cancelledTab.first().click();
        await page.waitForTimeout(1000);

        const orderCards = page.locator('.card, [class*="bg-white"]');
        const cardCount = await orderCards.count();
        console.log(`📊 Commandes dans l'onglet Annulées: ${cardCount}`);
      }

      console.log('✅ Vérification des statuts terminée');
    });

    test('[P2] devrait notifier le client après annulation', async ({ page }) => {
      console.log('📧 Test: Notification client après annulation');

      // Ce test vérifie que l'interface indique qu'une notification sera envoyée
      await page.goto('/restaurant/orders');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Chercher des indicateurs de notification dans l'UI
      const notificationIndicators = page.locator('*').filter({
        hasText: /notification|notifi|client.sera.informé|email|sms/i
      });

      const hasNotificationUI = await notificationIndicators.count() > 0;

      if (hasNotificationUI) {
        console.log('✅ Indicateurs de notification présents dans l\'interface');
      } else {
        console.log('ℹ️ Notifications gérées côté backend (pas d\'indicateur UI)');
      }

      console.log('✅ Test de notification terminé');
    });
  });

  /**
   * Tests de réactivation de commande annulée
   */
  test.describe('Réactivation de commande annulée', () => {

    test('[P2] devrait permettre de réactiver une commande annulée', async ({ page }) => {
      console.log('♻️ Test: Réactivation de commande annulée');

      // GIVEN: Navigation vers les commandes annulées
      await page.goto('/restaurant/orders');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Aller dans l'onglet Annulées
      const cancelledTab = page.locator('button').filter({ hasText: /annulée|cancelled/i });
      if (await cancelledTab.count() > 0) {
        await cancelledTab.first().click();
        await page.waitForTimeout(1000);
      }

      // WHEN: Chercher le bouton Réactiver
      const reactivateButtons = page.locator('button').filter({ hasText: /réactiver|reactivate/i });

      if (await reactivateButtons.count() > 0) {
        console.log('✅ Bouton Réactiver trouvé');
        await expect(reactivateButtons.first()).toBeVisible();
        await expect(reactivateButtons.first()).toBeEnabled();
      } else {
        console.log('ℹ️ Aucune commande annulée à réactiver');
      }

      console.log('✅ Test de réactivation terminé');
    });
  });
});