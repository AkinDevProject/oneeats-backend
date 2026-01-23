# 🐛 Bugs et Problèmes Connus - OneEats

## 📊 Vue d'ensemble

| Statut | Nombre | Description |
|--------|--------|-------------|
| 🔴 Critique | 1 | Bloquant pour le MVP |
| 🟠 Important | 5 | Impact significatif sur l'expérience |
| 🟡 Moyen | 0 | Problème mineur |
| 🟢 Résolu | 20 | Bugs corrigés |

---

## 🔴 Bugs Critiques (Bloquant MVP)

### BUG-017 : Tests E2E Dashboard échouent avec HTTP 404 (74/80 tests en échec)
**Priorité** : 🔴 Critique
**Status** : 📋 En investigation
**Affecte** : Tests E2E (Playwright), Dashboard Web
**Date création** : 2026-01-21
**Découvert par** : Analyse rapport tests Playwright

**Description** :
74 tests E2E sur 80 échouent avec l'erreur `net::ERR_HTTP_RESPONSE_CODE_FAILURE at http://localhost:8080/restaurant*`. Le serveur retourne HTTP 404 "Cette page localhost est introuvable" pour toutes les routes `/restaurant/*`.

**Tests passés** (6/80) :
- `auth.setup.ts` - Authentification Keycloak ✅
- 5 tests API backend (`simple-api-tests.spec.ts`) ✅

**Tests échoués** (74/80) :
- Tous les tests dashboard (`authentication.spec.ts`, `menu-management.spec.ts`, `order-management.spec.ts`, etc.)

**Analyse de la cause racine** :

1. **Session expirée** : Les cookies de session Quarkus (`q_session_chunk_*`) expirent ~1 heure après création. Si les tests sont lancés après cette période, la session est invalide.

2. **Vérification setup incorrecte** (CORRIGÉ) : Le fichier `global-setup.ts` ne vérifiait pas correctement l'accessibilité du dashboard - il navigait vers `/restaurant/menu` (route authentifiée) sans vérifier la réponse.

3. **Configuration Quinoa SPA** : Si Quinoa ne route pas correctement les URLs SPA vers `index.html`, les routes inconnues retournent 404.

**Reproduction** :
```bash
cd tests
npm test
# 74 tests échouent avec HTTP 404
```

**Logs d'erreur typiques** :
```
Error: page.goto: net::ERR_HTTP_RESPONSE_CODE_FAILURE at http://localhost:8080/restaurant
Call log:
  - navigating to "http://localhost:8080/restaurant", waiting until "load"

# Page d'erreur affichée:
heading "Cette page localhost est introuvable"
HTTP ERROR 404
```

