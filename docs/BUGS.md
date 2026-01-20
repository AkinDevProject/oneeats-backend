# 🐛 Bugs et Problèmes Connus - OneEats

## 📊 Vue d'ensemble

| Statut | Nombre | Description |
|--------|--------|-------------|
| 🔴 Critique | 0 | Bloquant pour le MVP |
| 🟠 Important | 2 | Impact significatif sur l'expérience |
| 🟡 Moyen | 0 | Problème mineur |
| 🟢 Résolu | 17 | Bugs corrigés |

---

## 🔴 Bugs Critiques (Bloquant MVP)

### BUG-012 : Endpoint `/api/menu-items/*` requiert authentification (devrait être public)
**Priorité** : 🔴 Critique
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

### BUG-013 : Tests E2E dashboard ne peuvent pas interagir avec l'interface (auth requise)
**Priorité** : 🟠 Important
**Status** : 📋 Nouveau
**Affecte** : Tests E2E
**Date création** : 2026-01-20
**Découvert par** : UAT automatisé

**Description** :
Les tests E2E Playwright pour le dashboard restaurant/admin ne peuvent pas interagir avec l'interface car les pages sont protégées par authentification Keycloak. Les tests voient la page de login au lieu du dashboard.

**Impact** :
- Tests de menu management échouent : "no button found" (les boutons sont dans le dashboard protégé)
- Tests de gestion des commandes échouent
- Couverture de test réduite pour les fonctionnalités dashboard

**Résultats UAT** :
- 21 tests exécutés avant erreur EPIPE
- ~10 tests échoués (liés à l'auth)
- ~11 tests passés (tests API publiques + tests graceful degradation)

**Solution proposée** :
1. Créer un fichier de stockage d'état authentifié (`storageState.json`)
2. Ajouter un setup de test qui se connecte via Keycloak et sauvegarde les cookies
3. Utiliser `storageState` dans les tests pour maintenir la session

**Exemple de fix** :
```typescript
// setup/auth-setup.ts
export async function authenticateUser(browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/restaurant');
  await page.fill('#username', 'restaurant@oneeats.com');
  await page.fill('#password', 'Test123!');
  await page.click('#kc-login');
  await context.storageState({ path: 'storageState.json' });
  await context.close();
}
```

**Workaround temporaire** :
Tests manuels avec guides UAT (docs/UAT_GUIDE_RESTAURANT.md).

**Assigné à** : Backlog (tests)

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
- 🔴 Critique : 0 actifs, 5 résolus
- 🟠 Important : 1 actif (offline partiel), 5 résolus
- 🟡 Moyen : 0 actifs, 6 résolus

### Temps moyen de résolution
- Critique : 5 jours
- Important : 3 jours
- Moyen : 2 jours

### Bugs créés vs résolus (Total)
- Créés : 17
- Résolus : 16
- Taux de résolution : 94%

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

**Date** : 2026-01-20
**Version** : MVP 0.95
**Responsable** : Équipe OneEats
**Prochaine revue** : 2026-01-27
**Derniers bugs résolus** : BUG-006 (images optimisées), BUG-007 (validation), BUG-008 (tests WebSocket), BUG-009, BUG-010, BUG-011
