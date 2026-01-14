# Sprint Plan — OneEats Backend (Sprint 1)

Scope : P0 priorités MVP (auth/roles, statuts commande alignés, uploads sécurisés, cycle commandes de base). Basé sur EPICS-USER-STORIES, ADR-001..004, IMPLEMENTATION-READINESS.

## Definition of Ready (DoR)
- User story liée à une épic P0/P1 avec AC clairs.
- Contrats API connus (API_SPECS aligné ADR), enums statuts harmonisés.
- Dépendances identifiées (Keycloak config, storage FS, seeds DB).
- Tests attendus précisés (unit/int/contract/e2e si applicable).

## Definition of Done (DoD)
- Code + tests (unit/int ou e2e si story) verts en CI.
- Contrats API respectés, enums statuts conformes ADR-002.
- Logs/metrics/health non régressés.
- Docs mises à jour (API_SPECS/README si impact, ADR inchangés ou mis à jour si décision différente).

## Stories Sprint 1 (proposées)

### S1: Auth Keycloak (ADR-001) — P0
- Tâches : config OIDC Quarkus (resource server), mapping roles, sécuriser endpoints, tests int auth/roles, doc rapide.
- Dépendances : Keycloak dispo/config clients/roles.

### S2: Harmonisation statuts commandes (ADR-002) — P0
- Tâches : mettre à jour enum backend/DB/DTO, aligner API_SPECS, mocks front, tests int transition invalides/valides.
- Dépendances : aucune, mais impacter front/web/mobile.

### S3: Cycle de vie commandes — P0
- Tâches : transitions PENDING→PREPARING→READY→PICKED_UP, CANCELLED règles (client avant PREPARING, resto avant PICKED_UP), filtres liste/statuts/date; tests int/contract.
- Dépendances : S2 statuts harmonisés.

### S4: Uploads sécurisés (ADR-004) — P1
- Tâches : impl service storage abstrait (FS dev), validation taille/MIME/extension, endpoints upload-logo/upload-image, tests invalides/valides, doc contraintes.
- Dépendances : aucune forte; aligner avec front avant release.

### S5: Seeds & fixtures — P1
- Tâches : init.sql/import-dev.sql avec users/roles, 1 resto approved+open, items dispo/indispo, commandes de démo; scripts pour CI/dev.
- Dépendances : S1 (roles), S2 (statuts).

## Ordonnancement
1) S2 Statuts (canoniser enums avant commandes).
2) S3 Cycle commandes (appuyé sur S2).
3) S4 Uploads (en parallèle possible, valider format réponse).
4) S5 Seeds (après S2 pour cohérence statuts ; rôles préparés mais auth implémentée plus tard).
5) S1 Auth (Keycloak) en dernier pour sécuriser une fois les flux métiers stabilisés.

## Risques & mitigation
- Keycloak non prêt → auth en fin de sprint : anticiper config clients/roles pendant le sprint, prévoir tokens de dev temporaires.
- Divergence statuts front → communiquer dès S2, mettre à jour mocks/tests front.
- Sécurité uploads → valider MIME/taille, sanitation noms, pas d’exécution de fichiers.
- Tests E2E indisponibles → fallback tests int/contract + smoke API.

## Sorties attendues Sprint 1
- Auth JWT opérationnelle, endpoints sécurisés par rôle (livrée en fin de sprint).
- Enum statuts unifié et appliqué (backend/API/front mocks).
- Commandes avec transitions validées + tests.
- Uploads fonctionnels et sécurisés (FS dev).
- Seeds cohérents pour dev/CI.
