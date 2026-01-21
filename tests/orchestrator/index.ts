#!/usr/bin/env npx ts-node
/**
 * OneEats Test Orchestrator - Point d'entrée CLI
 *
 * Usage:
 *   npx ts-node tests/orchestrator/index.ts --flow=order
 *   npx ts-node tests/orchestrator/index.ts --flow=menu --action=create
 *   npm run orchestrator -- --flow=order
 *
 * Options:
 *   --flow       Flow à exécuter: order, menu (requis)
 *   --action     Action pour menu flow: create, update, toggle, delete
 *   --maestro    Utiliser Maestro pour les tests mobile (par défaut: false)
 *   --headed     Exécuter avec navigateur visible (par défaut: false)
 *   --verbose    Mode verbeux (par défaut: false)
 *   --help       Afficher l'aide
 */

import { runOrderFlow, OrderFlowOptions } from './flows/order-flow';
import { runMenuFlow, MenuFlowOptions } from './flows/menu-flow';
import { logger } from './utils';
import config from './config';

// ==================== PARSING DES ARGUMENTS ====================

interface CliArgs {
  flow?: string;
  action?: string;
  maestro?: boolean;
  headed?: boolean;
  verbose?: boolean;
  help?: boolean;
  restaurantId?: string;
}

function parseArgs(): CliArgs {
  const args: CliArgs = {};

  for (const arg of process.argv.slice(2)) {
    if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else if (arg === '--maestro') {
      args.maestro = true;
    } else if (arg === '--headed') {
      args.headed = true;
    } else if (arg === '--verbose' || arg === '-v') {
      args.verbose = true;
    } else if (arg.startsWith('--flow=')) {
      args.flow = arg.split('=')[1];
    } else if (arg.startsWith('--action=')) {
      args.action = arg.split('=')[1];
    } else if (arg.startsWith('--restaurant=')) {
      args.restaurantId = arg.split('=')[1];
    }
  }

  return args;
}

function printHelp(): void {
  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║          OneEats Test Orchestrator - Tests Cross-Platform          ║
╚═══════════════════════════════════════════════════════════════════╝

USAGE:
  npx ts-node tests/orchestrator/index.ts [options]
  npm run orchestrator -- [options]

OPTIONS:
  --flow=<name>      Flow à exécuter (requis)
                     Valeurs: order, menu

  --action=<action>  Action pour le menu flow
                     Valeurs: create, update, toggle, delete
                     Par défaut: create

  --maestro          Utiliser Maestro pour les tests mobile
                     Par défaut: false (simulation via API)

  --headed           Exécuter avec navigateur visible
                     Par défaut: false (headless)

  --verbose, -v      Mode verbeux avec plus de détails

  --restaurant=<id>  ID du restaurant à utiliser

  --help, -h         Afficher cette aide

EXEMPLES:
  # Tester le flow de commande (simulation API)
  npx ts-node tests/orchestrator/index.ts --flow=order

  # Tester le flow de commande avec Maestro
  npx ts-node tests/orchestrator/index.ts --flow=order --maestro

  # Créer un plat via le dashboard
  npx ts-node tests/orchestrator/index.ts --flow=menu --action=create

  # Modifier un plat avec navigateur visible
  npx ts-node tests/orchestrator/index.ts --flow=menu --action=update --headed

FLOWS DISPONIBLES:
  order    Test du cycle de vie d'une commande
           Mobile: Client crée une commande
           Web: Restaurant voit et accepte
           Vérifie la synchronisation des statuts

  menu     Test de la gestion du menu
           Web: Restaurant ajoute/modifie un plat
           API: Vérifie la synchronisation
           Mobile: Client voit le changement

PRÉREQUIS:
  1. Backend Quarkus démarré (http://localhost:8080)
  2. Base de données avec données de test
  3. Pour --maestro: Émulateur Android + App mobile

RAPPORTS:
  Les rapports sont générés dans: tests/reports/orchestrator/
  Format: JSON et Markdown

`);
}

// ==================== EXÉCUTION ====================

async function main(): Promise<void> {
  const args = parseArgs();

  // Afficher l'aide
  if (args.help) {
    printHelp();
    process.exit(0);
  }

  // Vérifier que le flow est spécifié
  if (!args.flow) {
    console.error('❌ Erreur: --flow est requis\n');
    console.error('Utilisez --help pour voir les options disponibles');
    process.exit(1);
  }

  // Appliquer les options globales
  if (args.headed) {
    process.env.HEADED = 'true';
  }
  if (args.verbose) {
    process.env.VERBOSE = 'true';
  }

  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                  OneEats Test Orchestrator                         ║
╚═══════════════════════════════════════════════════════════════════╝
`);

  console.log(`Flow: ${args.flow}`);
  console.log(`Maestro: ${args.maestro ? 'Oui' : 'Non (simulation API)'}`);
  console.log(`Headed: ${args.headed ? 'Oui' : 'Non (headless)'}`);
  console.log(`Verbose: ${args.verbose ? 'Oui' : 'Non'}`);
  console.log('');

  try {
    let result: { success: boolean; errors: string[] };

    switch (args.flow.toLowerCase()) {
      case 'order':
        const orderOptions: OrderFlowOptions = {
          useMaestro: args.maestro,
          restaurant: args.restaurantId ? { id: args.restaurantId } : undefined,
        };
        result = await runOrderFlow(orderOptions);
        break;

      case 'menu':
        const menuOptions: MenuFlowOptions = {
          useMaestro: args.maestro,
          action: (args.action as 'create' | 'update' | 'toggle' | 'delete') || 'create',
          restaurantId: args.restaurantId,
        };
        result = await runMenuFlow(menuOptions);
        break;

      default:
        console.error(`❌ Flow inconnu: ${args.flow}`);
        console.error('Flows disponibles: order, menu');
        process.exit(1);
    }

    // Afficher le résultat final
    console.log('\n');
    if (result.success) {
      console.log('╔═══════════════════════════════════════════════════════════════════╗');
      console.log('║                    ✅ TEST RÉUSSI                                  ║');
      console.log('╚═══════════════════════════════════════════════════════════════════╝');
      process.exit(0);
    } else {
      console.log('╔═══════════════════════════════════════════════════════════════════╗');
      console.log('║                    ❌ TEST ÉCHOUÉ                                  ║');
      console.log('╚═══════════════════════════════════════════════════════════════════╝');
      console.log('\nErreurs:');
      for (const error of result.errors) {
        console.log(`  - ${error}`);
      }
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Erreur fatale:', (error as Error).message);
    if (args.verbose) {
      console.error((error as Error).stack);
    }
    process.exit(1);
  }
}

// Exécuter
main().catch((error) => {
  console.error('Erreur non gérée:', error);
  process.exit(1);
});