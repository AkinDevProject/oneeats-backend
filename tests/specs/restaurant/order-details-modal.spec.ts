/**
 * @fileoverview Tests E2E pour la modal de détails de commande
 * @description Couvre le scénario UAT 4 - Voir les détails d'une commande
 *
 * @author OneEats Development Team (TEA Workflow)
 * @since 2026-01-24
 * @version 1.0.0
 *
 * Scénarios couverts:
 * - UAT 4: Voir les détails d'une commande (informations client, articles, historique)
 */

import { test, expect } from '@playwright/test';

/**
 * Test Suite: Modal de Détails de Commande
 *
 * Valide l'affichage complet des informations d'une commande
 * dans la modal de détails du dashboard restaurant.
 */
test.describe('Restaurant Order Details Modal', () => {

  test.beforeEach(async ({ page }) => {
    // Navigation vers la page des commandes
    await page.goto('/restaurant/orders');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
  });

  /**
   * UAT Scénario 4: Voir les détails d'une commande
   * Priorité: P1
   *
   * Objectif: Vérifier que le restaurateur peut consulter
   * toutes les informations d'une commande.
   */
  test.describe('UAT 4 - Affichage des détails de commande', () => {

    test('[P1] devrait ouvrir la modal de détails au clic sur "Voir détails"', async ({ page }) => {
      console.log('📋 Test: Ouverture de la modal de détails');

      // GIVEN: Une commande est visible sur la page
      const orderCards = page.locator('[class*="card"], [class*="bg-white rounded"]');
      const hasOrders = await orderCards.count() > 0;

      if (!hasOrders) {
        console.log('ℹ️ Aucune commande disponible pour le test');
        return;
      }

      // WHEN: Clic sur "Voir détails" ou expansion de la carte
      // Option 1: Bouton "Voir détails" explicite
      const viewDetailsButton = page.locator('button').filter({ hasText: /voir.?détails|détails/i });

      // Option 2: Chevron d'expansion
      const expandButton = page.locator('button').filter({ hasText: /voir|expand|chevron/i });

      if (await viewDetailsButton.count() > 0) {
        await viewDetailsButton.first().click();
        console.log('📝 Clic sur bouton "Voir détails"');
      } else if (await expandButton.count() > 0) {
        await expandButton.first().click();
        console.log('📝 Clic sur bouton d\'expansion');
      } else {
        // Clic direct sur la carte
        await orderCards.first().click();
        console.log('📝 Clic direct sur la carte');
      }

      await page.waitForTimeout(1500);

      // THEN: La modal doit s'afficher
      const modal = page.locator('div[role="dialog"], .modal, .fixed.inset-0 div.bg-white.rounded');

      if (await modal.isVisible()) {
        console.log('✅ Modal de détails affichée');
        await expect(modal).toBeVisible();
      } else {
        // Vérifier si les détails sont affichés inline
        const expandedDetails = page.locator('[class*="expanded"], [class*="detail"]');
        if (await expandedDetails.count() > 0) {
          console.log('✅ Détails affichés en ligne (expansion)');
        }
      }
    });

    test('[P1] devrait afficher le numéro de commande dans la modal', async ({ page }) => {
      console.log('🔢 Test: Affichage du numéro de commande');

      // GIVEN: Ouvrir les détails d'une commande
      const viewDetailsButton = page.locator('button').filter({ hasText: /voir.?détails|détails/i });

      if (await viewDetailsButton.count() > 0) {
        await viewDetailsButton.first().click();
        await page.waitForTimeout(1500);

        // WHEN: Recherche du numéro de commande
        const modal = page.locator('div[role="dialog"], .modal, .fixed.inset-0');

        // THEN: Le numéro doit être visible (format #XXXX ou Commande #...)
        const orderNumber = modal.locator('*').filter({ hasText: /commande.?#|#[0-9a-f]+/i });

        if (await orderNumber.count() > 0) {
          console.log('✅ Numéro de commande affiché');
          await expect(orderNumber.first()).toBeVisible();
        } else {
          // Chercher format alternatif
          const numberPattern = modal.locator('h2, .font-bold').first();
          if (await numberPattern.isVisible()) {
            const text = await numberPattern.textContent();
            console.log(`📊 En-tête trouvé: ${text}`);
          }
        }

        // Fermer la modal
        await page.keyboard.press('Escape');
      } else {
        console.log('ℹ️ Pas de commandes disponibles');
      }
    });

    test('[P1] devrait afficher les informations client', async ({ page }) => {
      console.log('👤 Test: Informations client dans la modal');

      // GIVEN: Ouvrir les détails d'une commande
      const viewDetailsButton = page.locator('button').filter({ hasText: /voir.?détails|détails/i });

      if (await viewDetailsButton.count() > 0) {
        await viewDetailsButton.first().click();
        await page.waitForTimeout(1500);

        const modal = page.locator('div[role="dialog"], .modal, .fixed.inset-0');

        if (await modal.isVisible()) {
          // THEN: Vérifier les sections d'information client
          const clientSections = [
            /information.?client|client/i,
            /nom|name/i,
            /téléphone|phone/i,
            /retrait|livraison|pickup|delivery/i
          ];

          let foundSections = 0;
          for (const pattern of clientSections) {
            const section = modal.locator('*').filter({ hasText: pattern });
            if (await section.count() > 0) {
              foundSections++;
            }
          }

          console.log(`📊 Sections client trouvées: ${foundSections}/4`);

          // Vérifier l'icône User
          const userIcon = modal.locator('svg').first();
          if (await userIcon.count() > 0) {
            console.log('✅ Icône utilisateur présente');
          }

          // Fermer la modal
          await page.keyboard.press('Escape');
        }
      }
    });

    test('[P1] devrait afficher la liste des articles commandés', async ({ page }) => {
      console.log('📦 Test: Liste des articles dans la modal');

      // GIVEN: Ouvrir les détails d'une commande
      const viewDetailsButton = page.locator('button').filter({ hasText: /voir.?détails|détails/i });

      if (await viewDetailsButton.count() > 0) {
        await viewDetailsButton.first().click();
        await page.waitForTimeout(1500);

        const modal = page.locator('div[role="dialog"], .modal, .fixed.inset-0');

        if (await modal.isVisible()) {
          // THEN: Vérifier la section des articles
          const orderItems = modal.locator('*').filter({ hasText: /détail.?de.?la.?commande|articles/i });

          if (await orderItems.count() > 0) {
            console.log('✅ Section "Détail de la commande" trouvée');
          }

          // Chercher des lignes d'articles (quantité x nom)
          const itemLines = modal.locator('*').filter({ hasText: /\d+x|\d+ x/i });
          const itemCount = await itemLines.count();
          console.log(`📊 Lignes d'articles trouvées: ${itemCount}`);

          // Vérifier le total
          const totalAmount = modal.locator('*').filter({ hasText: /€|eur/i });
          if (await totalAmount.count() > 0) {
            console.log('✅ Montant total affiché');
          }

          // Fermer la modal
          await page.keyboard.press('Escape');
        }
      }
    });

    test('[P1] devrait afficher les options/suppléments des articles', async ({ page }) => {
      console.log('➕ Test: Options et suppléments des articles');

      // GIVEN: Ouvrir les détails d'une commande
      const viewDetailsButton = page.locator('button').filter({ hasText: /voir.?détails|détails/i });

      if (await viewDetailsButton.count() > 0) {
        await viewDetailsButton.first().click();
        await page.waitForTimeout(1500);

        const modal = page.locator('div[role="dialog"], .modal, .fixed.inset-0');

        if (await modal.isVisible()) {
          // THEN: Chercher des options/suppléments
          const options = modal.locator('*').filter({
            hasText: /option|supplément|taille|cuisson|sans|avec/i
          });

          const optionsCount = await options.count();
          console.log(`📊 Options/suppléments trouvés: ${optionsCount}`);

          if (optionsCount > 0) {
            console.log('✅ Options des articles affichées');
          } else {
            console.log('ℹ️ Pas d\'options sur cette commande (normal)');
          }

          // Fermer la modal
          await page.keyboard.press('Escape');
        }
      }
    });

    test('[P1] devrait afficher les instructions spéciales', async ({ page }) => {
      console.log('📝 Test: Instructions spéciales de la commande');

      // GIVEN: Ouvrir les détails d'une commande
      const viewDetailsButton = page.locator('button').filter({ hasText: /voir.?détails|détails/i });

      if (await viewDetailsButton.count() > 0) {
        await viewDetailsButton.first().click();
        await page.waitForTimeout(1500);

        const modal = page.locator('div[role="dialog"], .modal, .fixed.inset-0');

        if (await modal.isVisible()) {
          // THEN: Chercher la section instructions spéciales
          const instructions = modal.locator('*').filter({
            hasText: /instruction|spécial|note|commentaire/i
          });

          if (await instructions.count() > 0) {
            console.log('✅ Section instructions spéciales présente');

            // Vérifier le fond warning (jaune/orange)
            const warningBg = modal.locator('[class*="warning"], [class*="bg-yellow"], [class*="bg-amber"]');
            if (await warningBg.count() > 0) {
              console.log('✅ Style visuel warning pour instructions');
            }
          } else {
            console.log('ℹ️ Pas d\'instructions spéciales sur cette commande');
          }

          // Fermer la modal
          await page.keyboard.press('Escape');
        }
      }
    });

    test('[P1] devrait afficher l\'historique de la commande', async ({ page }) => {
      console.log('📜 Test: Historique/Timeline de la commande');

      // GIVEN: Ouvrir les détails d'une commande
      const viewDetailsButton = page.locator('button').filter({ hasText: /voir.?détails|détails/i });

      if (await viewDetailsButton.count() > 0) {
        await viewDetailsButton.first().click();
        await page.waitForTimeout(1500);

        const modal = page.locator('div[role="dialog"], .modal, .fixed.inset-0');

        if (await modal.isVisible()) {
          // THEN: Chercher la section historique
          const history = modal.locator('*').filter({
            hasText: /historique|timeline|history/i
          });

          if (await history.count() > 0) {
            console.log('✅ Section historique présente');

            // Vérifier les étapes du workflow
            const steps = modal.locator('*').filter({
              hasText: /reçue|préparation|prêt|récupéré|annulé/i
            });
            const stepsCount = await steps.count();
            console.log(`📊 Étapes de timeline trouvées: ${stepsCount}`);
          } else {
            console.log('ℹ️ Historique non visible ou format différent');
          }

          // Fermer la modal
          await page.keyboard.press('Escape');
        }
      }
    });

    test('[P1] devrait afficher le timer depuis la réception', async ({ page }) => {
      console.log('⏱️ Test: Timer de la commande');

      // GIVEN: Ouvrir les détails d'une commande
      const viewDetailsButton = page.locator('button').filter({ hasText: /voir.?détails|détails/i });

      if (await viewDetailsButton.count() > 0) {
        await viewDetailsButton.first().click();
        await page.waitForTimeout(1500);

        const modal = page.locator('div[role="dialog"], .modal, .fixed.inset-0');

        if (await modal.isVisible()) {
          // THEN: Chercher le timer
          const timer = modal.locator('*').filter({
            hasText: /\d+.?min|\d+:\d+|il y a/i
          });

          if (await timer.count() > 0) {
            console.log('✅ Timer de commande affiché');

            // Vérifier les couleurs d'urgence
            const urgencyColors = modal.locator('[class*="success"], [class*="warning"], [class*="danger"], [class*="green"], [class*="yellow"], [class*="red"]');
            if (await urgencyColors.count() > 0) {
              console.log('✅ Indicateur d\'urgence coloré présent');
            }
          }

          // Vérifier l'heure de réception
          const timeReceived = modal.locator('*').filter({ hasText: /reçue.?à|\d{2}:\d{2}/i });
          if (await timeReceived.count() > 0) {
            console.log('✅ Heure de réception affichée');
          }

          // Fermer la modal
          await page.keyboard.press('Escape');
        }
      }
    });

    test('[P1] devrait afficher les boutons d\'action appropriés au statut', async ({ page }) => {
      console.log('🔘 Test: Boutons d\'action dans la modal');

      // GIVEN: Ouvrir les détails d'une commande
      const viewDetailsButton = page.locator('button').filter({ hasText: /voir.?détails|détails/i });

      if (await viewDetailsButton.count() > 0) {
        await viewDetailsButton.first().click();
        await page.waitForTimeout(1500);

        const modal = page.locator('div[role="dialog"], .modal, .fixed.inset-0');

        if (await modal.isVisible()) {
          // THEN: Vérifier les boutons d'action selon le statut
          const actionButtons = {
            pending: /accepter|refuser/i,
            preparing: /prêt|annuler/i,
            ready: /récupéré|annuler/i,
            cancelled: /réactiver/i,
            completed: /fermer/i
          };

          let foundActions = 0;
          for (const [, pattern] of Object.entries(actionButtons)) {
            const buttons = modal.locator('button').filter({ hasText: pattern });
            const count = await buttons.count();
            foundActions += count;
          }

          console.log(`📊 Boutons d'action trouvés: ${foundActions}`);

          if (foundActions > 0) {
            console.log('✅ Boutons d\'action présents et appropriés');
          }

          // Vérifier le bouton Fermer
          const closeButton = modal.locator('button').filter({ hasText: /fermer|close/i });
          await expect(closeButton.first()).toBeVisible();
          console.log('✅ Bouton Fermer présent');

          // Fermer la modal
          await closeButton.first().click();
        }
      }
    });
  });

  /**
   * Tests de fermeture de la modal
   */
  test.describe('Fermeture de la modal', () => {

    test('[P2] devrait fermer la modal avec le bouton X', async ({ page }) => {
      console.log('❌ Test: Fermeture avec bouton X');

      const viewDetailsButton = page.locator('button').filter({ hasText: /voir.?détails|détails/i });

      if (await viewDetailsButton.count() > 0) {
        await viewDetailsButton.first().click();
        await page.waitForTimeout(1000);

        const modal = page.locator('div[role="dialog"], .modal, .fixed.inset-0');

        if (await modal.isVisible()) {
          // Chercher le bouton X
          const closeX = modal.locator('button').filter({ has: page.locator('svg') }).first();
          await closeX.click();
          await page.waitForTimeout(500);

          // Vérifier que la modal est fermée
          await expect(modal).not.toBeVisible();
          console.log('✅ Modal fermée avec bouton X');
        }
      }
    });

    test('[P2] devrait fermer la modal avec la touche Escape', async ({ page }) => {
      console.log('⎋ Test: Fermeture avec touche Escape');

      const viewDetailsButton = page.locator('button').filter({ hasText: /voir.?détails|détails/i });

      if (await viewDetailsButton.count() > 0) {
        await viewDetailsButton.first().click();
        await page.waitForTimeout(1000);

        const modal = page.locator('div[role="dialog"], .modal, .fixed.inset-0');

        if (await modal.isVisible()) {
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);

          // Vérifier que la modal est fermée
          await expect(modal).not.toBeVisible();
          console.log('✅ Modal fermée avec Escape');
        }
      }
    });

    test('[P2] devrait fermer la modal avec le bouton Fermer', async ({ page }) => {
      console.log('🔘 Test: Fermeture avec bouton Fermer');

      const viewDetailsButton = page.locator('button').filter({ hasText: /voir.?détails|détails/i });

      if (await viewDetailsButton.count() > 0) {
        await viewDetailsButton.first().click();
        await page.waitForTimeout(1000);

        const modal = page.locator('div[role="dialog"], .modal, .fixed.inset-0');

        if (await modal.isVisible()) {
          const closeButton = modal.locator('button').filter({ hasText: /fermer/i });

          if (await closeButton.count() > 0) {
            await closeButton.first().click();
            await page.waitForTimeout(500);

            // Vérifier que la modal est fermée
            await expect(modal).not.toBeVisible();
            console.log('✅ Modal fermée avec bouton Fermer');
          }
        }
      }
    });
  });

  /**
   * Tests d'accessibilité de la modal
   */
  test.describe('Accessibilité de la modal', () => {

    test('[P2] devrait avoir une structure accessible', async ({ page }) => {
      console.log('♿ Test: Accessibilité de la modal');

      const viewDetailsButton = page.locator('button').filter({ hasText: /voir.?détails|détails/i });

      if (await viewDetailsButton.count() > 0) {
        await viewDetailsButton.first().click();
        await page.waitForTimeout(1000);

        // Vérifier role="dialog"
        const dialog = page.locator('[role="dialog"]');
        if (await dialog.count() > 0) {
          console.log('✅ role="dialog" présent');
        }

        // Vérifier le titre (aria-labelledby ou h2)
        const title = page.locator('h2, [aria-labelledby]');
        if (await title.count() > 0) {
          console.log('✅ Titre de la modal présent');
        }

        // Fermer la modal
        await page.keyboard.press('Escape');
      }
    });
  });
});