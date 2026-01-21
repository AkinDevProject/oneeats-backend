# Infrastructure de Tests Automatisés - OneEats

> **Document technique** : Configuration et mise en place des outils de test pour Claude Code

---

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture de test](#architecture-de-test)
3. [Technologies utilisées](#technologies-utilisées)
4. [Configuration Playwright](#configuration-playwright)
5. [Configuration Maestro](#configuration-maestro)
6. [Configuration Playwright MCP](#configuration-playwright-mcp)
7. [Prérequis système](#prérequis-système)
8. [Structure des fichiers](#structure-des-fichiers)
9. [Variables d'environnement](#variables-denvironnement)
10. [Troubleshooting](#troubleshooting)
11. [**Orchestrateur de Tests Cross-Platform**](#orchestrateur-de-tests-cross-platform) ⭐ NOUVEAU

---

## Vue d'ensemble

Le projet OneEats utilise une infrastructure de tests multi-plateforme permettant à **Claude Code** d'exécuter des tests automatisés sur :

- **Web Dashboard** : Tests E2E via Playwright
- **Application Mobile** : Tests E2E via Maestro
- **APIs Backend** : Tests d'intégration via Playwright Test

### Objectifs

1. Permettre à Claude Code de détecter automatiquement les bugs
2. Valider les flux utilisateur cross-platform (mobile → web)
3. Générer des rapports de test exploitables
4. Maintenir une couverture de test élevée

---

## Architecture de test

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Claude Code                                  │
│                              │                                       │
│         ┌────────────────────┼────────────────────┐                 │
│         │                    │                    │                 │
│         ▼                    ▼                    ▼                 │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐           │
│  │ Playwright  │     │ Playwright  │     │   Maestro   │           │
│  │    Test     │     │     MCP     │     │   (Bash)    │           │
│  │  (npx/PS)   │     │  (browser_*)│     │             │           │
│  └──────┬──────┘     └──────┬──────┘     └──────┬──────┘           │
│         │                   │                   │                   │
│         ▼                   ▼                   ▼                   │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐           │
│  │  Chromium   │     │   Chrome    │     │  Émulateur  │           │
│  │  (headless) │     │  (visible)  │     │   Android   │           │
│  └──────┬──────┘     └──────┬──────┘     └──────┬──────┘           │
│         │                   │                   │                   │
│         └───────────────────┼───────────────────┘                   │
│                             ▼                                       │
│                    ┌─────────────────┐                              │
│                    │  Backend Quarkus │                             │
│                    │   (localhost:8080)│                            │
│                    └────────┬─────────┘                             │
│                             │                                       │
│              ┌──────────────┼──────────────┐                        │
│              ▼              ▼              ▼                        │
│       ┌───────────┐  ┌───────────┐  ┌───────────┐                  │
│       │ PostgreSQL│  │ Keycloak  │  │  Quinoa   │                  │
│       │   (DB)    │  │  (Auth)   │  │  (React)  │                  │
│       └───────────┘  └───────────┘  └───────────┘                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Flux de données

1. **Claude Code** invoque les outils de test (Bash, MCP)
2. **Playwright/Maestro** exécute les actions sur les interfaces
3. **Backend Quarkus** traite les requêtes
4. **Résultats** remontent à Claude Code pour analyse

---

## Technologies utilisées

### 1. Playwright Test (Web E2E)

| Aspect | Détail |
|--------|--------|
| **Version** | 1.55.0 |
| **Langage** | TypeScript |
| **Navigateur** | Chromium (headless par défaut) |
| **Installation** | `npm install @playwright/test` |
| **Exécution** | `npx playwright test` |

**Pourquoi Playwright ?**
- Support natif TypeScript
- Multi-navigateur (Chromium, Firefox, WebKit)
- API puissante pour les assertions
- Génération de rapports HTML/JSON/JUnit
- Traces et screenshots automatiques

### 2. Playwright MCP (Browser Automation pour Claude)

| Aspect | Détail |
|--------|--------|
| **Package** | `@playwright/mcp` |
| **Auteur** | Microsoft |
| **Protocol** | Model Context Protocol (MCP) |
| **Installation** | Configuration `.mcp.json` |

**Pourquoi Playwright MCP ?**
- Permet à Claude Code de contrôler un navigateur en temps réel
- Outils disponibles : `browser_navigate`, `browser_click`, `browser_type`, `browser_screenshot`
- Interaction visuelle avec l'application

### 3. Maestro (Mobile E2E)

| Aspect | Détail |
|--------|--------|
| **Version** | Dernière stable |
| **Plateforme** | Android, iOS |
| **Format tests** | YAML |
| **Installation** | `npm install -g maestro` ou `choco install maestro` |
| **Exécution** | `maestro test <file.yaml>` |

**Pourquoi Maestro ?**
- Syntaxe YAML simple et lisible
- Pas besoin de code complexe
- Support Expo/React Native natif
- Mode studio pour enregistrement de tests

### 4. Jest (Tests unitaires Mobile)

| Aspect | Détail |
|--------|--------|
| **Version** | 29.x |
| **Framework** | React Native Testing Library |
| **Couverture** | Contexts, Services, Hooks, Components |
| **Exécution** | `npm test` (dans apps/mobile) |

---

## Configuration Playwright

### Fichier principal : `tests/playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './specs',
  outputDir: './test-results',

  // Timeouts
  timeout: 60000,           // 60s par test
  expect: { timeout: 10000 }, // 10s pour assertions

  // Exécution
  fullyParallel: false,     // Séquentiel (évite conflits BDD)
  retries: process.env.CI ? 2 : 0,
  workers: 1,

  // Reporters
  reporter: [
    ['html', { outputFolder: './reports/html' }],
    ['json', { outputFile: './reports/results.json' }],
    ['junit', { outputFile: './reports/junit.xml' }],
    ['list']
  ],

  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: !process.env.HEADED,
    viewport: { width: 1280, height: 720 },
  },

  projects: [
    // Tests Dashboard Restaurant
    {
      name: 'restaurant-dashboard',
      testMatch: /restaurant\//,
      use: { ...devices['Desktop Chrome'] },
    },
    // Tests API Backend
    {
      name: 'api-backend',
      testMatch: /simple-api-tests/,
      use: { baseURL: 'http://localhost:8080/api' },
    },
    // Tests Intégration
    {
      name: 'integration',
      testMatch: /integration-complete/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  globalSetup: './setup/global-setup.ts',
  globalTeardown: './setup/global-teardown.ts',
});
```

### Installation

```bash
cd tests
npm install
npx playwright install chromium
```

### Structure des tests

```
tests/
├── playwright.config.ts    # Configuration principale
├── package.json            # Dépendances
├── .env                    # Variables d'environnement
├── setup/
│   ├── global-setup.ts     # Setup avant tous les tests
│   └── global-teardown.ts  # Cleanup après tous les tests
├── helpers/
│   └── database-helper.ts  # Helpers pour la BDD
├── specs/
│   ├── simple-api-tests.spec.ts
│   ├── restaurant/
│   │   ├── authentication.spec.ts
│   │   ├── menu-management.spec.ts
│   │   ├── order-management.spec.ts
│   │   └── dashboard-responsive.spec.ts
│   └── integration-complete.spec.ts
└── reports/                # Rapports générés
```

---

## Configuration Maestro

### Fichier de configuration : `apps/mobile/.maestro/config.yaml`

```yaml
# Configuration Maestro pour OneEats Mobile
appId: com.oneeats.mobile

# Timeout global
defaultTimeout: 10000

# Flows à exécuter
flows:
  - flows/*.yaml

# Configuration device
device:
  platform: android  # ou ios

# Variables d'environnement
env:
  API_URL: http://192.168.1.111:8080/api
  TEST_USER_EMAIL: test@oneeats.com
  TEST_USER_PASSWORD: password123
```

### Structure des tests Maestro

```
apps/mobile/.maestro/
├── config.yaml              # Configuration
└── flows/
    ├── 01-navigation-flow.yaml
    ├── 02-auth-flow.yaml
    ├── 03-restaurant-view-flow.yaml
    ├── 04-cart-flow.yaml
    └── 05-order-flow.yaml
```

### Exemple de flow Maestro

```yaml
# flows/02-auth-flow.yaml
appId: com.oneeats.mobile
---
- launchApp
- assertVisible: "Se connecter"
- tapOn: "Email"
- inputText: "test@oneeats.com"
- tapOn: "Mot de passe"
- inputText: "Test123!"
- tapOn: "Se connecter"
- assertVisible: "Restaurants"
```

### Commandes Maestro

```bash
# Lancer un test spécifique
maestro test apps/mobile/.maestro/flows/02-auth-flow.yaml

# Lancer tous les tests
maestro test apps/mobile/.maestro/flows/

# Mode studio (enregistrement)
maestro studio

# Screenshot
maestro screenshot output.png
```

---

## Configuration Playwright MCP

### Fichier : `.mcp.json` (racine du projet)

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

### Outils MCP disponibles

| Outil | Description | Exemple |
|-------|-------------|---------|
| `browser_navigate` | Naviguer vers une URL | `browser_navigate("http://localhost:8080")` |
| `browser_click` | Cliquer sur un élément | `browser_click("button#submit")` |
| `browser_type` | Saisir du texte | `browser_type("input#email", "test@test.com")` |
| `browser_screenshot` | Capturer l'écran | `browser_screenshot()` |
| `browser_console_messages` | Voir les erreurs console | `browser_console_messages()` |

### Activation

1. Créer/modifier `.mcp.json`
2. **Redémarrer Claude Code** (obligatoire)
3. Les outils `browser_*` deviennent disponibles

### Utilisation par Claude Code

```
Claude: Je vais naviguer vers le dashboard
[Utilise browser_navigate("http://localhost:8080/restaurant")]

Claude: Je prends une capture d'écran
[Utilise browser_screenshot()]
```

---

## Prérequis système

### Backend

| Composant | Requis | Vérification |
|-----------|--------|--------------|
| Java JDK | 17+ | `java -version` |
| Quarkus | 3.24.2 | Via IntelliJ |
| PostgreSQL | 14+ | `docker ps` |
| Keycloak | 24.0 | `docker ps` |

### Tests Web (Playwright)

| Composant | Requis | Installation |
|-----------|--------|--------------|
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| Playwright | 1.40+ | `npx playwright --version` |
| Chromium | Auto | `npx playwright install chromium` |

### Tests Mobile (Maestro)

| Composant | Requis | Installation |
|-----------|--------|--------------|
| Android SDK | API 28+ | Android Studio |
| ADB | Inclus SDK | `adb devices` |
| Émulateur | Pixel 5+ | AVD Manager |
| Maestro | Dernière | `npm install -g maestro` |
| Expo | 50+ | `expo --version` |

### Vérification complète

```bash
# Backend
curl -s http://localhost:8080/api/restaurants | head -1

# Playwright
cd tests && npx playwright --version

# Maestro
maestro --version

# Émulateur Android
$env:LOCALAPPDATA/Android/Sdk/platform-tools/adb.exe devices

# Metro bundler (mobile)
curl -s http://localhost:8081/status
```

---

## Structure des fichiers

```
oneeats-backend/
├── .mcp.json                          # Config Playwright MCP
├── tests/                             # Tests E2E Web
│   ├── playwright.config.ts
│   ├── package.json
│   ├── .env
│   ├── setup/
│   │   ├── global-setup.ts
│   │   └── global-teardown.ts
│   ├── helpers/
│   │   └── database-helper.ts
│   ├── specs/
│   │   ├── simple-api-tests.spec.ts
│   │   ├── restaurant/
│   │   │   ├── authentication.spec.ts
│   │   │   ├── menu-management.spec.ts
│   │   │   ├── order-management.spec.ts
│   │   │   ├── restaurant-settings.spec.ts
│   │   │   └── dashboard-responsive.spec.ts
│   │   └── integration-complete.spec.ts
│   ├── reports/
│   │   ├── html/
│   │   ├── results.json
│   │   └── junit.xml
│   └── test-results/
├── apps/mobile/
│   ├── .maestro/                      # Tests E2E Mobile
│   │   ├── config.yaml
│   │   └── flows/
│   │       ├── 01-navigation-flow.yaml
│   │       ├── 02-auth-flow.yaml
│   │       ├── 03-restaurant-view-flow.yaml
│   │       ├── 04-cart-flow.yaml
│   │       └── 05-order-flow.yaml
│   └── tests/                         # Tests unitaires Mobile
│       └── unit/
│           ├── contexts/
│           ├── services/
│           └── hooks/
└── docs/
    ├── UAT_SETUP.md                   # Guide setup UAT
    ├── UAT_GUIDE_ADMIN.md             # Scénarios admin
    ├── UAT_GUIDE_RESTAURANT.md        # Scénarios restaurant
    ├── UAT_GUIDE_MOBILE.md            # Scénarios mobile
    ├── reports/
    │   └── UAT_REPORT_*.md            # Rapports UAT
    └── shared/tea/
        ├── TESTING_INFRASTRUCTURE.md  # Ce document
        └── TESTING_GUIDE.md           # Guide d'utilisation
```

---

## Variables d'environnement

### Fichier `tests/.env`

```bash
# URLs
BASE_URL=http://localhost:8080
API_URL=http://localhost:8080/api
KEYCLOAK_URL=http://192.168.1.111:8580

# Database (si tests BDD directe)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=oneeats_dev
DB_USER=oneeats_user
DB_PASSWORD=oneeats_password

# Test users
TEST_RESTAURANT_EMAIL=restaurant@oneeats.com
TEST_RESTAURANT_PASSWORD=Test123!
TEST_CLIENT_EMAIL=client@oneeats.com
TEST_CLIENT_PASSWORD=Test123!
TEST_ADMIN_EMAIL=admin@oneeats.com
TEST_ADMIN_PASSWORD=Admin123!

# Options
HEADED=false
CI=false
```

### Variables Maestro

Dans `apps/mobile/.maestro/config.yaml` :
```yaml
env:
  API_URL: http://192.168.1.111:8080/api
  TEST_USER_EMAIL: test@oneeats.com
  TEST_USER_PASSWORD: password123
```

---

## Troubleshooting

### Playwright ne s'exécute pas

**Symptôme** : Commande `npx playwright test` sans output

**Solution** : Utiliser PowerShell
```powershell
powershell -Command "cd 'C:/path/to/tests'; npx playwright test 2>&1"
```

### Playwright MCP non disponible

**Symptôme** : Outils `browser_*` non disponibles dans Claude Code

**Solution** :
1. Vérifier `.mcp.json` existe à la racine
2. **Redémarrer Claude Code** (obligatoire après modification)
3. Vérifier que `@playwright/mcp` est accessible

### Maestro ne trouve pas l'app

**Symptôme** : `App not found: com.oneeats.mobile`

**Solution** :
1. Vérifier que l'émulateur est démarré : `adb devices`
2. Vérifier que l'app est installée ou que Metro est lancé
3. Pour Expo Go, utiliser `host.exp.exponent` comme appId

### Tests échouent avec 302 (redirect)

**Symptôme** : API retourne 302 au lieu de 200

**Cause** : Endpoint protégé par authentification

**Solution** :
1. Vérifier `application.yml` pour les endpoints publics
2. Implémenter auth setup pour les tests

### Émulateur non détecté

**Symptôme** : `adb: command not found`

**Solution** : Utiliser le chemin complet
```powershell
$env:LOCALAPPDATA/Android/Sdk/platform-tools/adb.exe devices
```

---

## Références

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright MCP (Microsoft)](https://github.com/microsoft/playwright-mcp)
- [Maestro Documentation](https://maestro.mobile.dev/docs)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Expo Testing](https://docs.expo.dev/develop/unit-testing/)

---

---

## Orchestrateur de Tests Cross-Platform

L'orchestrateur est un composant central qui **coordonne** les tests entre plusieurs plateformes (Mobile, Web, API) et permet de vérifier la **synchronisation des données** de bout en bout.

### Architecture de l'orchestrateur

```
tests/orchestrator/
├── index.ts                 # Point d'entrée CLI
├── config.ts                # Configuration centralisée
├── drivers/                 # Interfaces avec les outils de test
│   ├── api-driver.ts        # Interaction avec l'API REST
│   ├── maestro-driver.ts    # Contrôle de Maestro (mobile)
│   ├── playwright-driver.ts # Contrôle de Playwright (web)
│   └── index.ts
├── utils/                   # Utilitaires communs
│   ├── logger.ts            # Logging coloré et structuré
│   ├── wait.ts              # Fonctions d'attente et timeout
│   ├── retry.ts             # Logique de retry avec backoff
│   ├── data-store.ts        # Partage de données entre étapes
│   ├── reporter.ts          # Génération de rapports
│   └── index.ts
└── flows/                   # Scénarios de test cross-platform
    ├── order-flow.ts        # Flow commande (Mobile → Web)
    ├── menu-flow.ts         # Flow menu (Web → Mobile)
    └── index.ts
```

### Concept : Comment ça fonctionne

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ORCHESTRATEUR                                 │
│                                                                      │
│  1. Séquencer   2. Partager     3. Attendre    4. Vérifier          │
│     les           les             la              les                │
│     étapes        données         sync            assertions         │
│                                                                      │
│         │              │              │              │                │
│         ▼              ▼              ▼              ▼                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │
│  │  Maestro    │ │  DataStore  │ │  waitFor()  │ │  assertEqual│    │
│  │  Playwright │ │  (JSON)     │ │  retry()    │ │  assert()   │    │
│  │  API        │ │             │ │             │ │             │    │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### Flows disponibles

#### 1. Order Flow (Commande)

Teste le cycle de vie complet d'une commande :

| Phase | Plateforme | Action | Vérification |
|-------|------------|--------|--------------|
| 1 | API | Vérification backend disponible | HTTP 200 |
| 2 | Mobile/API | Création commande | ID généré |
| 3 | Web | Dashboard reçoit la commande | Commande visible |
| 4 | Web | Restaurant accepte | Statut = EN_PREPARATION |
| 5 | API | Vérification synchronisation | Statuts identiques |

```bash
# Exécuter le flow (simulation API)
npm run orchestrator:order

# Exécuter avec Maestro (mobile réel)
npm run orchestrator:order:maestro

# Avec navigateur visible
npm run orchestrator -- --flow=order --headed
```

#### 2. Menu Flow (Gestion du menu)

Teste la synchronisation du menu entre dashboard et mobile :

| Action | Description |
|--------|-------------|
| `create` | Crée un plat, vérifie sur mobile |
| `update` | Modifie un plat, vérifie synchronisation |
| `toggle` | Active/désactive un plat |
| `delete` | Supprime un plat, vérifie absence |

```bash
# Créer un plat
npm run orchestrator:menu:create

# Modifier un plat
npm run orchestrator:menu:update

# Avec action spécifique
npm run orchestrator -- --flow=menu --action=toggle
```

### Utilisation CLI

```bash
# Afficher l'aide
npm run orchestrator:help

# Syntaxe générale
npx ts-node tests/orchestrator/index.ts [options]

# Options disponibles
--flow=<name>      # Flow à exécuter: order, menu (requis)
--action=<action>  # Pour menu: create, update, toggle, delete
--maestro          # Utiliser Maestro (sinon simulation API)
--headed           # Navigateur visible
--verbose          # Mode verbeux
--restaurant=<id>  # ID restaurant spécifique
```

### Drivers

#### API Driver

Interface avec le backend REST :

```typescript
const api = new ApiDriver();

// Health check
await api.waitForApi();

// Restaurants
const restaurants = await api.getRestaurants();
const restaurant = await api.getRestaurant(id);

// Menu
const items = await api.getMenuItems(restaurantId);
await api.createMenuItem({ name, price, ... });

// Commandes
const order = await api.createOrder({ restaurantId, items });
await api.updateOrderStatus(orderId, 'EN_PREPARATION');
await api.waitForOrderStatus(orderId, 'PRETE');
```

#### Playwright Driver

Contrôle du navigateur pour le dashboard web :

```typescript
const playwright = new PlaywrightDriver();

// Lifecycle
await playwright.start({ headless: false });
await playwright.stop();

// Navigation
await playwright.navigate('/restaurant/orders');
await playwright.loginRestaurant();

// Interactions
await playwright.click('button#accept');
await playwright.type('input#name', 'Pizza');
await playwright.screenshot('step1.png');

// Assertions
await playwright.assertVisible('[data-order-id="123"]');
await playwright.assertText('.total', '25.00');
```

#### Maestro Driver

Contrôle de l'app mobile via Maestro :

```typescript
const maestro = new MaestroDriver();

// Vérifications
await maestro.checkInstallation();
await maestro.checkEmulator();

// Exécution de flows YAML
await maestro.runFlow('login.yaml', {
  variables: { EMAIL: 'test@test.com' }
});

// Actions directes
await maestro.launchApp();
await maestro.tap('Se connecter');
await maestro.type('password123');
await maestro.screenshot('login.png');
```

### Utilitaires

#### DataStore (Partage de données)

```typescript
const store = new DataStore();

// Stocker avec plateforme source
store.set('orderId', '123', 'mobile');
store.set('orderTotal', 25.00, 'api');

// Récupérer
const orderId = store.get('orderId');

// Méthodes avancées
store.increment('stepCount');
store.push('errors', 'Erreur 1');
store.merge('order', { status: 'ACCEPTED' });
```

#### Retry (avec backoff)

```typescript
// Retry simple
const result = await retry(
  () => api.getOrder(orderId),
  { maxAttempts: 5, delayMs: 2000 }
);

// Retry jusqu'à condition
const order = await retryUntil(
  () => api.getOrder(orderId),
  (order) => order.status === 'PRETE',
  { maxAttempts: 10 }
);
```

#### Wait (synchronisation)

```typescript
// Attente fixe
await wait(3000);

// Attente synchronisation cross-platform
await waitForSync(); // Utilise config.timeouts.sync

// Attente condition
await waitFor(
  () => playwright.isVisible('[data-order]'),
  { timeout: 10000, message: 'Commande visible' }
);

// Attente statut API
await waitForApiStatus(
  () => api.getOrder(orderId),
  'PRETE',
  { timeout: 30000 }
);
```

### Rapports

Les rapports sont générés automatiquement après chaque flow :

```
tests/reports/orchestrator/
├── order-flow_2026-01-21T10-30-00.json    # Rapport JSON
├── order-flow_2026-01-21T10-30-00.md      # Rapport Markdown
├── screenshots/
│   ├── dashboard_login.png
│   ├── order_created.png
│   └── order_accepted.png
└── data-store.json                         # Données partagées
```

#### Format du rapport Markdown

```markdown
# Rapport de Test Cross-Platform

## ✅ Order Flow - Commande Cross-Platform

| Propriété | Valeur |
|-----------|--------|
| **Statut** | PASSED |
| **Durée** | 45.23s |
| **Étapes** | 12 |

## Résumé
- ✅ Passés: 11
- ❌ Échoués: 0
- ⏭️ Ignorés: 1

## Étapes
| # | Étape | Plateforme | Statut | Durée |
|---|-------|------------|--------|-------|
| 1 | Vérification API | 🔌 api | ✅ | 234ms |
| 2 | Création commande | 📱 mobile | ✅ | 1523ms |
...
```

### Prérequis pour l'orchestrateur

| Composant | Requis pour | Installation |
|-----------|-------------|--------------|
| Node.js 18+ | Tous | `node -v` |
| TypeScript | Tous | Inclus dans devDependencies |
| ts-node | Tous | Inclus dans devDependencies |
| Playwright | Web | `npx playwright install` |
| Maestro | Mobile (optionnel) | `npm install -g maestro` |
| Émulateur | Mobile (optionnel) | Android Studio AVD |

### Troubleshooting Orchestrateur

#### "Cannot find module 'playwright'"

```bash
cd tests
npm install
npx playwright install chromium
```

#### "Maestro non disponible"

Vérifier l'installation :
```bash
maestro --version
```

Si non installé :
```bash
npm install -g maestro
# ou
choco install maestro  # Windows
```

#### "Commande non visible dans dashboard"

Causes possibles :
1. Délai de synchronisation trop court → Augmenter `config.timeouts.sync`
2. Authentification expirée → Vérifier les credentials
3. Filtres actifs sur le dashboard → Vérifier les onglets

#### Rapports non générés

Vérifier que le répertoire existe :
```bash
mkdir -p tests/reports/orchestrator/screenshots
```

---

## Historique des versions

| Version | Date | Changements |
|---------|------|-------------|
| 1.0 | 2026-01-20 | Document initial |
| 1.1 | 2026-01-21 | Ajout section Orchestrateur cross-platform |

---

**Dernière mise à jour** : 2026-01-21
**Auteur** : Équipe OneEats
