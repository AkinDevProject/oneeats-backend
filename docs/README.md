# Documentation OneEats

Point d'entrée principal pour la documentation du projet OneEats.

---

## Table des matières

- [Quick Reference](#quick-reference)
- [Demarrage Rapide](#demarrage-rapide)
- [Structure de la Documentation](#structure-de-la-documentation)
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
2. **[business/BUSINESS_RULES.md](business/BUSINESS_RULES.md)** - Regles metier
3. **[architecture/](architecture/)** - Architecture technique

### Pour les Developpeurs

```bash
# 1. Demarrer PostgreSQL
docker-compose -f docker-compose.dev.yml up -d

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

## Structure de la Documentation

### Fichiers Racine

| Fichier | Description |
|---------|-------------|
| **[ROADMAP.md](ROADMAP.md)** | Progression projet, taches en cours |
| **[BUGS.md](BUGS.md)** | Bugs connus et suivi |

### /architecture/ - Architecture Technique

| Document | Description |
|----------|-------------|
| **[README.md](architecture/README.md)** | Vue d'ensemble architecture |
| **[hexagonal-guide.md](architecture/hexagonal-guide.md)** | Guide DDD/Architecture Hexagonale |
| **[target-architecture.md](architecture/target-architecture.md)** | Architecture cible (C4) |
| **[implementation-status.md](architecture/implementation-status.md)** | Statut d'implementation |

### /api/ - Specifications API

| Document | Description |
|----------|-------------|
| **[API_SPECS.md](api/API_SPECS.md)** | Endpoints API REST |
| **[DATA_MODEL.md](api/DATA_MODEL.md)** | Schema base de donnees |

### /business/ - Specifications Metier

| Document | Description |
|----------|-------------|
| **[BUSINESS_RULES.md](business/BUSINESS_RULES.md)** | Regles metier et workflows |
| **[USE_CASES.md](business/USE_CASES.md)** | Cas d'utilisation |
| **[REQUIREMENTS_SPECIFICATION.md](business/REQUIREMENTS_SPECIFICATION.md)** | Specifications fonctionnelles |
| **[WEB_UI_SPECIFICATIONS.md](business/WEB_UI_SPECIFICATIONS.md)** | Specs UI Dashboard Web |
| **[MOBILE_UI_SPECIFICATIONS.md](business/MOBILE_UI_SPECIFICATIONS.md)** | Specs UI App Mobile |

### /guides/ - Guides Techniques

| Document | Description |
|----------|-------------|
| **[GETTING_STARTED.md](guides/GETTING_STARTED.md)** | Guide de demarrage |
| **[DEPLOYMENT_GUIDE.md](guides/DEPLOYMENT_GUIDE.md)** | Guide de deploiement |
| **[SECURITY_GUIDE.md](guides/SECURITY_GUIDE.md)** | Guide securite |
| **[TROUBLESHOOTING.md](guides/TROUBLESHOOTING.md)** | Depannage |

### /mobile/ - Documentation Mobile

| Document | Description |
|----------|-------------|
| **[TECHNICAL_GUIDE.md](mobile/TECHNICAL_GUIDE.md)** | Guide technique mobile |
| **[NAVIGATION_SETUP.md](mobile/NAVIGATION_SETUP.md)** | Configuration navigation |
| **[THEMING_GUIDE.md](mobile/THEMING_GUIDE.md)** | Guide de theme |

### /tests/ - Documentation Tests

| Document | Description |
|----------|-------------|
| **[TEST_STRATEGY.md](tests/TEST_STRATEGY.md)** | Strategie de tests globale |
| **[TEST-DESIGN.md](tests/TEST-DESIGN.md)** | Conception des tests |
| **[PLAN_TESTS_APP_MOBILE.md](tests/PLAN_TESTS_APP_MOBILE.md)** | Plan tests mobile |
| **[PLAN_TESTS_DASHBOARD_ADMIN.md](tests/PLAN_TESTS_DASHBOARD_ADMIN.md)** | Plan tests admin |
| **[PLAN_TESTS_DASHBOARD_RESTAURANT.md](tests/PLAN_TESTS_DASHBOARD_RESTAURANT.md)** | Plan tests restaurant |

### /product/ - Planification Produit

| Document | Description |
|----------|-------------|
| **[PRD-oneeats-backend.md](product/PRD-oneeats-backend.md)** | Product Requirements Document |
| **[EPICS-USER-STORIES.md](product/EPICS-USER-STORIES.md)** | Epics et User Stories |
| **[sprint-plan.md](product/sprint-plan.md)** | Plan de sprint |

### /adr/ - Architecture Decision Records

| Document | Description |
|----------|-------------|
| **[ADR-001-auth.md](adr/ADR-001-auth.md)** | Decision authentification |
| **[ADR-002-order-statuses.md](adr/ADR-002-order-statuses.md)** | Decision statuts commande |
| **[ADR-003-notifications.md](adr/ADR-003-notifications.md)** | Decision notifications |
| **[ADR-004-uploads.md](adr/ADR-004-uploads.md)** | Decision uploads fichiers |

### /concepts/ - Concepts Futurs

| Document | Description |
|----------|-------------|
| **[AI_MENU_GENERATION.md](concepts/AI_MENU_GENERATION.md)** | Generation IA de menus |

### /archive/ - Archives

Anciens fichiers et documentation historique.

---

## Cas d'Usage

### Je veux comprendre le systeme de commandes

1. **[business/USE_CASES.md](business/USE_CASES.md)** - UC-004 (Commander), UC-101 (Recevoir)
2. **[business/BUSINESS_RULES.md](business/BUSINESS_RULES.md)** - Section "Gestion des Commandes"
3. **[api/DATA_MODEL.md](api/DATA_MODEL.md)** - Tables `orders` et `order_items`

### Je veux ajouter un endpoint API

1. **[api/API_SPECS.md](api/API_SPECS.md)** - Patterns existants
2. **[architecture/hexagonal-guide.md](architecture/hexagonal-guide.md)** - Structure hexagonale
3. **[business/BUSINESS_RULES.md](business/BUSINESS_RULES.md)** - Regles a implementer

### Je veux corriger un bug

1. **[BUGS.md](BUGS.md)** - Verifier s'il est repertorie
2. **[guides/TROUBLESHOOTING.md](guides/TROUBLESHOOTING.md)** - Problemes courants

### Je veux deployer l'application

1. **[guides/DEPLOYMENT_GUIDE.md](guides/DEPLOYMENT_GUIDE.md)** - Instructions
2. **[guides/SECURITY_GUIDE.md](guides/SECURITY_GUIDE.md)** - Securite

---

## Conventions

### Style Markdown

- **Format** : GitHub Flavored Markdown
- **Langue** : Francais
- **Titres** : Sans emojis (H1, H2, H3)
- **Listes** : Tirets `-`

### Mise a Jour

| Document | Frequence |
|----------|-----------|
| ROADMAP.md | Apres chaque session |
| BUGS.md | Des qu'un bug est decouvert/resolu |
| API_SPECS.md | A chaque modification API |
| DATA_MODEL.md | A chaque migration DB |

---

## Liens Racine

- **[CLAUDE.md](../CLAUDE.md)** - Instructions pour Claude Code
- **[CONTEXT.md](../CONTEXT.md)** - Contexte projet
- **[README.md](../README.md)** - Documentation racine

---

**Derniere mise a jour** : 2026-01-14
