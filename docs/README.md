# Documentation OneEats

Point d'entree principal pour la documentation du projet OneEats.
Organisation hybride: **par plateforme** (shared/backend/mobile/web) et **par agent BMAD**.

---

## Table des matieres

- [Quick Reference](#quick-reference)
- [Demarrage Rapide](#demarrage-rapide)
- [Structure de la Documentation](#structure-de-la-documentation)
- [Flux de Creation des Documents](#flux-de-creation-des-documents)
- [Cas d'Usage](#cas-dusage)

---

## Quick Reference

| Attribut | Valeur |
|----------|--------|
| **Projet** | OneEats - Plateforme Click & Collect |
| **Type** | Monorepo (Backend + Mobile + Web) |
| **Backend** | Java 21 / Quarkus 3.24.2 |
| **Web** | React 18 / TypeScript / Vite |
| **Mobile** | React Native / Expo |
| **Architecture** | Hexagonale (DDD) |
| **Database** | PostgreSQL |

---

## Demarrage Rapide

### Pour Claude Code

1. **[ROADMAP.md](ROADMAP.md)** - Tache en cours
2. **[shared/analyst/BUSINESS_RULES.md](shared/analyst/BUSINESS_RULES.md)** - Regles metier
3. **[shared/architect/](shared/architect/)** - Architecture technique

### URLs de Developpement

| Service | URL |
|---------|-----|
| Backend API | http://localhost:8080/api |
| Dashboard Web | http://localhost:8080/restaurant |
| Health Check | http://localhost:8080/q/health |

---

## Structure de la Documentation

```
docs/
├── README.md                 # Cet index
├── ROADMAP.md                # Progression projet
├── BUGS.md                   # Bugs connus
│
├── shared/                   # Documents PARTAGES (toutes plateformes)
│   ├── pm/                   # Product Manager
│   ├── analyst/              # Analyste Business
│   ├── architect/            # Architecte (+ adr/)
│   ├── architect-dev/        # Partage Arch+Dev
│   ├── tea/                  # Tests partages
│   ├── bmad/                 # Workflows BMAD
│   └── concepts/             # Concepts futurs
│
├── backend/                  # Documentation BACKEND (Java/Quarkus)
│   └── dev/                  # Guides developpeur backend
│
├── mobile/                   # Documentation MOBILE (React Native/Expo)
│   ├── dev/                  # Guides developpeur mobile
│   ├── ux-designer/          # Specs UI mobile
│   └── tea/                  # Tests mobile
│
├── web/                      # Documentation WEB (React/Vite)
│   ├── ux-designer/          # Specs UI web
│   └── tea/                  # Tests web
│
└── archive/                  # Documents archives
```

---

## Documents par Section

### Fichiers Racine

| Fichier | Description |
|---------|-------------|
| **[ROADMAP.md](ROADMAP.md)** | Progression projet, taches en cours |
| **[BUGS.md](BUGS.md)** | Bugs connus et suivi |
| **[project-overview.md](project-overview.md)** | Vue d'ensemble du projet (genere) |
| **[source-tree-analysis.md](source-tree-analysis.md)** | Analyse arbre source (genere) |

### Documentation Generee (BMAD document-project)

| Fichier | Description |
|---------|-------------|
| **[project-overview.md](project-overview.md)** | Resume executif, stack tech, statistiques |
| **[source-tree-analysis.md](source-tree-analysis.md)** | Structure complete du monorepo |
| **[project-scan-report.json](project-scan-report.json)** | Etat du workflow de scan |

---

### /shared/ - Documents Partages

Documents communs a toutes les plateformes (business, architecture, API).

#### shared/pm/ - Product Manager

| Document | Description |
|----------|-------------|
| **[prd.md](shared/pm/prd.md)** | Product Requirements Document |
| **[epics-and-stories.md](shared/pm/epics-and-stories.md)** | Epics et User Stories |
| **[USER_STORIES.md](shared/pm/USER_STORIES.md)** | Stories utilisateur |
| **[sprint-status.yaml](shared/pm/sprint-status.yaml)** | Suivi sprint BMAD |

#### shared/analyst/ - Analyste Business

| Document | Description |
|----------|-------------|
| **[BUSINESS_RULES.md](shared/analyst/BUSINESS_RULES.md)** | Regles metier |
| **[USE_CASES.md](shared/analyst/USE_CASES.md)** | Cas d'utilisation |
| **[REQUIREMENTS_SPECIFICATION.md](shared/analyst/REQUIREMENTS_SPECIFICATION.md)** | Specifications |

#### shared/architect/ - Architecte

| Document | Description |
|----------|-------------|
| **[architecture.md](shared/architect/architecture.md)** | Architecture globale (C4) |
| **[hexagonal-guide.md](shared/architect/hexagonal-guide.md)** | Guide DDD/Hexagonal |
| **[implementation-status.md](shared/architect/implementation-status.md)** | Statut implementation |
| **[adr/](shared/architect/adr/)** | Architecture Decision Records (5 ADRs) |

#### shared/architect-dev/ - Partage Architecte + Dev

| Document | Description |
|----------|-------------|
| **[API_SPECS.md](shared/architect-dev/API_SPECS.md)** | Specifications API REST |
| **[DATA_MODEL.md](shared/architect-dev/DATA_MODEL.md)** | Schema base de donnees |
| **[SECURITY_GUIDE.md](shared/architect-dev/SECURITY_GUIDE.md)** | Guide securite |

#### shared/tea/ - Tests Partages

| Document | Description |
|----------|-------------|
| **[TEST_STRATEGY.md](shared/tea/TEST_STRATEGY.md)** | Strategie de tests globale |
| **[TEST-DESIGN.md](shared/tea/TEST-DESIGN.md)** | Conception des tests |
| **[TESTING_INFRASTRUCTURE.md](shared/tea/TESTING_INFRASTRUCTURE.md)** | Infrastructure technique (Playwright, Maestro, MCP) |
| **[TESTING_GUIDE.md](shared/tea/TESTING_GUIDE.md)** | Guide d'utilisation des tests |

#### shared/bmad/ - BMAD

| Document | Description |
|----------|-------------|
| **[BMAD_FLOW.md](shared/bmad/BMAD_FLOW.md)** | Flow et workflows BMAD |

#### shared/concepts/ - Concepts Futurs

| Document | Description |
|----------|-------------|
| **[AI_MENU_GENERATION.md](shared/concepts/AI_MENU_GENERATION.md)** | Generation IA de menus |

---

### /backend/ - Backend Java/Quarkus

Documentation specifique au backend.

#### backend/dev/ - Developpeur Backend

| Document | Description |
|----------|-------------|
| **[GETTING_STARTED.md](backend/dev/GETTING_STARTED.md)** | Guide de demarrage |
| **[DEPLOYMENT_GUIDE.md](backend/dev/DEPLOYMENT_GUIDE.md)** | Guide deploiement |
| **[CI_CD_GUIDE.md](backend/dev/CI_CD_GUIDE.md)** | Guide CI/CD |
| **[CI_SECRETS_CHECKLIST.md](backend/dev/CI_SECRETS_CHECKLIST.md)** | Checklist secrets |
| **[TROUBLESHOOTING.md](backend/dev/TROUBLESHOOTING.md)** | Depannage |

---

### /mobile/ - App Mobile React Native/Expo

Documentation specifique a l'application mobile.

#### mobile/dev/ - Developpeur Mobile

| Document | Description |
|----------|-------------|
| **[TECHNICAL_GUIDE.md](mobile/dev/TECHNICAL_GUIDE.md)** | Guide technique mobile |
| **[NAVIGATION_SETUP.md](mobile/dev/NAVIGATION_SETUP.md)** | Configuration navigation |

#### mobile/ux-designer/ - UX Mobile

| Document | Description |
|----------|-------------|
| **[MOBILE_UI_SPECIFICATIONS.md](mobile/ux-designer/MOBILE_UI_SPECIFICATIONS.md)** | Specs UI mobile |
| **[THEMING_GUIDE.md](mobile/ux-designer/THEMING_GUIDE.md)** | Guide theming |

#### mobile/tea/ - Tests Mobile

| Document | Description |
|----------|-------------|
| **[TEST_STRATEGY_MOBILE.md](mobile/tea/TEST_STRATEGY_MOBILE.md)** | Strategie tests mobile |
| **[PLAN_TESTS_APP_MOBILE.md](mobile/tea/PLAN_TESTS_APP_MOBILE.md)** | Plan tests mobile |

---

### /web/ - Dashboard Web React/Vite

Documentation specifique aux dashboards web (restaurant et admin).

#### web/ux-designer/ - UX Web

| Document | Description |
|----------|-------------|
| **[WEB_UI_SPECIFICATIONS.md](web/ux-designer/WEB_UI_SPECIFICATIONS.md)** | Specs UI web |

#### web/tea/ - Tests Web

| Document | Description |
|----------|-------------|
| **[PLAN_TESTS_DASHBOARD_ADMIN.md](web/tea/PLAN_TESTS_DASHBOARD_ADMIN.md)** | Plan tests admin |
| **[PLAN_TESTS_DASHBOARD_RESTAURANT.md](web/tea/PLAN_TESTS_DASHBOARD_RESTAURANT.md)** | Plan tests restaurant |

---

## Flux de Creation des Documents

```
PHASE 1: DISCOVERY (shared/)
    Analyst --> BUSINESS_RULES, USE_CASES, REQUIREMENTS

PHASE 2: DEFINITION (shared/)
    PM       --> PRD, epics-and-stories
    Architect --> architecture, ADRs, API_SPECS, DATA_MODEL

PHASE 3: DESIGN (par plateforme)
    Mobile UX  --> mobile/ux-designer/*
    Web UX     --> web/ux-designer/*
    TEA        --> shared/tea/* + mobile/tea/* + web/tea/*

PHASE 4: IMPLEMENTATION (par plateforme)
    Backend Dev --> backend/dev/*
    Mobile Dev  --> mobile/dev/*
    Web Dev     --> web/dev/* (si necessaire)
```

---

## Cas d'Usage

### Je travaille sur le BACKEND

1. **[backend/dev/GETTING_STARTED.md](backend/dev/GETTING_STARTED.md)** - Setup
2. **[shared/architect-dev/API_SPECS.md](shared/architect-dev/API_SPECS.md)** - API
3. **[shared/architect/hexagonal-guide.md](shared/architect/hexagonal-guide.md)** - Architecture

### Je travaille sur le MOBILE

1. **[mobile/dev/TECHNICAL_GUIDE.md](mobile/dev/TECHNICAL_GUIDE.md)** - Guide technique
2. **[mobile/ux-designer/MOBILE_UI_SPECIFICATIONS.md](mobile/ux-designer/MOBILE_UI_SPECIFICATIONS.md)** - UI
3. **[shared/analyst/USE_CASES.md](shared/analyst/USE_CASES.md)** - Use cases client

### Je travaille sur le WEB

1. **[web/ux-designer/WEB_UI_SPECIFICATIONS.md](web/ux-designer/WEB_UI_SPECIFICATIONS.md)** - UI
2. **[shared/analyst/USE_CASES.md](shared/analyst/USE_CASES.md)** - Use cases restaurant/admin
3. **[shared/architect-dev/API_SPECS.md](shared/architect-dev/API_SPECS.md)** - API

### Je veux comprendre le BUSINESS

1. **[shared/analyst/BUSINESS_RULES.md](shared/analyst/BUSINESS_RULES.md)** - Regles
2. **[shared/analyst/USE_CASES.md](shared/analyst/USE_CASES.md)** - Use cases
3. **[shared/pm/prd.md](shared/pm/prd.md)** - PRD

---

## Liens Racine

- **[CLAUDE.md](../CLAUDE.md)** - Instructions pour Claude Code
- **[CONTEXT.md](../CONTEXT.md)** - Contexte projet

---

### Documentation UAT (User Acceptance Testing)

| Fichier | Description |
|---------|-------------|
| **[UAT_SETUP.md](UAT_SETUP.md)** | Configuration de l'environnement UAT |
| **[UAT_GUIDE_RESTAURANT.md](UAT_GUIDE_RESTAURANT.md)** | Guide UAT dashboard restaurant |
| **[UAT_GUIDE_ADMIN.md](UAT_GUIDE_ADMIN.md)** | Guide UAT dashboard admin |
| **[UAT_GUIDE_MOBILE.md](UAT_GUIDE_MOBILE.md)** | Guide UAT application mobile |
| **[reports/UAT_REPORT_2026-01-20.md](reports/UAT_REPORT_2026-01-20.md)** | Rapport UAT du 2026-01-20 |

---

**Derniere mise a jour** : 2026-01-21
