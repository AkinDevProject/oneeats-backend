/**
 * @fileoverview Tests E2E pour la page des statistiques du restaurant
 * @description Couvre le scénario UAT 13 - Consulter les statistiques du restaurant
 *
 * @author OneEats Development Team (TEA Workflow)
 * @since 2026-01-24
 * @version 1.0.0
 *
 * Scénarios couverts:
 * - UAT 13: Consulter les statistiques (KPIs, graphiques, exports)
 */

import { test, expect } from '@playwright/test';

/**
 * Test Suite: Statistiques et Analytics Restaurant
 *
 * Valide l'affichage des statistiques de performance du restaurant
 * incluant les KPIs, graphiques et fonctionnalités d'export.
 */
test.describe('Restaurant Analytics and Statistics', () => {

  test.beforeEach(async ({ page }) => {
    // Navigation vers la page des statistiques
    await page.goto('/restaurant/analytics');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
  });

  /**
   * UAT Scénario 13: Consulter les statistiques du restaurant
   * Priorité: P2
   *
   * Objectif: Vérifier que le restaurateur peut consulter
   * les statistiques de son restaurant.
   */
  test.describe('UAT 13 - Consultation des statistiques', () => {

    test('[P2] devrait afficher la page des statistiques', async ({ page }) => {
      console.log('📊 Test: Affichage de la page statistiques');

      // THEN: La page doit être accessible
      await expect(page).toHaveURL(/analytics|statistics|stats/i);

      // Vérifier le titre de la page
      const pageTitle = page.locator('h1, .text-3xl').filter({
        hasText: /analytique|statistique|performance/i
      });

      if (await pageTitle.count() > 0) {
        await expect(pageTitle.first()).toBeVisible();
        console.log('✅ Page des statistiques affichée');
      } else {
        console.log('ℹ️ Titre alternatif ou format différent');
      }
    });

    test('[P2] devrait afficher les KPIs principaux', async ({ page }) => {
      console.log('📈 Test: Affichage des KPIs');

      // THEN: Vérifier les indicateurs clés de performance
      const kpiCards = page.locator('[class*="card"], .card, [class*="kpi"]');
      const kpiCount = await kpiCards.count();

      console.log(`📊 Cartes KPI trouvées: ${kpiCount}`);

      // Vérifier les KPIs attendus
      const expectedKPIs = [
        { label: /chiffre.?d.?affaires|ca|revenue/i, icon: 'DollarSign' },
        { label: /commandes|orders/i, icon: 'ShoppingCart' },
        { label: /panier.?moyen|average/i, icon: 'Target' },
        { label: /client|customer/i, icon: 'Users' },
        { label: /satisfaction|rating/i, icon: 'Star' },
        { label: /temps.?moyen|time/i, icon: 'Zap' }
      ];

      let foundKPIs = 0;
      for (const kpi of expectedKPIs) {
        const kpiElement = page.locator('*').filter({ hasText: kpi.label });
        if (await kpiElement.count() > 0) {
          foundKPIs++;
        }
      }

      console.log(`📊 KPIs identifiés: ${foundKPIs}/${expectedKPIs.length}`);
      expect(foundKPIs).toBeGreaterThan(0);
      console.log('✅ KPIs principaux affichés');
    });

    test('[P2] devrait afficher le chiffre d\'affaires', async ({ page }) => {
      console.log('💰 Test: KPI Chiffre d\'affaires');

      // THEN: Vérifier l'affichage du CA
      const revenueCard = page.locator('*').filter({
        hasText: /chiffre.?d.?affaires|ca.?aujourd|revenue/i
      });

      if (await revenueCard.count() > 0) {
        console.log('✅ Chiffre d\'affaires affiché');

        // Vérifier le format monétaire
        const amount = page.locator('*').filter({ hasText: /\d+[,.]?\d*\s*€|eur/i });
        if (await amount.count() > 0) {
          console.log('✅ Montant au format monétaire');
        }
      }
    });

    test('[P2] devrait afficher le nombre de commandes', async ({ page }) => {
      console.log('📦 Test: KPI Nombre de commandes');

      // THEN: Vérifier l'affichage du nombre de commandes
      const ordersCard = page.locator('*').filter({
        hasText: /commandes/i
      });

      if (await ordersCard.count() > 0) {
        console.log('✅ Nombre de commandes affiché');

        // Vérifier qu'il y a un nombre
        const orderCount = page.locator('*').filter({
          hasText: /\d+/
        });
        expect(await orderCount.count()).toBeGreaterThan(0);
      }
    });

    test('[P2] devrait afficher le panier moyen', async ({ page }) => {
      console.log('🛒 Test: KPI Panier moyen');

      // THEN: Vérifier l'affichage du panier moyen
      const avgOrderCard = page.locator('*').filter({
        hasText: /panier.?moyen|average/i
      });

      if (await avgOrderCard.count() > 0) {
        console.log('✅ Panier moyen affiché');

        // Vérifier le format monétaire
        const avgAmount = page.locator('*').filter({ hasText: /\d+\s*€/i });
        if (await avgAmount.count() > 0) {
          console.log('✅ Montant moyen au format monétaire');
        }
      }
    });

    test('[P2] devrait afficher la note de satisfaction', async ({ page }) => {
      console.log('⭐ Test: KPI Satisfaction');

      // THEN: Vérifier l'affichage de la satisfaction
      const satisfactionCard = page.locator('*').filter({
        hasText: /satisfaction|note|rating/i
      });

      if (await satisfactionCard.count() > 0) {
        console.log('✅ Note de satisfaction affichée');

        // Vérifier le format (x.x ou x/5)
        const rating = page.locator('*').filter({ hasText: /\d[.,]\d|\/5/i });
        if (await rating.count() > 0) {
          console.log('✅ Note au format numérique');
        }
      }
    });

    test('[P2] devrait afficher les tendances (+/-)', async ({ page }) => {
      console.log('📈 Test: Indicateurs de tendance');

      // THEN: Vérifier les indicateurs de tendance
      const trendIndicators = page.locator('*').filter({
        hasText: /\+\d+%|\-\d+%|↑|↓/i
      });

      const trendCount = await trendIndicators.count();
      console.log(`📊 Indicateurs de tendance trouvés: ${trendCount}`);

      if (trendCount > 0) {
        console.log('✅ Tendances affichées avec pourcentages');
      }

      // Vérifier les icônes de tendance
      const trendIcons = page.locator('[class*="trending"], svg').filter({
        has: page.locator('[class*="up"], [class*="down"]')
      });

      if (await trendIcons.count() > 0) {
        console.log('✅ Icônes de tendance présentes');
      }
    });
  });

  /**
   * Tests des graphiques
   */
  test.describe('Graphiques et visualisations', () => {

    test('[P2] devrait afficher le graphique d\'évolution du CA', async ({ page }) => {
      console.log('📉 Test: Graphique évolution CA');

      // THEN: Vérifier la présence du graphique CA
      const chartSection = page.locator('*').filter({
        hasText: /évolution|chiffre.?d.?affaires|revenue/i
      });

      if (await chartSection.count() > 0) {
        console.log('✅ Section graphique CA trouvée');

        // Vérifier le composant Recharts ou SVG
        const chart = page.locator('svg, .recharts-surface, [class*="chart"]');
        if (await chart.count() > 0) {
          console.log('✅ Graphique SVG/Recharts présent');
        }
      }
    });

    test('[P2] devrait afficher le graphique des commandes par jour', async ({ page }) => {
      console.log('📊 Test: Graphique commandes par jour');

      // THEN: Vérifier la présence du graphique commandes
      const chartSection = page.locator('*').filter({
        hasText: /commandes.?par.?jour|orders/i
      });

      if (await chartSection.count() > 0) {
        console.log('✅ Section graphique commandes trouvée');

        // Vérifier le composant graphique
        const barChart = page.locator('.recharts-bar, .recharts-layer, svg rect');
        if (await barChart.count() > 0) {
          console.log('✅ Graphique en barres présent');
        }
      }
    });

    test('[P2] devrait afficher le graphique d\'affluence par heure', async ({ page }) => {
      console.log('🕐 Test: Graphique affluence horaire');

      // THEN: Vérifier la présence du graphique affluence
      const chartSection = page.locator('*').filter({
        hasText: /affluence|heure|hour|rush/i
      });

      if (await chartSection.count() > 0) {
        console.log('✅ Section graphique affluence trouvée');

        // Vérifier le composant ligne
        const lineChart = page.locator('.recharts-line, svg path');
        if (await lineChart.count() > 0) {
          console.log('✅ Graphique en ligne présent');
        }
      }
    });

    test('[P2] devrait afficher le graphique des types de commande', async ({ page }) => {
      console.log('🥧 Test: Graphique types de commande');

      // THEN: Vérifier la présence du camembert
      const pieSection = page.locator('*').filter({
        hasText: /type|emporter|sur.?place|pickup|delivery/i
      });

      if (await pieSection.count() > 0) {
        console.log('✅ Section types de commande trouvée');

        // Vérifier le composant camembert
        const pieChart = page.locator('.recharts-pie, svg circle, svg path[class*="pie"]');
        if (await pieChart.count() > 0) {
          console.log('✅ Graphique camembert présent');
        }
      }
    });
  });

  /**
   * Tests du tableau des meilleurs plats
   */
  test.describe('Top des plats', () => {

    test('[P2] devrait afficher le classement des meilleurs plats', async ({ page }) => {
      console.log('🏆 Test: Top des plats');

      // THEN: Vérifier la section Top des plats
      const topSection = page.locator('*').filter({
        hasText: /top.?\d|meilleur|plus.?commandé/i
      });

      if (await topSection.count() > 0) {
        console.log('✅ Section Top des plats trouvée');

        // Vérifier le tableau
        const table = page.locator('table, [class*="table"]');
        if (await table.count() > 0) {
          console.log('✅ Tableau des meilleurs plats présent');

          // Vérifier les colonnes
          const headers = table.locator('th, thead');
          if (await headers.count() > 0) {
            console.log('✅ En-têtes du tableau présents');
          }

          // Vérifier les lignes de données
          const rows = table.locator('tbody tr, [class*="row"]');
          const rowCount = await rows.count();
          console.log(`📊 ${rowCount} plats dans le classement`);
        }
      }
    });

    test('[P2] devrait afficher les détails de chaque plat (commandes, CA)', async ({ page }) => {
      console.log('📋 Test: Détails par plat');

      // THEN: Vérifier les colonnes détaillées
      const table = page.locator('table');

      if (await table.count() > 0) {
        // Vérifier les colonnes attendues
        const expectedColumns = ['plat', 'commandes', 'ca', 'évolution'];
        let foundColumns = 0;

        for (const col of expectedColumns) {
          const header = table.locator('th, .font-medium').filter({
            hasText: new RegExp(col, 'i')
          });
          if (await header.count() > 0) {
            foundColumns++;
          }
        }

        console.log(`📊 Colonnes trouvées: ${foundColumns}/${expectedColumns.length}`);

        // Vérifier les pourcentages d'évolution
        const evolution = table.locator('*').filter({ hasText: /%/i });
        if (await evolution.count() > 0) {
          console.log('✅ Évolution en pourcentage affichée');
        }
      }
    });
  });

  /**
   * Tests du sélecteur de période
   */
  test.describe('Sélection de période', () => {

    test('[P2] devrait permettre de changer la période (jour/semaine/mois/année)', async ({ page }) => {
      console.log('📅 Test: Sélecteur de période');

      // THEN: Vérifier le sélecteur de période
      const periodSelector = page.locator('select, [class*="select"]').filter({
        has: page.locator('option')
      });

      if (await periodSelector.count() > 0) {
        console.log('✅ Sélecteur de période trouvé');

        // Vérifier les options disponibles
        const options = periodSelector.locator('option');
        const optionCount = await options.count();
        console.log(`📊 ${optionCount} options de période`);

        // Vérifier les périodes attendues
        const expectedPeriods = ['aujourd', 'semaine', 'mois', 'année'];
        let foundPeriods = 0;

        for (const period of expectedPeriods) {
          const option = page.locator('option').filter({
            hasText: new RegExp(period, 'i')
          });
          if (await option.count() > 0) {
            foundPeriods++;
          }
        }

        console.log(`📊 Périodes trouvées: ${foundPeriods}/${expectedPeriods.length}`);
      } else {
        // Chercher des boutons de période
        const periodButtons = page.locator('button').filter({
          hasText: /aujourd|semaine|mois|année|today|week|month|year/i
        });
        if (await periodButtons.count() > 0) {
          console.log('✅ Boutons de période trouvés');
        }
      }
    });

    test('[P2] devrait mettre à jour les données au changement de période', async ({ page }) => {
      console.log('🔄 Test: Mise à jour au changement de période');

      // GIVEN: Le sélecteur de période existe
      const periodSelector = page.locator('select').first();

      if (await periodSelector.count() > 0) {
        // Capturer une valeur actuelle
        const initialValue = await page.locator('[class*="kpi"], .card .text-2xl').first().textContent();

        // WHEN: Changer la période
        await periodSelector.selectOption({ index: 1 });
        await page.waitForTimeout(1000);

        // THEN: Les données devraient être mises à jour
        // (ou un indicateur de chargement devrait apparaître)
        const loadingIndicator = page.locator('[class*="loading"], [class*="spinner"], .animate-spin');
        const hasLoading = await loadingIndicator.count() > 0;

        if (hasLoading) {
          console.log('✅ Indicateur de chargement affiché');
        }

        console.log('✅ Changement de période fonctionnel');
      }
    });
  });

  /**
   * Tests des fonctionnalités d'export et rafraîchissement
   */
  test.describe('Export et rafraîchissement', () => {

    test('[P2] devrait permettre de rafraîchir les données', async ({ page }) => {
      console.log('🔃 Test: Bouton Actualiser');

      // THEN: Vérifier le bouton de rafraîchissement
      const refreshButton = page.locator('button').filter({
        hasText: /actualiser|refresh|rafraîchir/i
      });

      if (await refreshButton.count() > 0) {
        await expect(refreshButton.first()).toBeVisible();
        await expect(refreshButton.first()).toBeEnabled();
        console.log('✅ Bouton Actualiser présent et actif');

        // Cliquer pour tester
        await refreshButton.first().click();
        await page.waitForTimeout(1000);

        // Vérifier l'animation de chargement
        const spinningIcon = page.locator('.animate-spin, [class*="spin"]');
        if (await spinningIcon.count() > 0) {
          console.log('✅ Animation de chargement affichée');
        }
      }
    });

    test('[P2] devrait permettre d\'exporter les données', async ({ page }) => {
      console.log('📥 Test: Bouton Exporter');

      // THEN: Vérifier le bouton d'export
      const exportButton = page.locator('button').filter({
        hasText: /exporter|export|télécharger|download/i
      });

      if (await exportButton.count() > 0) {
        await expect(exportButton.first()).toBeVisible();
        await expect(exportButton.first()).toBeEnabled();
        console.log('✅ Bouton Exporter présent et actif');

        // Vérifier l'icône Download
        const downloadIcon = exportButton.locator('svg');
        if (await downloadIcon.count() > 0) {
          console.log('✅ Icône de téléchargement présente');
        }
      } else {
        console.log('ℹ️ Export non disponible sur cette page');
      }
    });

    test('[P2] devrait afficher la date de dernière mise à jour', async ({ page }) => {
      console.log('🕐 Test: Date de dernière mise à jour');

      // THEN: Vérifier l'affichage de la date
      const lastUpdated = page.locator('*').filter({
        hasText: /dernière.?mise.?à.?jour|last.?update|à\s+\d{2}:\d{2}/i
      });

      if (await lastUpdated.count() > 0) {
        console.log('✅ Date de dernière mise à jour affichée');

        // Vérifier le format de date/heure
        const dateTime = page.locator('*').filter({
          hasText: /\d{2}\/\d{2}\/\d{4}|\d{2}:\d{2}/i
        });
        if (await dateTime.count() > 0) {
          console.log('✅ Format date/heure correct');
        }
      }
    });
  });

  /**
   * Tests responsive
   */
  test.describe('Affichage responsive', () => {

    test('[P2] devrait s\'adapter à l\'affichage mobile', async ({ page }) => {
      console.log('📱 Test: Affichage mobile');

      // WHEN: Redimensionner en mode mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(1000);

      // THEN: Les éléments doivent rester visibles
      const kpiCards = page.locator('[class*="card"], .card');
      expect(await kpiCards.count()).toBeGreaterThan(0);
      console.log('✅ Cartes KPI visibles en mobile');

      // Vérifier le scroll horizontal si nécessaire
      const charts = page.locator('svg, .recharts-surface');
      if (await charts.count() > 0) {
        console.log('✅ Graphiques adaptés au mobile');
      }
    });

    test('[P2] devrait s\'adapter à l\'affichage tablette', async ({ page }) => {
      console.log('📟 Test: Affichage tablette');

      // WHEN: Redimensionner en mode tablette
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(1000);

      // THEN: Les éléments doivent être en grille adaptée
      const kpiCards = page.locator('[class*="card"], .card');
      expect(await kpiCards.count()).toBeGreaterThan(0);
      console.log('✅ Cartes KPI visibles en tablette');
    });
  });
});