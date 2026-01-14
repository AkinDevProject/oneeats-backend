# Architecture cible — OneEats Backend

**Date** : 2026-01-14
**Portée** : Backend monolithique Quarkus + intégrations front web (Quinoa) / mobile (Expo) + Keycloak + Postgres + notifications

## Intrants utilisés
- PRD : `docs/product/PRD-oneeats-backend.md`
- Roadmap : `docs/ROADMAP.md`
- Spécifications métier : `docs/BUSINESS_RULES.md`, `docs/USE_CASES.md`
- Modèle de données : `docs/DATA_MODEL.md`
- API : `docs/API_SPECS.md`
- Tests : `docs/TEST_STRATEGY.md`

## Objectifs d'architecture
- Consolider le monolithe Quarkus (Java 21) avec une structure modulaire par domaine (auth, user, restaurant, menu, order, notification, analytics).
- Garantir l’alignement des statuts de commande et des contrats API entre backend et front (web/mobile).
- Préparer l’auth et la sécurité (Keycloak + JWT), l’observabilité (Micrometer/Prometheus, logs structurés), et le temps réel (WebSocket + push Expo).
- Encadrer les exigences NF : perf (p95<300ms CRUD, p99<800ms commandes), disponibilité 99.5% MVP, validations/Bean Validation, RGPD (données minimales, suppression/désactivation).

## Vue Contexte (C4 niveau 1)
```
[Mobile App (Expo)] -- REST/HTTPS --> [Quarkus API (Monolith)] <-- REST/HTTPS -- [Web Dashboard (Vite/Quinoa)]
[Admin Dashboard]   -- REST/HTTPS --> [Quarkus API (Monolith)]
[Quarkus API] -- OIDC/OAuth2 --> [Keycloak]
[Quarkus API] -- SQL --> [PostgreSQL]
[Quarkus API] -- WebSocket --> [Web Dashboard]
[Quarkus API] -- Push (Expo/FCM) --> [Mobile App]
```

## Vue Conteneurs (C4 niveau 2)
- Quarkus Monolith : modules de domaines, REST controllers, services, repositories, WebSocket endpoint (notifications), intégration Quinoa.
- PostgreSQL : stockage relationnel (users, restaurants, menu_items, orders, order_items, categories, notifications, analytics agrégées).
- Keycloak : OIDC provider (roles CLIENT/RESTAURANT/ADMIN), tokens JWT validés par Quarkus.
- Front Web (Vite/React) : dashboards restaurant/admin, servi par Quarkus via Quinoa, consomme REST + WebSocket.
- Mobile (Expo RN) : consomme REST + push notifications, WebSocket (optionnel/v2).
- Stockage fichiers (dev) : FS local pour images; cible cloud (S3/GCS) ultérieure.
- Observabilité : Micrometer + Prometheus, Health endpoints; logs structurés (JSON) vers console.

## Vue Composants (C4 niveau 3, Quarkus)
- `auth` : intégration Keycloak (OIDC), validation JWT, mappers User/Role.
- `user` : gestion comptes (CRUD admin, profil), rôles.
- `restaurant` : gestion profil, horaires (JSON schedule), ouverture/activation, statuts d’approbation.
- `menu` : CRUD MenuItem + catégories, disponibilité, allergènes, options, upload image.
- `order` : cycle de vie commande, validation panier/disponibilité, transitions statut, notifications.
- `notification` : WebSocket + push; stockage notifications et unread-count.
- `analytics` : endpoints de stats (restaurant/admin), agrégations simples.
- `common` : exceptions, validation, mapping DTO, logging/metrics, pagination.

## Flux clés
- Auth : Front → `/api/auth/login` (Keycloak ou resource server) → token JWT → usages subséquents. Refresh via `/api/auth/refresh` si adopté.
- Commande : Mobile passe commande (panier validé, restaurant ouvert/actif, items disponibles) → Order service → statuts PENDING→PREPARING→READY→PICKED_UP (ANNULEE/CANCELLED) → notifications WebSocket/push.
- Notifications : Quarkus émet events (order.created/status.changed) → WebSocket (web) + push (mobile). Fallback polling possible sur `/api/notifications`.
- Upload images : REST multipart vers Quarkus → stockage FS (dev) → URL servie; resize/validation taille/format.

## Alignement statuts commandes (unique)
- Canonique API/backend (anglais) : `PENDING`, `PREPARING`, `READY`, `PICKED_UP`, `CANCELLED`.
- Mapping docs FR : `EN_ATTENTE`→PENDING, `EN_PREPARATION`→PREPARING, `PRETE`→READY, `RECUPEREE`→PICKED_UP, `ANNULEE`→CANCELLED.
- Action : aligner `API_SPECS.md`, DTO, enums backend, front web/mobile et migrations DB sur cette nomenclature.

## Garde-fous Non-Fonctionnels
- Perf : p95<300ms CRUD, p99<800ms commandes; revoir après mesures.
- Obs : métriques Micrometer exposées, traces simples; logs JSON, corrélation requête (trace/request id) en header.
- Sécu : OIDC obligatoire sauf `/auth/login`; validation Bean; taille upload max (ex: 2-5 Mo) et formats whitelist.
- Résilience : timeouts HTTP côté front, retry limité sur GET; fallback polling si WS down.

## Décisions clés (voir ADR)
- Auth : Keycloak + JWT resource server (ADR-001).
- Statuts commande : nomenclature unique PENDING/PREPARING/READY/PICKED_UP/CANCELLED (ADR-002).
- Notifications : WebSocket + push Expo avec fallback polling (ADR-003).
- Uploads : FS local en dev, S3/GCS cible; validation et URL publiques (ADR-004).

## Plan de livraison technique
- Phase 1 (MVP Core) : Auth JWT, Restaurant CRUD, Menu CRUD, Cycle de vie commande avec statuts alignés, Stats basiques, Uploads images (FS dev).
- Phase 2 (Dashboards) : Admin users, analytics avancées, workflow approbation restaurants, search/filters, migration stockage objet.
- Phase 3 (Temps réel & sécu) : WebSocket notifications, push Expo, rate limiting de base, audit logging, exports CSV/PDF.

## Points de validation
- Revue statuts/contrats avec équipes front (web/mobile) avant livraison.
- Vérifier schéma DB vs `DATA_MODEL.md` après alignement enums et champs (horaires JSON, options menu, notifications).
- Confirmer config Keycloak (realms/clients/roles) et stratégie refresh tokens.
- Valider besoins UX pour fallback notifications (polling) et messages d’erreur.

