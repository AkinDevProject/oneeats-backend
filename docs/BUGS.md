# 🐛 Bugs et Problèmes Connus - OneEats

## 📊 Vue d'ensemble

| Statut | Nombre | Description |
|--------|--------|-------------|
| 🔴 Critique | 0 | Bloquant pour le MVP |
| 🟠 Important | 2 | Impact significatif sur l'expérience |
| 🟡 Moyen | 2 | Problème mineur |
| 🟢 Résolu | 10 | Bugs corrigés |

---

## ~~🔴 Bugs Critiques (Bloquant MVP)~~ ✅ TOUS RÉSOLUS

*Aucun bug critique actif - MVP opérationnel*

---

## 🟠 Bugs Importants

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

### BUG-008 : Tests WebSocket manquants
**Priorité** : 🟠 Important
**Status** : 📋 Backlog
**Affecte** : Backend, Mobile
**Date création** : 2026-01-16

**Description** :
WebSocket est implémenté (backend + mobile) mais aucun test n'existe pour cette fonctionnalité.

**Fichiers concernés** :
- Backend : `NotificationWebSocket.java`, `RestaurantWebSocket.java`, `WebSocketNotificationService.java`
- Mobile : `WebSocketContext.tsx`, `useWebSocket.ts`

**Solution prévue** :
- Tests unitaires WebSocket backend (JUnit)
- Tests intégration WebSocket
- Tests mobile context

**Assigné à** : À planifier

---

## 🟡 Bugs Mineurs

### BUG-006 : Images non optimisées automatiquement
**Priorité** : 🟡 Moyen
**Status** : 📋 Backlog
**Affecte** : Frontend Web, Mobile
**Date création** : 2025-12-11

**Description** :
Les images uploadées ne sont pas automatiquement redimensionnées ni optimisées. Cela peut entraîner des temps de chargement longs.

**Impact** :
- ⚠️ Temps de chargement pages plus long
- ⚠️ Consommation data mobile élevée
- ⚠️ Performance dégradée

**Workaround temporaire** :
Manuel - demander aux restaurants d'uploader des images déjà optimisées

**Solution prévue** :
- Backend : Service d'optimisation d'images (Sharp ou Imagemagick)
- Génération automatique de thumbnails (small, medium, large)
- Compression automatique avec qualité configurable
- CDN pour servir les images

**Assigné à** : Sprint 5
**ETA** : 2026-01-05

---

### BUG-007 : Validation côté client insuffisante
**Priorité** : 🟡 Moyen
**Status** : 📋 Backlog
**Affecte** : Frontend Web, Mobile
**Date création** : 2025-12-11

**Description** :
Certains formulaires manquent de validation côté client, permettant de soumettre des données invalides au backend.

**Impact** :
- ⚠️ Messages d'erreur backend pas user-friendly
- ⚠️ Requêtes inutiles vers le serveur
- ⚠️ Expérience utilisateur dégradée

**Exemples** :
- Email sans validation format côté mobile
- Prix négatif possible dans formulaire menu
- Téléphone sans validation format

**Solution prévue** :
- Validation Yup côté mobile (Formik + Yup)
- Validation React Hook Form côté web
- Messages d'erreur clairs et traduits
- Feedback visuel immédiat

**Assigné à** : Sprint 6
**ETA** : 2026-01-10

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
- 🟠 Important : 2 actifs (offline partiel, tests WebSocket), 4 résolus
- 🟡 Moyen : 2 actifs, 1 résolu

### Temps moyen de résolution
- Critique : 5 jours
- Important : 3 jours
- Moyen : 2 jours

### Bugs créés vs résolus (Total)
- Créés : 12
- Résolus : 10
- Taux de résolution : 83%

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

**Date** : 2026-01-16
**Version** : MVP 0.95
**Responsable** : Équipe OneEats
**Prochaine revue** : 2026-01-23
