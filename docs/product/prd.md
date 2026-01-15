---
stepsCompleted:
  - problem-objectives
  - scope
  - actors-personas
  - user-journeys
  - functional-requirements
  - nonfunctional-requirements
  - data-contracts
  - dependencies
  - risks
  - metrics
  - hypotheses
  - deliverables
  - execution-plan
inputDocuments:
  - docs/ROADMAP.md
  - docs/business/BUSINESS_RULES.md
  - docs/business/USE_CASES.md
  - docs/api/DATA_MODEL.md
  - docs/business/REQUIREMENTS_SPECIFICATION.md
  - docs/tests/TEST_STRATEGY.md
  - docs/api/API_SPECS.md
workflowType: 'prd'
---

# Product Requirements Document - OneEats Backend

**Author:** Equipe OneEats
**Date:** 2026-01-14
**Scope:** Backend OneEats (APIs, donnees, auth, notifications, integration front web/mobile)

## 1. Problème et objectifs
- Problème : Les restaurants veulent recevoir/traiter des commandes à emporter/sur place sans livraison ni paiement en ligne; les clients veulent commander et suivre le statut en temps réel; l’admin veut gouverner la plateforme.
- Objectifs clés (MVP) :
  - Permettre la prise de commande mobile et le suivi temps réel des statuts.
  - Offrir au restaurateur un dashboard pour menus, commandes, disponibilité, horaires.
  - Permettre à l’admin de valider/activer restaurants et superviser l’activité.
  - Intégrer web/mobile aux vraies APIs (remplacer les mocks) et préparer l’auth JWT.

## 2. Portée (in/out)
- In :
  - APIs REST Quarkus pour Users, Restaurants, MenuItems, Orders (existantes), raccordement aux front web/mobile.
  - Gestion des statuts de commande et règles métier (récupération sur place, pas de livraison, pas de paiement en ligne).
  - Authentification/autorisation (Keycloak/JWT) à livrer dans la phase sécurité.
  - Notifications (push/websocket) prévues, à cadrer pour temps réel (phase 4).
- Out (MVP) :
  - Paiement en ligne, fidélité/promo, livraison, multi-langue, impression tickets.

## 3. Acteurs / personas
- Client mobile (commande, suivi, historique, profil) — voir `USE_CASES.md` UC-001..008.
- Restaurateur dashboard (menus, horaires, commandes, stats) — UC-101..106.
- Administrateur dashboard (validation, suspension, supervision, stats) — UC-201..205.

## 4. User journeys clés
- Client : découvrir restaurants, consulter menu, ajouter au panier, passer commande, suivre statut, récupérer sur place, consulter historique.
- Restaurateur : se connecter, ouvrir/fermer, gérer menu, recevoir commande, accepter/refuser, passer EN_PREPARATION→PRETE→RECUPEREE, consulter stats.
- Admin : valider/activer restaurants, gérer utilisateurs, voir dashboard global, exporter stats.

## 5. Exigences fonctionnelles (priorisées)
- F1 (Haute) Auth/roles : JWT/Keycloak avec rôles CLIENT/RESTAURANT/ADMIN; endpoints protégés (Phase 3 roadmap).
- F2 (Haute) Commandes : cycle de vie et règles de `BUSINESS_RULES.md` (pas de livraison ni paiement en ligne) ; statuts temps réel.
- F3 (Haute) Menus : CRUD menu items + catégories, disponibilité, allergènes, images; unique name par restaurant.
- F4 (Haute) Restaurants : profil, horaires (JSON schedule), open/active, recherche/filtre, rating auto (futur).
- F5 (Haute) Intégration front : remplacer mocks web/mobile par vraies APIs; gérer états loading/error, configs env.
- F6 (Moyenne) Stats/analytics : métriques restaurant et admin (CA, commandes) côté dashboard; endpoints agrégés.
- F7 (Moyenne) Notifications : push/websocket pour nouvelles commandes et changements de statut (phase temps réel).
- F8 (Basse) Exports admin : export stats (CSV/PDF) — UC-205.

