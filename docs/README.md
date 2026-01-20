# Documentation OneEats

Point d'entree principal pour la documentation du projet OneEats.
Organisation par agent BMAD pour faciliter la navigation.

---

## Table des matieres

- [Quick Reference](#quick-reference)
- [Demarrage Rapide](#demarrage-rapide)
- [Structure par Agent BMAD](#structure-par-agent-bmad)
- [Flux de Creation des Documents](#flux-de-creation-des-documents)
- [Cas d'Usage](#cas-dusage)
- [Conventions](#conventions)

---

## Quick Reference

| Attribut | Valeur |
|----------|--------|
| **Projet** | OneEats - Plateforme Click & Collect |
| **Type** | Monorepo Multi-Part (3 parties) |
| **Backend** | Java 21 / Quarkus 3.24.2 |
| **Web** | React 18 / TypeScript / Vite (Quinoa) |
| **Mobile** | React Native / Expo |
| **Architecture** | Hexagonale (DDD) |
| **Database** | PostgreSQL |
| **Auth** | Keycloak (OIDC) |

---

## Demarrage Rapide

### Pour Claude Code

**Commencez toujours par lire ces fichiers dans cet ordre :**

1. **[ROADMAP.md](ROADMAP.md)** - Tache en cours et prochaines etapes
2. **[analyst/BUSINESS_RULES.md](analyst/BUSINESS_RULES.md)** - Regles metier
3. **[architect/](architect/)** - Architecture technique

### Pour les Developpeurs

```bash
# 1. Demarrer PostgreSQL
docker-compose up -d

# 2. Lancer le backend via IntelliJ IDEA (Quarkus dev mode)
# URL: http://localhost:8080

# 3. Mobile (optionnel)
cd apps/mobile && npm start
```

### URLs de Developpement

| Service | URL |
|---------|-----|
| Backend API | http://localhost:8080/api |
| Dashboard Web | http://localhost:8080/restaurant |
| Health Check | http://localhost:8080/q/health |

---

## Structure par Agent BMAD

### Fichiers Racine (Tous agents)

| Fichier | Description |
|---------|-------------|
| **[ROADMAP.md](ROADMAP.md)** | Progression projet, taches en cours |
| **[BUGS.md](BUGS.md)** | Bugs connus et suivi |

---

### /pm/ - Product Manager

Documents de planification produit et backlog.

| Document | Description |
|----------|-------------|
| **[prd.md](pm/prd.md)** | Product Requirements Document |
| **[epics-and-stories.md](pm/epics-and-stories.md)** | Epics et User Stories |
| **[USER_STORIES.md](pm/USER_STORIES.md)** | Stories utilisateur mobile |
| **[sprint-status.yaml](pm/sprint-status.yaml)** | Suivi de sprint BMAD |

---

### /analyst/ - Analyste Business

Documents de specification metier et cas d'utilisation.

| Document | Description |
|----------|-------------|
| **[BUSINESS_RULES.md](analyst/BUSINESS_RULES.md)** | Regles metier et workflows |
| **[USE_CASES.md](analyst/USE_CASES.md)** | Cas d'utilisation (20+ UC) |
| **[REQUIREMENTS_SPECIFICATION.md](analyst/REQUIREMENTS_SPECIFICATION.md)** | Specifications fonctionnelles |

---

### /architect/ - Architecte

Decisions d'architecture et guides techniques.

| Document | Description |
|----------|-------------|
| **[README.md](architect/README.md)** | Vue d'ensemble architecture |
| **[architecture.md](architect/architecture.md)** | Document d'architecture (C4) |
| **[hexagonal-guide.md](architect/hexagonal-guide.md)** | Guide DDD/Architecture Hexagonale |
| **[implementation-status.md](architect/implementation-status.md)** | Statut d'implementation |

#### /architect/adr/ - Architecture Decision Records

| Document | Description |
|----------|-------------|
| **[ADR-001-auth.md](architect/adr/ADR-001-auth.md)** | Decision authentification |
| **[ADR-002-order-statuses.md](architect/adr/ADR-002-order-statuses.md)** | Decision statuts commande |
| **[ADR-003-notifications.md](architect/adr/ADR-003-notifications.md)** | Decision notifications |
| **[ADR-004-uploads.md](architect/adr/ADR-004-uploads.md)** | Decision uploads fichiers |
| **[ADR-005-authentication-strategy.md](architect/adr/ADR-005-authentication-strategy.md)** | Strategie auth detaillee |

---

### /architect-dev/ - Partage Architecte + Developpeur

Contrats API et modele de donnees.

| Document | Description |
|----------|-------------|
| **[API_SPECS.md](architect-dev/API_SPECS.md)** | Specifications API REST |
| **[DATA_MODEL.md](architect-dev/DATA_MODEL.md)** | Schema base de donnees |
| **[SECURITY_GUIDE.md](architect-dev/SECURITY_GUIDE.md)** | Guide securite |

---

### /dev/ - Developpeur

Guides de demarrage, deploiement et depannage.

| Document | Description |
|----------|-------------|
| **[GETTING_STARTED.md](dev/GETTING_STARTED.md)** | Guide de demarrage |
| **[DEPLOYMENT_GUIDE.md](dev/DEPLOYMENT_GUIDE.md)** | Guide de deploiement |
| **[TROUBLESHOOTING.md](dev/TROUBLESHOOTING.md)** | Depannage |
| **[CI_CD_GUIDE.md](dev/CI_CD_GUIDE.md)** | Guide CI/CD |
| **[CI_SECRETS_CHECKLIST.md](dev/CI_SECRETS_CHECKLIST.md)** | Checklist secrets CI |
| **[TECHNICAL_GUIDE.md](dev/TECHNICAL_GUIDE.md)** | Guide technique mobile |
| **[NAVIGATION_SETUP.md](dev/NAVIGATION_SETUP.md)** | Configuration navigation mobile |

---

### /ux-designer/ - Designer UX

Specifications UI et guides de theming.

| Document | Description |
|----------|-------------|
| **[MOBILE_UI_SPECIFICATIONS.md](ux-designer/MOBILE_UI_SPECIFICATIONS.md)** | Specs UI App Mobile |
| **[WEB_UI_SPECIFICATIONS.md](ux-designer/WEB_UI_SPECIFICATIONS.md)** | Specs UI Dashboard Web |
| **[THEMING_GUIDE.md](ux-designer/THEMING_GUIDE.md)** | Guide de theming |

---

### /tea/ - Test Architect

Strategie de tests et plans de tests.

| Document | Description |
|----------|-------------|
| **[TEST_STRATEGY.md](tea/TEST_STRATEGY.md)** | Strategie de tests globale |
| **[TEST_STRATEGY_MOBILE.md](tea/TEST_STRATEGY_MOBILE.md)** | Strategie tests mobile |
| **[TEST-DESIGN.md](tea/TEST-DESIGN.md)** | Conception des tests |
| **[PLAN_TESTS_APP_MOBILE.md](tea/PLAN_TESTS_APP_MOBILE.md)** | Plan tests mobile |
| **[PLAN_TESTS_DASHBOARD_ADMIN.md](tea/PLAN_TESTS_DASHBOARD_ADMIN.md)** | Plan tests admin |
| **[PLAN_TESTS_DASHBOARD_RESTAURANT.md](tea/PLAN_TESTS_DASHBOARD_RESTAURANT.md)** | Plan tests restaurant |

---

### /bmad/ - Documentation BMAD

Guides d'utilisation des workflows BMAD.

| Document | Description |
|----------|-------------|
| **[BMAD_FLOW.md](bmad/BMAD_FLOW.md)** | Flow BMAD et workflows |

---

### /concepts/ - Concepts Futurs

| Document | Description |
|----------|-------------|
| **[AI_MENU_GENERATION.md](concepts/AI_MENU_GENERATION.md)** | Generation IA de menus (post-MVP) |

---

### /archive/ - Archives

Anciens fichiers et documentation historique. Voir [archive/README.md](archive/README.md).

---

## Flux de Creation des Documents

```
PHASE 1: DISCOVERY (Analyst)
    Analyst --> BUSINESS_RULES.md, USE_CASES.md, REQUIREMENTS_SPECIFICATION.md

PHASE 2: DEFINITION (PM + Architect)
    PM       --> prd.md, epics-and-stories.md
    Architect --> architecture.md, ADRs, API_SPECS.md, DATA_MODEL.md

PHASE 3: DESIGN (UX + TEA)
    UX-Designer --> UI_SPECIFICATIONS, THEMING_GUIDE
    TEA         --> TEST_STRATEGY, PLAN_TESTS_*

PHASE 4: IMPLEMENTATION (Dev)
    Dev --> Code + Guides techniques
```

| Phase | Agent | Produit | Consomme |
|-------|-------|---------|----------|
| 1. Discovery | Analyst | BUSINESS_RULES, USE_CASES, REQUIREMENTS | Besoins client |
| 2. Definition | PM | PRD, epics-and-stories | Documents Analyst |
| 2. Definition | Architect | architecture, ADRs, API_SPECS, DATA_MODEL | PRD + Documents Analyst |
| 3. Design | UX-Designer | UI_SPECIFICATIONS, THEMING | PRD + Use Cases |
| 3. Design | TEA | TEST_STRATEGY, PLAN_TESTS | PRD + Architecture + Stories |
| 4. Implementation | Dev | Guides techniques, code | TOUS les documents |

---

## Cas d'Usage

### Je veux comprendre le systeme de commandes

1. **[analyst/USE_CASES.md](analyst/USE_CASES.md)** - UC-004 (Commander), UC-101 (Recevoir)
2. **[analyst/BUSINESS_RULES.md](analyst/BUSINESS_RULES.md)** - Section "Gestion des Commandes"
3. **[architect-dev/DATA_MODEL.md](architect-dev/DATA_MODEL.md)** - Tables `orders` et `order_items`

### Je veux ajouter un endpoint API

1. **[architect-dev/API_SPECS.md](architect-dev/API_SPECS.md)** - Patterns existants
2. **[architect/hexagonal-guide.md](architect/hexagonal-guide.md)** - Structure hexagonale
3. **[analyst/BUSINESS_RULES.md](analyst/BUSINESS_RULES.md)** - Regles a implementer

### Je veux corriger un bug

1. **[BUGS.md](BUGS.md)** - Verifier s'il est repertorie
2. **[dev/TROUBLESHOOTING.md](dev/TROUBLESHOOTING.md)** - Problemes courants

### Je veux deployer l'application

1. **[dev/DEPLOYMENT_GUIDE.md](dev/DEPLOYMENT_GUIDE.md)** - Instructions
2. **[architect-dev/SECURITY_GUIDE.md](architect-dev/SECURITY_GUIDE.md)** - Securite

### Je veux ecrire des tests

1. **[tea/TEST_STRATEGY.md](tea/TEST_STRATEGY.md)** - Strategie globale
2. **[tea/TEST-DESIGN.md](tea/TEST-DESIGN.md)** - Patterns et conventions
3. **[tea/PLAN_TESTS_*.md](tea/)** - Plans specifiques par composant

---

## Conventions

### Style Markdown

- **Format** : GitHub Flavored Markdown
- **Langue** : Francais
- **Titres** : Sans emojis (H1, H2, H3)
- **Listes** : Tirets `-`

### Mise a Jour

| Document | Frequence | Agent |
|----------|-----------|-------|
| ROADMAP.md | Apres chaque session | Tous |
| BUGS.md | Des qu'un bug est decouvert/resolu | Tous |
| API_SPECS.md | A chaque modification API | Architect/Dev |
| DATA_MODEL.md | A chaque migration DB | Architect |

---

## Liens Racine

- **[CLAUDE.md](../CLAUDE.md)** - Instructions pour Claude Code
- **[CONTEXT.md](../CONTEXT.md)** - Contexte projet
- **[README.md](../README.md)** - Documentation racine

---

**Derniere mise a jour** : 2026-01-20
