# Guide des Tests - OneEats

> **Document fonctionnel** : Ce qui est testé et comment utiliser les tests

---

## Table des matières

1. [Introduction](#introduction)
2. [Types de tests](#types-de-tests)
3. [Tests API Backend](#tests-api-backend)
4. [Tests Dashboard Web](#tests-dashboard-web)
5. [Tests Application Mobile](#tests-application-mobile)
6. [Tests Cross-Platform](#tests-cross-platform)
7. [Exécution des tests par Claude Code](#exécution-des-tests-par-claude-code)
8. [Commandes rapides](#commandes-rapides)
9. [Interprétation des résultats](#interprétation-des-résultats)
10. [Guides UAT manuels](#guides-uat-manuels)
11. [Bonnes pratiques](#bonnes-pratiques)

---

## Introduction

### Objectif des tests

Les tests OneEats ont pour objectif de :

1. **Valider les fonctionnalités** : S'assurer que chaque feature fonctionne comme attendu
2. **Détecter les régressions** : Identifier les bugs introduits par de nouvelles modifications
3. **Documenter le comportement** : Les tests servent de documentation vivante
4. **Faciliter le refactoring** : Permettre des modifications en confiance

### Couverture actuelle

| Plateforme | Type | Couverture | Status |
|------------|------|------------|--------|
| Backend | API Tests | 90% | ✅ Opérationnel |
| Web Dashboard | E2E Tests | 70% | ⚠️ Auth requise |
| Mobile | Unit Tests | 85% | ✅ Opérationnel |
| Mobile | E2E Tests | 60% | ⚠️ Setup requis |

---

## Types de tests

### Pyramide des tests OneEats

```
                    ┌─────────────────┐
                    │   E2E Tests     │  ← Tests complets (lents, fragiles)
                    │   (Playwright)  │
                    └────────┬────────┘
                             │
               ┌─────────────┴─────────────┐
               │    Integration Tests      │  ← Tests API/DB (moyens)
               │    (Playwright + API)     │
               └─────────────┬─────────────┘
                             │
        ┌────────────────────┴────────────────────┐
        │           Unit Tests                     │  ← Tests rapides (nombreux)
        │    (Jest, JUnit, React Testing Library)  │
        └──────────────────────────────────────────┘
```

### Répartition par type

| Type | Outil | Quantité | Temps exécution |
|------|-------|----------|-----------------|
| Unit Tests Backend | JUnit 5 | ~50 | ~30s |
| Unit Tests Mobile | Jest | 134 | ~45s |
| Integration Tests | Playwright | 11 specs | ~2min |
| E2E Tests Web | Playwright | 41 tests | ~5min |
| E2E Tests Mobile | Maestro | 5 flows | ~3min |

---

## Tests API Backend

### Ce qui est testé

Les tests API valident que le backend Quarkus répond correctement aux requêtes HTTP.

#### Endpoints testés

| Endpoint | Méthode | Test | Authentification |
|----------|---------|------|------------------|
| `/api/restaurants` | GET | Liste des restaurants | Public |
| `/api/restaurants/{id}` | GET | Détails restaurant | Public |
| `/api/menu-items/restaurant/{id}` | GET | Menu du restaurant | Public |
| `/api/orders` | POST | Création commande | Authentifié |
| `/api/orders/{id}` | GET | Détails commande | Authentifié |
| `/api/orders/{id}/status` | PUT | Changement statut | Authentifié |
| `/api/users` | GET | Liste utilisateurs | Admin |

### Fichier de test : `specs/simple-api-tests.spec.ts`

```typescript
test.describe('Tests API OneEats', () => {

  test('API Restaurants - GET /restaurants', async ({ request }) => {
    // Vérifie que la liste des restaurants est accessible
    const response = await request.get('/restaurants');
    expect(response.ok()).toBeTruthy();

    const restaurants = await response.json();
    expect(Array.isArray(restaurants)).toBe(true);
  });

  test('API Restaurant détails - GET /restaurants/{id}', async ({ request }) => {
    // Vérifie qu'on peut récupérer un restaurant spécifique
    const response = await request.get(`/restaurants/${PIZZA_PALACE_ID}`);
    expect(response.status()).toBeGreaterThanOrEqual(200);
  });

  test('API Performance', async ({ request }) => {
    // Vérifie que l'API répond en moins de 2 secondes
    const startTime = Date.now();
    const response = await request.get('/restaurants');
    const responseTime = Date.now() - startTime;

    expect(response.ok()).toBeTruthy();
    expect(responseTime).toBeLessThan(2000);
  });
});
```

### Exécution

```bash
# Tous les tests API
cd tests
npx playwright test specs/simple-api-tests.spec.ts

# Avec output détaillé
npx playwright test specs/simple-api-tests.spec.ts --reporter=list
```

---

## Tests Dashboard Web

### Ce qui est testé

Les tests du dashboard valident l'interface utilisateur pour les restaurateurs et administrateurs.

### Catégories de tests

#### 1. Authentification (`specs/restaurant/authentication.spec.ts`)

| Test | Description | Prérequis |
|------|-------------|-----------|
| Login valide | Connexion avec identifiants corrects | Keycloak actif |
| Login invalide | Message d'erreur approprié | Keycloak actif |
| Session persistence | Session maintenue entre pages | Authentifié |
| Session timeout | Redirection après expiration | Authentifié |
| Access control | Restriction accès non autorisé | - |

#### 2. Gestion du Menu (`specs/restaurant/menu-management.spec.ts`)

| Test | Description | Prérequis |
|------|-------------|-----------|
| Création plat | Ajout d'un nouveau plat | Authentifié |
| Modification plat | Édition nom, prix, description | Authentifié |
| Suppression plat | Retrait d'un plat du menu | Authentifié |
| Upload image | Ajout d'image au plat | Authentifié |
| Toggle disponibilité | Activer/désactiver un plat | Authentifié |
| Recherche/filtrage | Filtrer par catégorie, recherche | Authentifié |

#### 3. Gestion des Commandes (`specs/restaurant/order-management.spec.ts`)

| Test | Description | Prérequis |
|------|-------------|-----------|
| Liste commandes | Affichage des commandes en cours | Authentifié |
| Détails commande | Voir items et informations client | Authentifié |
| Accepter commande | Passer PENDING → ACCEPTED | Authentifié |
| Préparer commande | Passer ACCEPTED → PREPARING | Authentifié |
| Marquer prêt | Passer PREPARING → READY | Authentifié |
| Annuler commande | Annulation avec raison | Authentifié |

#### 4. Design Responsive (`specs/restaurant/dashboard-responsive.spec.ts`)

| Test | Viewports testés | Vérifications |
|------|------------------|---------------|
| Mobile | 375x667 | Navigation tactile, menu burger |
| Tablet | 768x1024 | Layout optimisé, grilles |
| Desktop | 1920x1080 | Sidebar visible, hover effects |
| Ultrawide | 2560x1440 | Utilisation espace écran |

### Exemple de test Dashboard

```typescript
test.describe('Restaurant Menu Management', () => {

  test('should create new menu item', async ({ page }) => {
    // Navigation vers la page menu
    await page.goto('/restaurant/menu');

    // Clic sur "Ajouter un plat"
    await page.click('button:has-text("Ajouter")');

    // Remplir le formulaire
    await page.fill('input[name="name"]', 'Pizza Test');
    await page.fill('input[name="price"]', '12.50');
    await page.selectOption('select[name="category"]', 'PIZZA');

    // Soumettre
    await page.click('button:has-text("Créer")');

    // Vérifier création
    await expect(page.locator('text=Pizza Test')).toBeVisible();
  });
});
```

### Exécution

```bash
# Tous les tests dashboard
npx playwright test specs/restaurant/

# Test spécifique
npx playwright test specs/restaurant/menu-management.spec.ts

# Mode headed (navigateur visible)
npx playwright test specs/restaurant/ --headed

# Mode debug
npx playwright test specs/restaurant/ --debug
```

---

## Tests Application Mobile

### Tests Unitaires (Jest)

#### Ce qui est testé

| Catégorie | Fichiers | Tests |
|-----------|----------|-------|
| Contexts | AuthContext, CartContext, OrderContext | 45 |
| Services | apiService, authService | 30 |
| Hooks | useRestaurants, useOrders, useWebSocket | 35 |
| Components | Header, MenuItemCard, OrderCard | 24 |

#### Structure

```
apps/mobile/tests/unit/
├── contexts/
│   ├── AuthContext.test.tsx
│   ├── CartContext.test.tsx
│   └── OrderContext.test.tsx
├── services/
│   ├── apiService.test.ts
│   └── authService.test.ts
├── hooks/
│   ├── useRestaurants.test.ts
│   └── useWebSocket.test.ts
└── components/
    └── MenuItemCard.test.tsx
```

#### Exemple de test unitaire

```typescript
// tests/unit/contexts/CartContext.test.tsx
describe('CartContext', () => {

  test('should add item to cart', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider
    });

    act(() => {
      result.current.addToCart({
        id: '1',
        name: 'Pizza',
        price: 12.50,
        quantity: 1
      });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.total).toBe(12.50);
  });

  test('should calculate total correctly', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider
    });

    act(() => {
      result.current.addToCart({ id: '1', price: 10, quantity: 2 });
      result.current.addToCart({ id: '2', price: 5, quantity: 1 });
    });

    expect(result.current.total).toBe(25); // 10*2 + 5*1
  });
});
```

#### Exécution

```bash
cd apps/mobile

# Tous les tests
npm test

# Avec couverture
npm test -- --coverage

# Tests spécifiques
npm test -- --testPathPattern="CartContext"

# Mode watch
npm test -- --watch
```

### Tests E2E Mobile (Maestro)

#### Ce qui est testé

| Flow | Description | Étapes |
|------|-------------|--------|
| Navigation | Parcours des écrans principaux | 5 |
| Authentification | Login/Logout SSO | 6 |
| Vue restaurant | Consulter menu et détails | 4 |
| Panier | Ajouter/modifier/supprimer items | 7 |
| Commande | Flux complet de commande | 8 |

#### Exemple de flow Maestro

```yaml
# flows/04-cart-flow.yaml
appId: com.oneeats.mobile
---
# Lancer l'app
- launchApp

# Naviguer vers un restaurant
- tapOn: "Pizza Palace"
- assertVisible: "Menu"

# Ajouter un item
- tapOn: "Margherita"
- tapOn: "Ajouter au panier"
- assertVisible: "1 article"

# Modifier quantité
- tapOn: "Panier"
- tapOn: "+"  # Augmenter quantité
- assertVisible: "2 articles"

# Vérifier total
- assertVisible: "25,00 €"

# Valider commande
- tapOn: "Commander"
- assertVisible: "Confirmation"
```

#### Exécution

```bash
# Démarrer l'émulateur
emulator -avd Pixel_5_API_33

# Démarrer Metro
cd apps/mobile && npm start

# Lancer les tests
maestro test apps/mobile/.maestro/flows/

# Flow spécifique
maestro test apps/mobile/.maestro/flows/04-cart-flow.yaml

# Mode studio (enregistrement)
maestro studio
```

---

## Tests Cross-Platform

### Scénarios end-to-end complets

Ces tests valident le flux complet entre mobile et web dashboard.

#### Scénario 1 : Création de commande (Mobile → Web)

| Étape | Plateforme | Action | Vérification |
|-------|------------|--------|--------------|
| 1 | Mobile | Se connecter client | Écran d'accueil |
| 2 | Mobile | Sélectionner restaurant | Menu affiché |
| 3 | Mobile | Ajouter au panier | Badge panier +1 |
| 4 | Mobile | Valider commande | Confirmation |
| 5 | Web | Se connecter restaurateur | Dashboard |
| 6 | Web | Voir commandes | Nouvelle commande visible |
| 7 | Web | Accepter commande | Statut → ACCEPTED |
| 8 | Mobile | Vérifier notification | Push reçue |
| 9 | Mobile | Voir statut commande | "Acceptée" |

#### Scénario 2 : Mise à jour menu (Web → Mobile)

| Étape | Plateforme | Action | Vérification |
|-------|------------|--------|--------------|
| 1 | Web | Se connecter restaurateur | Dashboard |
| 2 | Web | Ajouter nouveau plat | Plat créé |
| 3 | Web | Activer le plat | Disponible |
| 4 | Mobile | Ouvrir le restaurant | Menu rafraîchi |
| 5 | Mobile | Voir le nouveau plat | Plat visible |

### Fichiers de documentation

```
tests/e2e/flows/
├── order-flow.md    # Documentation scénario commande
└── menu-flow.md     # Documentation scénario menu
```

---

## Exécution des tests par Claude Code

Claude Code peut exécuter les tests de plusieurs façons selon les outils disponibles.

### Méthode 1 : Via Bash (PowerShell) - Toujours disponible

Claude Code utilise l'outil **Bash** avec PowerShell pour exécuter les tests Playwright :

```
# Claude Code exécute cette commande via l'outil Bash :
powershell -Command "cd 'C:/Users/akin_/Documents/dev/FoodApp/Quarkus/oneeats-backend/tests'; npx playwright test specs/simple-api-tests.spec.ts --reporter=list 2>&1"
```

**Pourquoi PowerShell ?**
- Sur Windows, certaines commandes npm ne produisent pas d'output via bash standard
- PowerShell capture correctement stdout et stderr
- Le `2>&1` redirige les erreurs vers la sortie standard

**Exemples de commandes Claude Code :**

```bash
# Tests API
powershell -Command "cd 'C:/path/tests'; npx playwright test specs/simple-api-tests.spec.ts --reporter=list 2>&1"

# Tests Dashboard Restaurant
powershell -Command "cd 'C:/path/tests'; npx playwright test specs/restaurant/ --reporter=list 2>&1"

# Tests Mobile (Jest)
powershell -Command "cd 'C:/path/apps/mobile'; npm test 2>&1"

# Tests Mobile E2E (Maestro)
maestro test apps/mobile/.maestro/flows/02-auth-flow.yaml
```

### Méthode 2 : Via Playwright MCP - Contrôle navigateur en temps réel

Si Playwright MCP est activé (après redémarrage de Claude Code), des outils supplémentaires sont disponibles :

| Outil MCP | Action | Exemple d'utilisation |
|-----------|--------|----------------------|
| `browser_navigate` | Aller à une URL | Tester une page spécifique |
| `browser_click` | Cliquer sur un élément | Simuler interaction utilisateur |
| `browser_type` | Saisir du texte | Remplir formulaires |
| `browser_screenshot` | Capturer l'écran | Documenter un bug visuel |
| `browser_console_messages` | Voir erreurs JS | Détecter erreurs frontend |

**Exemple de session UAT avec MCP :**

```
Claude: Je vais tester le dashboard restaurant

1. [browser_navigate] → http://localhost:8080/restaurant
   Résultat: Page de login Keycloak affichée

2. [browser_type] → #username = "restaurant@oneeats.com"
   Résultat: Email saisi

3. [browser_type] → #password = "Test123!"
   Résultat: Mot de passe saisi

4. [browser_click] → #kc-login
   Résultat: Redirection vers dashboard

5. [browser_screenshot]
   Résultat: Capture du dashboard pour vérification
```

**Avantages du MCP :**
- Tests interactifs en temps réel
- Visualisation directe des problèmes
- Pas besoin de scripts pré-écrits
- Idéal pour exploration et débogage

### Méthode 3 : Via l'outil Task (agents spécialisés)

Claude Code peut lancer des agents en arrière-plan pour les tests longs :

```
# Agent pour tests complets
Task(subagent_type="Bash", prompt="Exécuter tous les tests Playwright et rapporter les résultats")

# Agent pour tests mobile
Task(subagent_type="Bash", prompt="Lancer les tests Maestro sur l'émulateur Android")
```

### Tableau récapitulatif : Comment Claude Code lance les tests

| Type de test | Outil Claude | Commande |
|--------------|--------------|----------|
| **API Backend** | Bash (PowerShell) | `npx playwright test specs/simple-api-tests.spec.ts` |
| **Dashboard Web** | Bash (PowerShell) | `npx playwright test specs/restaurant/` |
| **Dashboard Interactif** | Playwright MCP | `browser_navigate`, `browser_click`, etc. |
| **Mobile Unitaires** | Bash | `cd apps/mobile && npm test` |
| **Mobile E2E** | Bash | `maestro test flows/` |
| **Vérification API** | Bash (curl) | `curl http://localhost:8080/api/restaurants` |

### Workflow typique UAT par Claude Code

```
┌─────────────────────────────────────────────────────────────────┐
│  1. VÉRIFICATION ENVIRONNEMENT                                  │
│     └─ curl http://localhost:8080/api/restaurants               │
│     └─ adb devices (émulateur)                                  │
│     └─ curl http://localhost:8081/status (Metro)                │
├─────────────────────────────────────────────────────────────────┤
│  2. TESTS API (rapides)                                         │
│     └─ powershell: npx playwright test specs/simple-api-tests   │
│     └─ Analyse des résultats                                    │
├─────────────────────────────────────────────────────────────────┤
│  3. TESTS DASHBOARD (si auth disponible)                        │
│     └─ powershell: npx playwright test specs/restaurant/        │
│     └─ OU: browser_navigate + browser_click (MCP)               │
├─────────────────────────────────────────────────────────────────┤
│  4. TESTS MOBILE                                                │
│     └─ npm test (unitaires)                                     │
│     └─ maestro test (E2E)                                       │
├─────────────────────────────────────────────────────────────────┤
│  5. GÉNÉRATION RAPPORT                                          │
│     └─ Création docs/reports/UAT_REPORT_YYYY-MM-DD.md           │
│     └─ Mise à jour docs/BUGS.md si bugs trouvés                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### Commandes rapides

```bash
# === TESTS API ===
cd tests
npx playwright test specs/simple-api-tests.spec.ts

# === TESTS WEB DASHBOARD ===
npx playwright test specs/restaurant/

# === TESTS MOBILE UNITAIRES ===
cd apps/mobile
npm test

# === TESTS MOBILE E2E ===
maestro test apps/mobile/.maestro/flows/

# === TOUS LES TESTS WEB ===
cd tests
npm test

# === RAPPORT HTML ===
npx playwright show-report
```

### Avec Claude Code (PowerShell)

```powershell
# Tests API
powershell -Command "cd 'C:/path/tests'; npx playwright test specs/simple-api-tests.spec.ts --reporter=list 2>&1"

# Tests Dashboard
powershell -Command "cd 'C:/path/tests'; npx playwright test specs/restaurant/ --reporter=list 2>&1"
```

### Avec Playwright MCP (si activé)

```
# Navigation manuelle
browser_navigate("http://localhost:8080/restaurant")
browser_click("button#login")
browser_type("input#email", "restaurant@oneeats.com")
browser_screenshot()
```

---

## Interprétation des résultats

### Codes de sortie

| Code | Signification |
|------|---------------|
| 0 | Tous les tests passés |
| 1 | Au moins un test échoué |
| 2 | Erreur de configuration |

### Format des résultats Playwright

```
Running 5 tests using 1 worker

✓  1 [api-backend] › simple-api-tests.spec.ts:6:7 › API Restaurants (50ms)
✓  2 [api-backend] › simple-api-tests.spec.ts:32:7 › API Restaurant détails (25ms)
x  3 [api-backend] › simple-api-tests.spec.ts:67:7 › API Performance (150ms)
✓  4 [api-backend] › simple-api-tests.spec.ts:82:7 › API Commande (80ms)

  3 passed
  1 failed
```

### Symboles

| Symbole | Signification |
|---------|---------------|
| ✓ / ok | Test passé |
| x | Test échoué |
| - | Test ignoré (skipped) |
| ⏱ | Timeout |

### Rapports générés

| Fichier | Format | Utilisation |
|---------|--------|-------------|
| `reports/html/index.html` | HTML | Visualisation navigateur |
| `reports/results.json` | JSON | Intégration CI/CD |
| `reports/junit.xml` | JUnit | Jenkins, GitLab CI |
| `test-results/` | Traces | Debug (screenshots, vidéos) |

### Accéder aux rapports

```bash
# Ouvrir rapport HTML
npx playwright show-report

# Ou directement
open tests/reports/html/index.html
```

---

## Guides UAT manuels

Pour les tests qui nécessitent une validation humaine, des guides sont disponibles :

| Guide | Cible | Scénarios | Fichier |
|-------|-------|-----------|---------|
| Admin | Administrateurs plateforme | 13 | `docs/UAT_GUIDE_ADMIN.md` |
| Restaurant | Restaurateurs | 12 | `docs/UAT_GUIDE_RESTAURANT.md` |
| Mobile | Clients (app mobile) | 17 | `docs/UAT_GUIDE_MOBILE.md` |

### Structure d'un scénario UAT

```markdown
### UAT-R-001 : Connexion au dashboard

**Prérequis** :
- Backend démarré
- Compte restaurateur créé

**Étapes** :
1. Ouvrir http://localhost:8080/restaurant
2. Saisir email: restaurant@oneeats.com
3. Saisir mot de passe: Test123!
4. Cliquer "Se connecter"

**Résultat attendu** :
- Redirection vers /restaurant/dashboard
- Message "Bienvenue" affiché
- Menu latéral visible

**Status** : [ ] Passé  [ ] Échoué  [ ] Bloqué

**Notes** :
_Espace pour commentaires du testeur_
```

---

## Bonnes pratiques

### Écriture des tests

1. **Nommer clairement** : `should create order when cart is valid`
2. **Un test = une assertion principale**
3. **Utiliser des données de test isolées**
4. **Nettoyer après chaque test** (teardown)
5. **Éviter les dépendances entre tests**

### Maintenance

1. **Mettre à jour les tests** quand les features changent
2. **Supprimer les tests obsolètes**
3. **Documenter les tests complexes**
4. **Revoir régulièrement la couverture**

### CI/CD

1. **Exécuter les tests unitaires** à chaque commit
2. **Exécuter les tests E2E** à chaque PR
3. **Bloquer le merge** si tests échouent
4. **Archiver les rapports** de test

### Débogage

1. **Utiliser `--headed`** pour voir le navigateur
2. **Utiliser `--debug`** pour pause interactive
3. **Analyser les traces** dans `test-results/`
4. **Vérifier les logs backend** en parallèle

---

## Ressources

- [Tests existants](../../tests/specs/)
- [Configuration Playwright](../../tests/playwright.config.ts)
- [Flows Maestro](../../apps/mobile/.maestro/flows/)
- [Infrastructure technique](./TESTING_INFRASTRUCTURE.md)
- [Rapport UAT exemple](../reports/UAT_REPORT_2026-01-20.md)

---

## Historique des versions

| Version | Date | Changements |
|---------|------|-------------|
| 1.0 | 2026-01-20 | Document initial |

---

**Dernière mise à jour** : 2026-01-20
**Auteur** : Équipe OneEats