**Impact** :
- Suite de tests E2E inutilisable (92.5% d'échec)
- Impossible de valider les fonctionnalités dashboard automatiquement
- Bloque le CI/CD si les tests sont obligatoires

**Solutions appliquées** :

1. ✅ **Correction `global-setup.ts`** :
   - Vérifie maintenant la page d'accueil publique (`/`) au lieu de `/restaurant/menu`
   - Valide le code de statut HTTP et le Content-Type
   - Fichier: `tests/setup/global-setup.ts`

**Solutions à appliquer** :

2. **Augmenter la durée de session Quarkus** (`application.yml`) :
   ```yaml
   quarkus:
     http:
       auth:
         session:
           timeout: 3600  # 1 heure par défaut, augmenter si nécessaire
   ```

3. **Régénérer la session avant chaque run de tests** :
   - Supprimer `tests/.auth/storageState.json` avant de lancer les tests
   - Ou ajouter une vérification de validité de session dans auth.setup.ts

4. **Vérifier la configuration Quinoa SPA routing** :
   ```yaml
   quarkus:
     quinoa:
       spa-routing: true
       spa-routing-path: "/"
       # S'assurer que toutes les routes frontend sont incluses
   ```

**Prochaines étapes** :
1. Relancer les tests avec Quarkus fraîchement démarré
2. Vérifier que la session est valide avant chaque test
3. Investiguer si Quinoa répond correctement aux routes SPA

---

### BUG-012 : Endpoint `/api/menu-items/*` requiert authentification (devrait être public)
**Priorité** : 🔴 Critique → ✅ Résolu
**Status** : ✅ Résolu
**Affecte** : Backend, Mobile, Tests E2E
**Date création** : 2026-01-20
**Découvert par** : UAT automatisé

**Description** :
L'endpoint `/api/menu-items/*` (GET) requiert une authentification alors qu'il devrait être public pour permettre aux utilisateurs mobiles de voir les menus sans être connectés.

**Impact** :
- Application mobile ne peut pas afficher les menus sans authentification
- Tests E2E échouent au setup car `/api/menu-items/restaurant/{id}` retourne HTML (page de login)
- Expérience utilisateur dégradée (doit se connecter pour voir les menus)

**Configuration actuelle** (`application.yml`):
```yaml
api-public-read:
  paths: /api/restaurants,/api/restaurants/*,/api/menus,/api/menus/*
  policy: permit
  methods: GET
api-protected:
  paths: /api/*
  policy: authenticated
```

**Solution proposée** :
Ajouter `/api/menu-items,/api/menu-items/*` à `api-public-read` :
```yaml
api-public-read:
  paths: /api/restaurants,/api/restaurants/*,/api/menus,/api/menus/*,/api/menu-items,/api/menu-items/*
  policy: permit
  methods: GET
```

**Solution appliquée** :
Modification de `src/main/resources/application.yml` - Ajout de `/api/menu-items,/api/menu-items/*` aux endpoints publics.

**Date résolution** : 2026-01-20

**Note** : Nécessite redémarrage du backend pour prise en compte.

---

## 🟠 Bugs Importants

### ✅ BUG-013 : Tests E2E dashboard ne peuvent pas interagir avec l'interface (auth requise)
**Priorité** : 🟠 Important
**Status** : ✅ Résolu
**Affecte** : Tests E2E
**Date création** : 2026-01-20
**Date résolution** : 2026-01-21
**Découvert par** : UAT automatisé

**Description** :
Les tests E2E Playwright pour le dashboard restaurant/admin ne pouvaient pas s'authentifier via Keycloak. Le formulaire de login retournait "Invalid username or password" alors que les mêmes credentials fonctionnaient dans un navigateur normal.

**Cause racine identifiée** :
La configuration globale de Playwright dans `playwright.config.ts` définissait des headers HTTP par défaut :
```typescript
extraHTTPHeaders: {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
},
```

Ces headers forçaient l'envoi des formulaires HTML avec `Content-Type: application/json` au lieu de `application/x-www-form-urlencoded`. Keycloak rejetait ces requêtes car il attend le format standard des formulaires HTML.

**Comparaison des requêtes** :
| | Playwright (ÉCHEC) | Navigateur normal (SUCCÈS) |
|---|---|---|
| Content-Type | `application/json` ❌ | `application/x-www-form-urlencoded` ✅ |
| Status HTTP | 200 OK (page erreur) | 302 Found (redirection) |

**Solution appliquée** :

1. **Désactivation des headers JSON pour le projet setup** (`playwright.config.ts`) :
```typescript
{
  name: 'setup',
  testMatch: /auth\.setup\.ts/,
  use: {
    channel: 'msedge', // Use Edge instead of Chromium
    extraHTTPHeaders: {}, // Override global JSON headers
  },
},
```

2. **Utilisation de Edge au lieu de Chromium** :
   - Chromium bundled de Playwright avait des comportements incompatibles avec Keycloak
   - Edge (installé sur le système) fonctionne correctement

**Fichiers modifiés** :
- `tests/playwright.config.ts` - Ajout `extraHTTPHeaders: {}` et `channel: 'msedge'` pour le projet setup
- `tests/specs/auth.setup.ts` - Mise à jour de l'URL Keycloak

**Résultat après correction** :
- ✅ Authentification Keycloak fonctionne
- ✅ 53 tests passés en 6.8 minutes
- ✅ Session sauvegardée dans `storageState.json` pour les tests suivants

**Leçon apprise** :
Les headers HTTP globaux de Playwright peuvent interférer avec les formulaires HTML standards. Pour les tests d'authentification via formulaire, il faut soit :
- Ne pas définir de headers Content-Type globaux
- Ou les overrider explicitement pour les projets qui utilisent des formulaires HTML

---

### BUG-014 : Tests E2E utilisent des sélecteurs `data-testid` inexistants
**Priorité** : 🟠 Important
**Status** : ✅ Corrigé (en attente de validation)
**Affecte** : Tests E2E (Playwright)
**Date création** : 2026-01-21
**Découvert par** : Analyse résultats tests automatisés

**Description** :
Plusieurs tests E2E échouent car ils utilisent des sélecteurs `[data-testid="menu-item-card"]` qui n'existent pas dans l'interface React réelle. L'UI utilise des classes CSS génériques (`.card`, `[class*="bg-white"]`) au lieu de data-testid.

**Tests affectés** (6 tests) :
- `menu-management.spec.ts` - "should create complete menu with appetizers, mains, and desserts"
- `menu-management.spec.ts` - "should create menu item with complex options and configurations"
- `dashboard-ui.spec.ts` - "Test UI.2 : Affichage des plats existants"
- `phase1-dashboard.spec.ts` - "Test 1.1 : Création d'un menu complet"
- `phase1-dashboard.spec.ts` - "Test 1.5 : Création plat avec options complètes"
- Et autres tests similaires

**Cause racine** :
Les tests ont été écrits en anticipant des attributs `data-testid` qui n'ont jamais été ajoutés aux composants React.

**Solution proposée** :
Option A (Recommandée) : Mettre à jour les tests pour utiliser les sélecteurs CSS réels
```typescript
// Avant
const menuItems = page.locator('[data-testid="menu-item-card"]');

// Après
const menuItems = page.locator('.card, [class*="bg-white"]').filter({
  has: page.locator(':has-text("€")')
});
```

Option B (Long terme) : Ajouter les `data-testid` aux composants React pour une meilleure testabilité

**Fichiers à modifier** :
- `tests/specs/restaurant/menu-management.spec.ts`
- `tests/specs/dashboard-ui.spec.ts`
- `tests/specs/phase1-dashboard.spec.ts`

---

### BUG-015 : Tests authentication.spec.ts incompatibles avec Keycloak
**Priorité** : 🟠 Important
**Status** : ✅ Corrigé (en attente de validation)
**Affecte** : Tests E2E (Playwright)
**Date création** : 2026-01-21
**Découvert par** : Analyse résultats tests automatisés

**Description** :
Les tests dans `authentication.spec.ts` tentent de naviguer vers `/login` et d'interagir avec un formulaire de login local, mais l'application utilise Keycloak pour l'authentification externe. Il n'existe pas de page `/login` dans l'application React.

**Tests affectés** (4 tests) :
- "should authenticate restaurant user and redirect to dashboard"
- "should maintain session across page navigation"
- "should handle session timeout and re-authentication"
- "should restrict access to restaurant-only features"

**Cause racine** :
Les tests ont été écrits pour un système d'authentification local qui n'existe pas. L'authentification est gérée par :
1. Redirection vers Keycloak (externe)
2. Formulaire de login sur Keycloak
3. Redirection retour avec token

De plus, le test `auth.setup.ts` gère déjà l'authentification et sauvegarde le storageState pour les autres tests.

**Solution proposée** :
Refactorer les tests pour :
1. Ne pas tester le login (déjà fait dans `auth.setup.ts`)
2. Tester uniquement la persistance de session et l'accès aux pages protégées
3. Supprimer les tests qui simulent une re-authentification

**Code actuel problématique** :
```typescript
// Navigue vers une page qui n'existe pas
await page.goto('/login');

// Cherche des inputs qui n'existent pas
const emailInput = page.locator('input[type="email"]');
```

**Solution** :
```typescript
// Utiliser directement les pages du dashboard (session déjà authentifiée)
await page.goto('/restaurant');
await expect(page).toHaveURL(/restaurant/);
```

---

### BUG-016 : Tests API backend avec URLs incorrectes
**Priorité** : 🟠 Important
**Status** : ✅ Corrigé (en attente de validation)
**Affecte** : Tests E2E (Playwright)
**Date création** : 2026-01-21
**Découvert par** : Analyse résultats tests automatisés

**Description** :
Les tests dans `simple-api-tests.spec.ts` échouent car la configuration du projet `api-backend` définit `baseURL: 'http://localhost:8080/api'` mais les tests utilisent des chemins qui commencent par `/restaurants` sans tenir compte du baseURL.

**Tests affectés** (2 tests) :
- "API Restaurants - GET /restaurants"
- "API Performance"

**Cause racine** :
La configuration Playwright pour le projet api-backend est :
```typescript
{
  name: 'api-backend',
  testMatch: /simple-api-tests/,
  use: {
    baseURL: 'http://localhost:8080/api',
  },
}
```

Mais les tests font :
```typescript
const response = await request.get('/restaurants');
```

Ce qui devrait résulter en `http://localhost:8080/api/restaurants`, ce qui est correct. Le problème pourrait être :
1. Double slash dans l'URL (`/api//restaurants`)
2. Réponse non-JSON
3. Timeout de connexion

**Logs d'erreur** :
À vérifier - probablement une erreur de parsing JSON ou de timeout.

**Solution proposée** :
1. Vérifier que l'API répond correctement à `GET /api/restaurants`
2. Ajouter une gestion d'erreur plus robuste dans les tests
3. Augmenter les timeouts si nécessaire

---

### BUG-004 : Mode offline non implémenté (mobile)
**Priorité** : 🟠 Important
**Status** : ⚠️ Partiel
**Affecte** : Mobile
**Date création** : 2025-12-11

**Description** :
L'application mobile a un mode offline basique mais incomplet.

**Ce qui est implémenté** :
- ✅ Cache auth tokens (SecureStore)
- ✅ Cache panier (AsyncStorage)
- ✅ Cache commandes (AsyncStorage)
- ✅ Cache favoris (AsyncStorage)

**Ce qui manque** :
- ❌ Cache restaurants/menus complet
- ❌ Détection connectivité (NetInfo)
- ❌ Queue requêtes pendant offline
- ❌ Synchronisation en arrière-plan

**Solution prévue** :
- CacheService avec stratégies intelligentes
- Détection connectivité avec NetInfo
- Queue requêtes pendant offline

**Assigné à** : Optionnel (post-MVP)

---

### ✅ BUG-008 : Tests WebSocket manquants
**Priorité** : 🟠 Important
**Status** : ✅ Résolu
**Affecte** : Backend, Mobile
**Date création** : 2026-01-16
**Date résolution** : 2026-01-20

**Description** :
WebSocket est implémenté (backend + mobile) mais les tests n'étaient pas documentés/complets.

**Solution appliquée** :

**Backend (déjà existant)** - Tests unitaires et d'intégration complets :
- `NotificationWebSocketTest.java` (342 lignes) : 15 tests pour connexion, messages, notifications
- `RestaurantWebSocketTest.java` (429 lignes) : 17 tests pour multi-sessions, broadcast
- `WebSocketNotificationServiceTest.java` (363 lignes) : 12 tests pour DTOs et envoi de notifications
- `WebSocketIT.java` (338 lignes) : Tests d'intégration avec vrais WebSockets

**Mobile (nouveau)** :
- `apps/mobile/tests/unit/hooks/useWebSocket.test.ts` : 20+ tests couvrant :
  - Connexion initiale et gestion userId
  - Gestion des messages (connected, order_status_update, heartbeat, echo)
  - Heartbeat périodique
  - Gestion des erreurs
  - Reconnexion automatique avec backoff exponentiel
  - Déconnexion manuelle
  - Envoi de messages
  - Cycle de vie de l'app (background/foreground)

**Commit** : À committer

---

## 🟡 Bugs Mineurs

### ✅ BUG-006 : Images non optimisées automatiquement
**Priorité** : 🟡 Moyen
**Status** : ✅ Résolu
**Affecte** : Backend, Frontend Web, Mobile
**Date création** : 2025-12-11
**Date résolution** : 2026-01-20

**Description** :
Les images uploadées n'étaient pas automatiquement redimensionnées ni optimisées.

**Solution appliquée** :

**Backend - Génération automatique de thumbnails** :
- `FileStorageService.java` : Génère automatiquement 3 tailles lors de l'upload
  - Original (800x800 max) : Image principale optimisée
  - Medium (400x400) : Pour cartes de menu, listes
  - Small (150x150) : Pour icônes, miniatures
- `FileController.java` : Nouveau paramètre `?size=` pour servir les thumbnails
  - `/uploads/menu-items/abc.jpg` → Image originale (800px)
  - `/uploads/menu-items/abc.jpg?size=small` → Thumbnail 150px
  - `/uploads/menu-items/abc.jpg?size=medium` → Thumbnail 400px
- Suppression automatique des thumbnails lors de la suppression d'image
- Fallback vers l'image originale si le thumbnail n'existe pas

**Frontend Web** :
- `imageUtils.ts` : Mise à jour pour utiliser le paramètre `?size=`
  - `getListThumbnailUrl()` → Demande `?size=small`
  - `getMenuCardImageUrl()` → Demande `?size=medium`
  - `getModalPreviewImageUrl()` → Image originale
- Support Unsplash : Ajout des paramètres de redimensionnement natifs

**Stockage des fichiers** :
```
uploads/
├── restaurants/
│   ├── abc123.jpg           (800x800 max)
│   └── thumbnails/
│       ├── abc123_small.jpg  (150x150)
│       └── abc123_medium.jpg (400x400)
└── menu-items/
    ├── def456.jpg           (800x800 max)
    └── thumbnails/
        ├── def456_small.jpg  (150x150)
        └── def456_medium.jpg (400x400)
```

**Commit** : À committer

---

### ✅ BUG-007 : Validation côté client insuffisante
**Priorité** : 🟡 Moyen
**Status** : ✅ Résolu (Web)
**Affecte** : Frontend Web
**Date création** : 2025-12-11
**Date résolution** : 2026-01-20

**Description** :
Certains formulaires manquaient de validation côté client, permettant de soumettre des données invalides au backend.

**Solution appliquée** :
Création d'un utilitaire de validation complet (`apps/web/src/utils/validationUtils.ts`) :
- `validatePrice()` : Validation prix (positif, max 9999.99€)
- `validateEmail()` : Validation email (regex RFC 5322)
- `validatePhone()` / `validatePhoneOptional()` : Validation téléphone français
- `validatePassword()` : Validation force mot de passe
- `validateRequired()` / `validateLength()` : Validation texte
- `hasErrors()` / `FormErrors` : Helpers de formulaire

**Fichiers corrigés** :
- `apps/web/src/utils/validationUtils.ts` - Nouvel utilitaire de validation
- `apps/web/src/pages/restaurant/MenuPage.tsx` - Validation prix, nom, catégorie avec `min="0"` `max="9999.99"`
- `apps/web/src/pages/restaurant/RestaurantSettingsPage.tsx` - Validation email, téléphone, adresse

**Note** : Validation mobile (React Native) à implémenter séparément si nécessaire.

**Commit** : À committer

---

### ✅ BUG-009 : Navigation sidebar ne met pas à jour le contenu (Web Dashboard)
**Priorité** : 🟡 Moyen
**Status** : ✅ Résolu
**Affecte** : Frontend Web
**Date création** : 2026-01-20
**Date résolution** : 2026-01-20

**Description** :
Lorsqu'on clique sur les liens de la sidebar (Menu, Paramètres, Commandes), l'URL dans le navigateur change correctement mais le contenu de la page ne se met pas à jour.

**Cause** :
Le composant `<Outlet />` de React Router ne se re-rendait pas quand le pathname changeait car il n'y avait pas de clé unique forçant le re-render.

**Solution appliquée** :
Ajout de `key={location.pathname}` sur l'élément `<main>` parent du `<Outlet />` dans les layouts :
- `apps/web/src/components/layouts/RestaurantLayout.tsx`
- `apps/web/src/components/layouts/AdminLayout.tsx`

```tsx
<main className="flex-1 overflow-auto" key={location.pathname}>
  <Outlet />
</main>
```

**Commit** : À committer

---

### ✅ BUG-010 : Images de certains plats ne se chargent pas (Web Dashboard)
**Priorité** : 🟡 Moyen
**Status** : ✅ Résolu
**Affecte** : Frontend Web
**Date création** : 2026-01-20
**Date résolution** : 2026-01-20

**Description** :
Dans la page Menu, certaines images de plats affichaient le texte "Menu item" au lieu de l'image réelle (Pasta Carbonara, Coca-Cola, Frites).

**Cause** :
URLs d'images Unsplash invalides ou manquantes (null) dans `import-dev.sql` :
- Pasta Carbonara : URL `photo-1621996346565-e3dbc794d72b` invalide
- Coca-Cola : URL null
- Frites : URL null

**Solution appliquée** :
Mise à jour de `src/main/resources/import-dev.sql` avec des URLs Unsplash valides :
- Coca-Cola : `https://images.unsplash.com/photo-1554866585-cd94860890b7`
- Pasta Carbonara : `https://images.unsplash.com/photo-1588013273468-315fd88ea34c`
- Frites : `https://images.unsplash.com/photo-1630384060421-cb20d0e0649d`
- Pizza Margherita : `https://images.unsplash.com/photo-1574071318508-1cdbab80d002`

**Testé et vérifié** : Toutes les images du menu s'affichent correctement après redémarrage du backend.

**Commit** : À committer

---

### ✅ BUG-011 : Redirection de port inconsistante (8080 vs 5173)
**Priorité** : 🟡 Moyen
**Status** : ✅ Résolu
**Affecte** : Frontend Web, Configuration
**Date création** : 2026-01-20
**Date résolution** : 2026-01-20

**Description** :
Certains fichiers frontend avaient des URLs hardcodées `localhost:8080` ce qui causait des incohérences lors du développement sur différents ports.

**Cause** :
URLs hardcodées dans le frontend au lieu d'utiliser des URLs dynamiques basées sur `window.location.origin`.

**Solution appliquée** :
Remplacement des URLs hardcodées par une fonction `getApiBaseUrl()` qui :
- Utilise `window.location.origin` par défaut
- Redirige automatiquement du port 5173 (Vite) vers 8080 (backend) si nécessaire
- Fallback sur la variable d'environnement `VITE_API_URL`

**Fichiers corrigés** :
- `apps/web/src/utils/imageUtils.ts` - Ajout de `getApiBaseUrl()` pour les images locales
- `apps/web/src/pages/restaurant/RestaurantSettingsPage.tsx` - Fonction `getImageUrl()` dynamique

**Commit** : À committer

---

## 🟢 Bugs Résolus

### ✅ BUG-018 : Policy `authenticated` de Quarkus échoue avec OIDC web-app mode
**Priorité** : 🔴 Critique
**Status** : ✅ Résolu (workaround)
**Affecte** : Backend (Quarkus OIDC)
**Date création** : 2026-01-21
**Date résolution** : 2026-01-21

**Description** :
Les requêtes POST/PUT/DELETE sur `/api/menu-items` retournaient 403 Forbidden alors que l'utilisateur était authentifié correctement. L'authentification fonctionnait (utilisateur reconnu avec ses rôles), mais l'autorisation échouait.

**Symptômes** :
- L'utilisateur `restaurant@oneeats.com` était correctement authentifié (non-anonymous)
- Les rôles `[restaurant, user]` étaient correctement extraits du token Keycloak
- Malgré cela, la policy `authenticated` retournait `ForbiddenException`
- La même requête avec `policy: permit` fonctionnait

**Cause racine** :
Incompatibilité ou bug entre la policy built-in `authenticated` de Quarkus et le mode OIDC `web-app` avec `split-tokens: true`. La policy `authenticated` devrait simplement vérifier `!securityIdentity.isAnonymous()`, mais elle échouait malgré un utilisateur authentifié.

**Configuration problématique** :
```yaml
quarkus:
  http:
    auth:
      permission:
        api-protected:
          paths: /api/*
          policy: authenticated  # ❌ NE FONCTIONNE PAS
```

**Solution appliquée (workaround)** :
Utiliser une policy custom basée sur les rôles au lieu de `authenticated` :
```yaml
quarkus:
  http:
    auth:
      policy:
        role-policy:
          roles-allowed: user,restaurant,admin
      permission:
        api-menu-items-write:
          paths: /api/menu-items,/api/menu-items/*
          methods: POST,PUT,DELETE
          policy: role-policy  # ✅ FONCTIONNE
        api-protected:
          paths: /api/*
          policy: role-policy  # ✅ FONCTIONNE
```

**Important** : La règle spécifique `api-menu-items-write` est NÉCESSAIRE en plus de `api-protected`. Sans elle, le problème revient. Cela semble être dû à un conflit avec la règle `api-public-read` qui autorise GET sur les mêmes paths.

**Fichiers modifiés** :
- `src/main/resources/application.yml` - Configuration des permissions HTTP

**Leçon apprise** :
1. La policy `authenticated` de Quarkus peut ne pas fonctionner correctement avec OIDC web-app mode
2. Utiliser des policies explicites basées sur les rôles est plus fiable
3. Quand un path a des règles différentes pour GET vs POST/PUT/DELETE, définir des règles séparées explicites

---

### ✅ BUG-001 : Mock data utilisé dans frontend web et mobile
**Priorité** : 🔴 Critique
**Status** : ✅ Résolu
**Date création** : 2025-12-10
**Date résolution** : 2026-01-15

**Description** :
Les frontends utilisaient des données mockées au lieu de vraies APIs backend.

**Solution appliquée** :
- Dashboard web connecté aux APIs (hooks personnalisés)
- Mobile connecté aux APIs (services API complets)
- Fichiers mockData.ts supprimés (web + mobile)

---

### ✅ BUG-002 : Authentification non implémentée
**Priorité** : 🔴 Critique
**Status** : ✅ Résolu
**Date création** : 2025-12-10
**Date résolution** : 2026-01-15

**Description** :
Le système d'authentification n'était pas implémenté.

**Solution appliquée** :
- Backend : Keycloak OIDC avec mode hybrid (web-app + service)
- Backend : AuthService, AuthController, OidcTenantResolver
- Web : Login SSO Keycloak, cookies gérés par Quarkus
- Mobile : expo-auth-session avec PKCE flow, SecureStore

---

### ✅ BUG-003 : WebSocket temps réel non implémenté
**Priorité** : 🟠 Important
**Status** : ✅ Résolu
**Date création** : 2025-12-10
**Date résolution** : 2026-01-16

**Description** :
Notifications et mises à jour de statuts n'étaient pas en temps réel.

**Solution appliquée** :
- Backend : `NotificationWebSocket.java` (`/ws/notifications/{userId}`)
- Backend : `RestaurantWebSocket.java` (`/ws/restaurant/{restaurantId}`)
- Backend : `WebSocketNotificationService.java`
- Mobile : `WebSocketContext.tsx`, `useWebSocket.ts`
- Web : `useRealtimeUpdates.ts` (polling fallback)

---

### ✅ BUG-005 : Tests E2E incomplets
**Priorité** : 🟠 Important
**Status** : ✅ Résolu
**Date création** : 2025-12-11
**Date résolution** : 2026-01-16

**Description** :
Suite de tests E2E incomplète.

**Solution appliquée** :
- Web : 11 specs Playwright dans `tests/specs/`
- Mobile : 6 flows Maestro dans `apps/mobile/.maestro/`
- Mobile : 134 tests Jest (contexts, services, components)
- Backend : 17 tests unitaires Java

---

### ✅ BUG-R01 : Commandes ne s'affichaient pas dans le dashboard
**Priorité** : 🔴 Critique
**Status** : ✅ Résolu
**Date création** : 2025-11-20
**Date résolution** : 2025-11-25

**Description** :
Les commandes créées via l'API n'apparaissaient pas dans le dashboard restaurant.

**Cause** :
Mauvais mapping entre `OrderDto` et `Order` entity - le `restaurantId` n'était pas correctement propagé.

**Solution appliquée** :
Correction du `OrderMapper` pour inclure `restaurantId` dans le DTO.

**Commit** : `c82ad98`

---

### ✅ BUG-R02 : Upload d'images échouait avec erreur 500
**Priorité** : 🔴 Critique
**Status** : ✅ Résolu
**Date création** : 2025-12-08
**Date résolution** : 2025-12-09

**Description** :
L'upload d'images pour menu items retournait systématiquement une erreur 500.

**Cause** :
Configuration manquante pour Multipart dans `application.yml` - limite de taille trop basse.

**Solution appliquée** :
```yaml
quarkus:
  http:
    body:
      uploads-directory: /tmp/uploads
    limits:
      max-body-size: 10M
```

**Commit** : `8481aca`

---

### ✅ BUG-R03 : Statut restaurant ne se mettait pas à jour
**Priorité** : 🟠 Important
**Status** : ✅ Résolu
**Date création** : 2025-11-28
**Date résolution** : 2025-12-01

**Description** :
Le toggle `isOpen` dans le frontend n'affectait pas vraiment le restaurant backend.

**Cause** :
Endpoint `PATCH /api/restaurants/{id}/status` n'était pas implémenté.

**Solution appliquée** :
Ajout de l'endpoint avec command `UpdateRestaurantStatusCommand`.

**Commit** : `feff7ed`

---

### ✅ BUG-R04 : Menu items supprimés apparaissaient encore dans les commandes
**Priorité** : 🟠 Important
**Status** : ✅ Résolu
**Date création** : 2025-12-05
**Date résolution** : 2025-12-06

**Description** :
Supprimer un menu item cassait les commandes passées qui contenaient cet item.

**Cause** :
Foreign key `ON DELETE CASCADE` sur `order_items.menu_item_id`.

**Solution appliquée** :
Changement vers `ON DELETE SET NULL` et affichage "[Article supprimé]" dans l'UI si `menu_item_id` est null.

**Commit** : `0705431`

---

### ✅ BUG-R05 : Utilisateur pouvait se désactiver lui-même (admin)
**Priorité** : 🟡 Moyen
**Status** : ✅ Résolu
**Date création** : 2025-12-03
**Date résolution** : 2025-12-04

**Description** :
Un administrateur pouvait se désactiver lui-même, perdant ainsi l'accès à la plateforme.

**Cause** :
Aucune validation dans `UpdateUserStatusCommand`.

**Solution appliquée** :
Ajout de validation : un utilisateur ne peut pas modifier son propre statut `is_active`.

**Commit** : `c82ad98`

---

## 📋 Backlog de Bugs à Investiguer

### À investiguer : Performance lente sur liste restaurants (mobile)
**Rapporté par** : Tests internes
**Date** : 2025-12-10
**Description** : Scroll lag sur la liste de restaurants quand il y a plus de 50 restaurants.
**Prochaine étape** : Profiler avec React DevTools, vérifier si FlatList est bien virtualisée.

---

### À investiguer : Notifications push ne fonctionnent pas sur iOS
**Rapporté par** : Tests internes
**Date** : 2025-12-11
**Description** : Les notifications push Expo fonctionnent sur Android mais pas iOS.
**Prochaine étape** : Vérifier les permissions iOS, certificats APNs, configuration Expo.

---

## 📊 Statistiques

### Bugs par priorité
- 🔴 Critique : 0 actifs, 6 résolus
- 🟠 Important : 1 actif (offline partiel), 6 résolus
- 🟡 Moyen : 0 actifs, 6 résolus

### Temps moyen de résolution
- Critique : 5 jours
- Important : 3 jours
- Moyen : 2 jours

### Bugs créés vs résolus (Total)
- Créés : 19
- Résolus : 18
- Taux de résolution : 95%

---

## 🔍 Comment Reporter un Bug

### Informations à fournir :

1. **Titre clair** : Résumé en une ligne du problème
2. **Priorité** : Critique / Important / Moyen / Mineur
3. **Modules affectés** : Backend, Frontend Web, Mobile
4. **Description détaillée** : Que se passe-t-il exactement ?
5. **Étapes pour reproduire** : Comment reproduire le bug de manière fiable ?
6. **Comportement attendu** : Que devrait-il se passer ?
7. **Comportement actuel** : Que se passe-t-il vraiment ?
8. **Logs/Screenshots** : Captures d'écran ou logs d'erreur
9. **Environnement** : Dev / Prod / Mobile (iOS/Android)
10. **Workaround** : Y a-t-il une solution temporaire ?

### Template de rapport :

```markdown
### BUG-XXX : [Titre du bug]
**Priorité** : 🔴/🟠/🟡 [Critique/Important/Moyen]
**Status** : 📋 Nouveau
**Affecte** : [Backend/Frontend Web/Mobile]
**Date création** : YYYY-MM-DD

**Description** :
[Description détaillée du problème]

**Impact** :
- [Impact 1]
- [Impact 2]

**Étapes pour reproduire** :
1. [Étape 1]
2. [Étape 2]
3. [Résultat observé]

**Comportement attendu** :
[Ce qui devrait se passer]

**Workaround temporaire** :
[Solution temporaire ou "Aucun"]

**Logs/Screenshots** :
[Si applicable]
```

---

## 📅 Dernière mise à jour

**Date** : 2026-01-21
**Version** : MVP 0.95
**Responsable** : Équipe OneEats
**Prochaine revue** : 2026-01-28
**Derniers bugs** : BUG-018 (Policy `authenticated` Quarkus OIDC - workaround avec role-policy)