## 6. Exigences non fonctionnelles / SLO cibles
- Performance : p95 < 300ms sur endpoints CRUD; p99 < 800ms sur commandes (lecture/écriture), à préciser après mesure.
- Disponibilité : 99.5% cible MVP (monolithe Quarkus + Postgres). Pas de HA multi-région MVP.
- Sécurité : OIDC/Keycloak, mots de passe hashés (bcrypt), rôles, validation input, RGPD (données minimales, suppression/désactivation).
- Observabilité : Micrometer + Prometheus exposé; logs structurés; health checks déjà en place.
- Scalabilité : vertical + DB indexation; WebSocket/notifications pensés pour montée en charge (phase 4).

## 7. Données et contrats
- Modèle de données : voir `DATA_MODEL.md` (users, restaurants, menu_items, orders, order_items, categories). Respecter contraintes d’unicité/index.
- API : voir `docs/API_SPECS.md` (si vide, à compléter depuis code/Swagger). Exposer CRUD et endpoints métier (transitions de statut, filtrage).
- Rules de transition commande : tableau `BUSINESS_RULES.md` (EN_ATTENTE→EN_PREPARATION→PRETE→RECUPEREE + ANNULEE).

### Gaps API & alignements
- Statuts commande : `API_SPECS.md` mentionne `pending|preparing|ready|delivered|cancelled` → à aligner avec `BUSINESS_RULES.md` (`EN_ATTENTE|EN_PREPARATION|PRETE|RECUPEREE|ANNULEE`) pour éviter divergence front/back.
- Auth : endpoints login/refresh/logout/me listés, mais Keycloak/JWT non implémenté → planifier Phase 3.
- Uploads : endpoints upload logo/menu image définis → vérifier taille/format/stockage et quotas.
- Notifications : WebSocket `/ws/notifications` à cadrer (auth, audience, événements, fallback polling).
- Analytics : DTOs de stats existent mais métriques cibles non figées → aligner avec métriques section 10.

## 8. Dépendances et intégrations
- Keycloak (auth), PostgreSQL (DB), Quinoa/serveur frontend, Expo push (mobile), futures WebSockets pour temps réel.
- CI/CD ? (non renseigné ici) — à préciser; Docker compose pour dev (`docker-compose.dev.yml`).

## 9. Risques & mitigations
- Auth JWT non implémentée : planifier sprint dédié (Phase 3 roadmap).
- Temps réel non livré : risque sur UX suivi commande; prévoir fallback polling.
- Données mock côté front : retarde validation bout-en-bout; prioriser intégration API et états d’erreur.
- RGPD : stockage minimal; prévoir suppression/désactivation utilisateurs.

## 10. Métriques de succès (MVP)
- Taux de réussite commande (sans erreur) > 98%.
- Latence p95 API commandes < 300ms.
- Temps moyen de passage EN_ATTENTE→PRETE < X min (à définir par métier).
- Zéro perte de commande (0 incidents de commande bloquée en statut intermédiaire sur 7j).

## 11. Hypothèses / questions ouvertes
- Les specs API détaillées sont-elles figées ? `docs/API_SPECS.md` à valider/compléter.
- Notifications : scope exact MVP (push mobile vs websocket web) ?
- Auth : Keycloak déjà déployé ? flux signup/login à couvrir backend ou confié à Keycloak UI ?
- Export stats : format attendu (CSV/PDF) et volumétrie ?
- Alignment statuts : choisir nomenclature unique (fr vs en) pour commandes dans code/front/api.

## 12. Livrables PRD
- Ce document `docs/product/PRD-oneeats-backend.md` (version courante).
- Checklist de conformité avec `docs/ROADMAP.md` et règles métier.
- Annexes : liens vers use cases, règles, data model, API specs, test strategy.

## 13. Plan d’exécution
- P1 Rassembler/valider sources (docs + code) et compléter API specs.
- P2 Clarifier hypothèses ouvertes avec stakeholders (PM, leads backend/front, QA, DevOps).
- P3 Figer priorités F1..F8 pour prochain sprint (intégration APIs + auth + temps réel planifié).
- P4 Faire relire (PM, backend, front, QA), intégrer feedback, versionner.

### Priorités d’implémentation (issu de `API_SPECS.md`)
- Phase 1 : Auth JWT, Restaurant CRUD, Menu CRUD, Cycle de vie commandes, Stats basiques.
- Phase 2 : Admin users, Analytics avancées, Uploads images, Workflow approbation restaurants, Search/filters.
- Phase 3 : Notifications temps réel (WebSocket), métriques perf, audit logging, exports CSV/PDF, sécurité avancée (rate limiting/RBAC fin).
