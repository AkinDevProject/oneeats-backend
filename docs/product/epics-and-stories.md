# Épics & User Stories — OneEats Backend (MVP)

Basé sur : `docs/product/PRD-oneeats-backend.md`, `docs/architecture/ARCHITECTURE-TARGET.md`, ADRs 001–004, `API_SPECS.md`.
Priorités : P0 (critique MVP), P1 (important), P2 (ensuite).

## Épic A — Auth & Sécurité (P0)
- US-A1 Login JWT via Keycloak (CLIENT/RESTAURANT/ADMIN)
  - AC : POST /api/auth/login (ou redirection Keycloak) retourne token/claims; rôle appliqué sur routes.
- US-A2 Protection routes par rôle
  - AC : toutes routes (sauf login/refresh) requièrent Bearer; 403 si rôle manquant.
- US-A3 Refresh/Logout (si proxifié)
  - AC : /api/auth/refresh renvoie nouveau token; /api/auth/logout invalide token côté Keycloak/proxy.

## Épic B — Restaurants (P0)
- US-B1 CRUD restaurant (admin)
  - AC : create/update/delete/get avec validations (email, phone, address) ; pagination liste.
- US-B2 Statut open/active & approbation
  - AC : PUT /api/restaurants/{id}/status gère pending/approved/blocked ; isOpen toggle ; filtrage par statut.
- US-B3 Stats du jour restaurant
  - AC : /stats/today retourne orders/revenue/avgOrderValue cohérents avec commandes du jour.
- US-B4 Upload logo (ADR-004)
  - AC : POST upload-logo accepte jpg/png/webp ≤5 Mo; renvoie logoUrl; fichier stocké selon policy.

## Épic C — Menu (P0)
- US-C1 CRUD menu items + catégories
  - AC : create/update/delete/list par restaurant; validation prix>0, nom unique par resto, catégorie requise.
- US-C2 Disponibilité & options diététiques
  - AC : toggle availability; champs isVegetarian/isVegan/allergens retournés dans DTO; indispo bloque ajout commande.
- US-C3 Upload image item (ADR-004)
  - AC : POST upload-image accepte jpg/png/webp ≤5 Mo; renvoie imageUrl; stock conforme policy.

## Épic D — Commandes (P0)
- US-D1 Passage commande (mobile)
  - AC : panier validé (items disponibles, resto ouvert/actif), total calculé, commande en statut PENDING.
- US-D2 Cycle de vie commande (resto)
  - AC : PUT /api/orders/{id}/status supporte PENDING→PREPARING→READY→PICKED_UP et CANCELLED; validations de transition.
- US-D3 Historique / listing par statut
  - AC : list filtres status/date/pagination; mapping statuts aligné (ADR-002).
- US-D4 Règles métier annulation
  - AC : client annule avant PREPARING; resto annule avant PICKED_UP; statut mis à jour et notifié.

## Épic E — Notifications (P1)
- US-E1 WebSocket notifications (web)
  - AC : /ws/notifications authentifié; events order.created/status.changed/cancelled avec payload minimal; scope par restaurant/admin.
- US-E2 Notifications REST + unread-count
  - AC : endpoints get notifications + unread-count; mark-as-read; cohérents avec events.
- US-E3 Push mobile (optionnel MVP si retenu)
  - AC : envoi push via Expo/FCM sur création/maj statut; stockage tokens device.

## Épic F — Uploads & Media (P1)
- US-F1 Service de storage abstrait
  - AC : impl FS dev + interface pour S3/GCS; validation taille/format; génération URL publique.
- US-F2 Sécurité uploads
  - AC : validation MIME/extension; sanitation noms; limites configurables; tests invalide/valide.

## Épic G — Analytics & Dashboard (P1)
- US-G1 Stats jour restaurant
  - AC : total orders/revenue/avgOrderValue en cohérence avec commandes du jour.
- US-G2 Stats plateforme basiques
  - AC : totalRestaurants/activeRestaurants/totalUsers/totalOrders/totalRevenue pour Admin.

## Épic H — Admin Users (P1)
- US-H1 CRUD utilisateurs (admin)
  - AC : create/update/delete/list avec rôles; recherche par rôle/texte; validation email unique.

## Épic I — Observabilité & Qualité (P1)
- US-I1 Logs structurés + métriques
  - AC : logs JSON pour requêtes; Micrometer/Prometheus expose métriques; health endpoints OK.
- US-I2 Tests d’intégration clés
  - AC : tests REST pour auth, restaurant, menu, orders (cycle statut), uploads; WebSocket si livré.

## Dépendances clés
- Auth (Épic A) avant Notifications WS (Épic E) et avant sécurisation complète des routes.
- Alignement statuts (ADR-002) avant implémentation Orders/Notifications/Front.
- Storage (Épic F) supporte les uploads de B4/C3.
- Observabilité (I1) utile pour validation perf NFR.

## Prochaines actions
- Valider la portée notifications MVP (WS web seul vs push mobile + fallback).
- Planifier les sprints en ordonnant P0 puis P1, avec dépendances ci-dessus.
- Synchroniser avec front web/mobile sur enums statuts et formats DTO (orders, menus, uploads).

