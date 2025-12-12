# 🐛 Bugs et Problèmes Connus - OneEats

## 📊 Vue d'ensemble

| Statut | Nombre | Description |
|--------|--------|-------------|
| 🔴 Critique | 2 | Bloquant pour le MVP |
| 🟠 Important | 3 | Impact significatif sur l'expérience |
| 🟡 Moyen | 2 | Problème mineur |
| 🟢 Résolu | 5 | Bugs corrigés |

---

## 🔴 Bugs Critiques (Bloquant MVP)

### BUG-001 : Mock data utilisé dans frontend web et mobile
**Priorité** : 🔴 Critique
**Status** : ➡️ En cours
**Affecte** : Frontend Web, Mobile
**Date création** : 2025-12-10

**Description** :
Les frontends (web dashboard et mobile app) utilisent encore des données mockées au lieu de vraies APIs backend. Cela empêche le fonctionnement réel du MVP.

**Impact** :
- ❌ Impossible de passer de vraies commandes end-to-end
- ❌ Modifications dans le dashboard ne sont pas persistées
- ❌ Pas de synchronisation entre mobile et web
- ❌ Tests E2E impossibles

**Étapes pour reproduire** :
1. Lancer le dashboard web sur `http://localhost:8080/restaurant`
2. Modifier un menu item
3. Rafraîchir la page → modifications perdues (mock data)

**Workaround temporaire** :
Aucun - nécessite implémentation complète

**Solution prévue** :
- Connecter `apps/web/` aux APIs backend (Sprint 1 - ONEE-002)
- Connecter `apps/mobile/` aux APIs backend (Sprint 1 - ONEE-003)
- Créer services API centralisés côté frontend

**Assigné à** : Sprint 1
**ETA** : 2025-12-15

---

### BUG-002 : Authentification JWT non implémentée
**Priorité** : 🔴 Critique
**Status** : 📋 Backlog
**Affecte** : Backend, Frontend Web, Mobile
**Date création** : 2025-12-10

**Description** :
Le système d'authentification JWT est documenté mais pas implémenté. Les APIs sont actuellement accessibles sans authentification.

**Impact** :
- ❌ Aucune sécurité sur les endpoints
- ❌ Impossible de distinguer les utilisateurs
- ❌ Pas de gestion des rôles (CLIENT, RESTAURANT, ADMIN)
- ❌ Non conforme pour un déploiement production

**Étapes pour reproduire** :
1. Appeler `GET /api/restaurants` sans header Authorization → Succès (devrait être 401)
2. Modifier n'importe quelle ressource sans authentification → Succès (devrait être interdit)

**Workaround temporaire** :
Mode développement sans auth pour tests rapides

**Solution prévue** :
- Backend : Endpoints `/auth/login` et `/auth/register` (Sprint 3)
- Backend : Middleware JWT validation sur routes protégées
- Frontend Web : Login page + gestion tokens
- Mobile : AuthContext avec tokens sécurisés (SecureStore)

**Assigné à** : Sprint 3
**ETA** : 2025-12-20

---

## 🟠 Bugs Importants

### BUG-003 : WebSocket temps réel non implémenté
**Priorité** : 🟠 Important
**Status** : 📋 Backlog
**Affecte** : Backend, Frontend Web, Mobile
**Date création** : 2025-12-10

**Description** :
Les notifications et mises à jour de statuts commandes ne sont pas en temps réel. Le restaurant ne reçoit pas de notification immédiate pour une nouvelle commande.

**Impact** :
- ⚠️ Nécessite rafraîchissement manuel des pages
- ⚠️ Délai dans la gestion des commandes
- ⚠️ Mauvaise expérience utilisateur

**Workaround temporaire** :
Polling manuel toutes les 30 secondes (non implémenté)

**Solution prévue** :
- Backend : WebSocket endpoint avec Quarkus WebSocket
- NotificationService pour broadcast événements
- Frontend : Connexion WebSocket et gestion événements

**Assigné à** : Sprint 4
**ETA** : 2025-12-25

---

### BUG-004 : Mode offline non implémenté (mobile)
**Priorité** : 🟠 Important
**Status** : 📋 Backlog
**Affecte** : Mobile
**Date création** : 2025-12-11

**Description** :
L'application mobile ne fonctionne pas sans connexion internet. Aucun cache intelligent n'est implémenté.

**Impact** :
- ⚠️ Crash ou erreurs si perte de connexion
- ⚠️ Impossible de consulter menus/restaurants déjà vus
- ⚠️ Expérience utilisateur dégradée

**Workaround temporaire** :
Connexion internet requise en permanence

**Solution prévue** :
- CacheService avec stratégies intelligentes
- Détection connectivité avec NetInfo
- Queue requêtes pendant offline
- Synchronisation en arrière-plan

**Assigné à** : Sprint 5
**ETA** : 2026-01-05

---

### BUG-005 : Tests E2E incomplets
**Priorité** : 🟠 Important
**Status** : 📋 Backlog
**Affecte** : Tous les modules
**Date création** : 2025-12-11

**Description** :
La suite de tests E2E n'est pas complète. Certains flux critiques ne sont pas testés automatiquement.

**Impact** :
- ⚠️ Risque de régression non détectée
- ⚠️ Difficile de valider les releases
- ⚠️ Confiance limitée dans le code

**Solution prévue** :
- Tests E2E pour flux complet commande (client → restaurant)
- Tests d'intégration backend complets
- Tests unitaires frontend (Jest + React Testing Library)
- CI/CD avec exécution automatique des tests

**Assigné à** : Sprint 7
**ETA** : 2026-01-15

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
- 🔴 Critique : 2 actifs, 3 résolus
- 🟠 Important : 3 actifs, 2 résolus
- 🟡 Moyen : 2 actifs, 1 résolu

### Temps moyen de résolution
- Critique : 5 jours
- Important : 3 jours
- Moyen : 2 jours

### Bugs créés vs résolus (30 derniers jours)
- Créés : 7
- Résolus : 5
- Taux de résolution : 71%

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

**Date** : 2025-12-12
**Version** : MVP 0.7
**Responsable** : Équipe OneEats
**Prochaine revue** : 2025-12-19
