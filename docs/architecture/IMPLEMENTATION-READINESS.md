# Implementation Readiness — OneEats Backend (MVP)

Basé sur : PRD, ARCHITECTURE-TARGET, ADR-001..004, API_SPECS, EPICS-USER-STORIES, TEST-DESIGN, ROADMAP.
Objectif : check go/no-go avant dev.

## Checklist go/no-go
- PRD & épics : PRD aligné avec EPICS-USER-STORIES (P0/P1) — ✅/🚧
- Architecture : ARCHITECTURE-TARGET validée, ADR appliqués (auth, statuts, notifications, uploads) — ✅/🚧
- Statuts commandes : enum canonique PENDING/PREPARING/READY/PICKED_UP/CANCELLED appliqué dans code, DTO, API_SPECS, front mocks — ✅/🚧
- Auth : choix flux Keycloak (proxy login/refresh ou Keycloak direct), mapping rôles CLIENT/RESTAURANT/ADMIN, config OIDC prête — ✅/🚧
- Notifications : scope MVP confirmé (WS web + fallback REST, push mobile optionnel), auth WS, payload minimal défini — ✅/🚧
- Uploads : contraintes (≤5 Mo, jpg/png/webp, MIME/extension) intégrées, service storage abstrait FS→S3/GCS planifié, endpoints `upload-logo`/`upload-image` alignés — ✅/🚧
- API specs : `docs/API_SPECS.md` complètes et cohérentes avec ADR; statuts harmonisés — ✅/🚧
- Seeds/fixtures : `init.sql`/`import-dev.sql` prêts (users/roles, 1 resto approved+open, menu item dispo/indispo, commandes démo) — ✅/🚧
- Environnements : docker-compose.dev.yml (Postgres, Keycloak) fonctionnel; configs Quarkus dev/test/CI à jour — ✅/🚧
- Tests/CI : stratégie (`TEST_STRATEGY.md`) + plan (`TEST-DESIGN.md`) validés; commandes de run (`./mvnw test`), suites unit/int/contract/e2e planifiées; CI pipeline connu — ✅/🚧
- Observabilité : health, métriques Micrometer/Prometheus, logs JSON prévus/conformes arch cible — ✅/🚧
- Risques ouverts listés et propriétaires assignés — ✅/🚧

## Actions critiques avant dev
1) Harmoniser enums statuts dans code/backend/front + API_SPECS (ADR-002).
2) Valider flux auth Keycloak (proxy vs UI directe) et config OIDC; générer clients/roles.
3) Définir scope notifications MVP (WS + fallback; push mobile si retenu) et auth WS.
4) Implémenter abstraction storage (FS dev, S3/GCS cible) et limites uploads.
5) Préparer seeds (users/roles/resto/menu/commande) cohérents avec tests.
6) Vérifier docker-compose dev (Postgres/Keycloak) et config Quarkus dev/test.
7) Aligner front web/mobile sur DTO/enums/uploads; partager contraintes upload.

## Risques & mitigations
- Divergence statuts → tests contractuels + revue API specs.
- Auth WS/Keycloak indispo → fallback REST notifications + timeouts côté front.
- Uploads sécurité → validation MIME/extension/taille, sanitation noms, quotas.
- Perf p95/p99 non tenus → observabilité en place, smoke perf sur endpoints clés.

## Go/No-Go
- Go si toutes cases ✅ et risques critiques avec mitigation validée.
- No-Go si statuts non harmonisés, auth Keycloak non configurée, uploads non sécurisés, ou notifications scope incertain.

