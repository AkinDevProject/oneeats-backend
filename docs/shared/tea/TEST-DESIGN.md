# Test Design — OneEats Backend (MVP)

Basé sur : PRD (`docs/shared/pm/prd.md`), Architecture cible (`docs/shared/architect/architecture.md`), ADR-001..005 (`docs/shared/architect/adr/`), Épics (`docs/shared/pm/epics-and-stories.md`), `docs/shared/architect-dev/API_SPECS.md`, `docs/shared/tea/TEST_STRATEGY.md`.
Périmètre : P0/P1 (MVP core + notifications/uploads/analytics de base).

## 1. Objectifs & Scope
- Vérifier les parcours critiques : auth/roles, CRUD restaurants/menus, commandes (cycle complet), uploads, notifications, stats basiques.
- Aligner la nomenclature statuts (ADR-002) et la sécurité (ADR-001) avec front web/mobile.
- Couvrir risques : divergence statuts, auth WS, sécurité uploads (taille/MIME), cohérence calculs commandes/stats.

## 2. Stratégie de test
- Niveaux : unit (services/domain), intégration REST (Quarkus test + DB), contract (DTO/enums alignement), E2E critique (API ou web/mobile smoke si retenu).
- Types : fonctionnel, sécurité (auth/roles, WS auth), résilience (transitions invalides, uploads invalides), perf légère (latence p95 cible sur endpoints clés), compatibilité (statuts/API avec front), observabilité (health, métriques exposées).
- Environnements : dev/docker-compose (Postgres, Keycloak), CI pipeline (headless). Données seed minimal pour scénarios commandes/menus/restaurants.

## 3. Matrice couverture (extraits)
- Auth (P0) : login/refresh/logout, accès protégé par rôle, token expiré.
- Restaurants (P0) : create/update/delete/get, status pending/approved/blocked, isOpen toggle, stats/today.
- Menu (P0) : create/update/delete/list, availability, diététique, unique name per restaurant.
- Orders (P0) : création panier valide, transitions PENDING→PREPARING→READY→PICKED_UP, CANCELLED règles, filtrage par statut/date.
- Notifications (P1) : WS auth OK, events order.created/status.changed, REST unread-count, fallback si WS off.
- Uploads (P1) : logo/image <=5 Mo jpg/png/webp, MIME/extension invalides rejetées, URL publique renvoyée.
- Analytics (P1) : stats jour restaurant, stats plateforme basiques.
- Admin users (P1) : CRUD user, rôles, recherche.
- Observabilité (P1) : health, métriques Micrometer, logs JSON présents.

## 4. Scénarios critiques (P0)
- Auth : login rôle RESTAURANT -> accès autorisé aux endpoints /restaurants/{id}/orders ; accès interdit rôle CLIENT aux endpoints admin.
- Orders : passage commande avec item indisponible -> rejet; resto fermé -> rejet; transition PENDING→READY sans PREPARING -> rejet; annulation client avant PREPARING -> OK; annulation après PREPARING -> rejet.
- Statuts : vérifier mapping enum canonique (PENDING/PREPARING/READY/PICKED_UP/CANCELLED) en API/DB/DTO/front mocks.
- Uploads : fichier 6 Mo -> 413/422; fichier .exe -> rejet; image valide -> URL servie.
- Notifications : connexion WS sans token -> refus; avec token resto -> reçoit events pour son resto; change statut commande -> événement reçu.

## 5. Scénarios importants (P1)
- Stats jour : commandes du jour seulement; revenue et avgOrderValue cohérents.
- Admin users : création user rôle RESTAURANT, email unique; recherche par rôle.
- Observabilité : `/q/health` OK; métriques HTTP/DB exposées.
- Push mobile (si retenu) : token device stocké, envoi push sur order.created.

## 6. Artefacts & livraison
- Ce plan : `docs/shared/tea/TEST-DESIGN.md`.
- À produire : suites de tests (unit/int/contract/e2e), fixtures seed, scripts CI (run tests), rapport de couverture (Jacoco/RestAssured), checklists de revues.
- Coordination : valider scope E2E (backend-only vs web/mobile smoke) avec PM/QA; aligner enums statuts/front; intégrer limites uploads dans front.

## 7. Données & fixtures
- Seeds : 1 restaurant approved+open, 1 menu item disponible et 1 indisponible, 1 user RESTAURANT, 1 user CLIENT, commandes de test pour stats.
- Tokens : générer via Keycloak pour rôles CLIENT/RESTAURANT/ADMIN.

## 8. Risques & mitigations
- Divergence statuts : tests contractuels sur enum + endpoints list; CI pour détecter.
- Auth WS : tester upgrade avec token expiré/absent; fallback REST.
- Uploads : tester MIME spoofing; limiter taille; scanner extension.
- Perf : p95 cible vérifiée sur endpoints CRUD/orders via smoke perf (k6/JMeter léger) si temps.

