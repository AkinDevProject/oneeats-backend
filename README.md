# OneEats - Plateforme de Commande Alimentaire

**OneEats** est une plateforme moderne de commande de plats à récupérer sur place (pas de livraison dans le MVP), construite avec une architecture monolithique modulaire suivant les principes du Domain-Driven Design.

---

## Table des matières

- [Démarrage Rapide](#démarrage-rapide)
- [Documentation Complète](#documentation-complète)
- [Architecture du Projet](#architecture-du-projet)
- [Status Projet](#status-projet)
- [Bugs Critiques Connus](#bugs-critiques-connus)
- [Stack Technique](#stack-technique)
- [Contraintes Environnement](#contraintes-environnement-important)
- [Support et Contribution](#support--contribution)
- [Liens Rapides](#liens-rapides)

---

## Démarrage Rapide

### Pour Claude Code

**Commence TOUJOURS par lire ces fichiers dans cet ordre :**

1. **[CLAUDE.md](CLAUDE.md)** ⭐ - Configuration et workflow pour Claude Code
2. **[docs/ROADMAP.md](docs/ROADMAP.md)** 📍 - Tâche en cours et progression
3. **[CONTEXT.md](CONTEXT.md)** 📋 - Contexte complet du projet
4. **[docs/README.md](docs/README.md)** 📚 - Guide de navigation dans toute la documentation

### Pour les Développeurs

```bash
# 1. Démarrer la base de données PostgreSQL
docker-compose up -d

# 2. Démarrer le backend (depuis IntelliJ IDEA)
# ⚠️ Important : Lancer Quarkus dev depuis IntelliJ (pas de ./mvnw en CLI)
# → Backend API: http://localhost:8080/api
# → Dashboard Web: http://localhost:8080/restaurant (via Quinoa)

# 3. Démarrer l'app mobile (optionnel)
cd apps/mobile && npm start
```

**📖 Guide complet** : [docs/guides/GETTING_STARTED.md](docs/guides/GETTING_STARTED.md)

---

## Documentation Complète

### Point d'Entrée Documentation

**➡️ [docs/README.md](docs/README.md)** - **COMMENCER ICI** pour naviguer dans toute la documentation

### Documents Essentiels (les 7 piliers)

| Document | Description | Audience |
|----------|-------------|----------|
| **[ROADMAP.md](docs/ROADMAP.md)** | 📍 **Tâche en cours** et progression projet | Tous (commencer ici chaque session) |
| **[BUSINESS_RULES.md](docs/BUSINESS_RULES.md)** | Règles métier, workflows, validations | Product + Dev |
| **[USE_CASES.md](docs/USE_CASES.md)** | 19 scénarios utilisateur détaillés (Mobile, Web, Admin) | Product + Dev |
| **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** | Vue d'ensemble architecture technique | Dev + Tech Lead |
| **[API_SPECS.md](docs/API_SPECS.md)** | Spécifications des APIs REST | Dev Frontend + Backend |
| **[DATA_MODEL.md](docs/DATA_MODEL.md)** | Schéma base de données, relations | Dev Backend + Data |
| **[BUGS.md](docs/BUGS.md)** | Bugs connus, solutions, workarounds | Tous |

### Documentation par Catégorie

#### Architecture et Design

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Vue d'ensemble de l'architecture
- **[ARCHITECTURE_HEXAGONALE.md](docs/ARCHITECTURE_HEXAGONALE.md)** - Guide détaillé DDD/Architecture Hexagonale
- **[BUSINESS_RULES.md](docs/BUSINESS_RULES.md)** - Règles métier et workflows
- **[DATA_MODEL.md](docs/DATA_MODEL.md)** - Modèle de données complet

#### APIs et Intégration

- **[API_SPECS.md](docs/API_SPECS.md)** - Documentation complète des endpoints
- **[apps/web/src/README.md](apps/web/src/README.md)** - Structure code frontend web
- **[apps/web/src/pages/restaurant/designs/README.md](apps/web/src/pages/restaurant/designs/README.md)** - Variantes design UI

#### Tests et Qualité

- **[tests/README.md](tests/README.md)** - Guide tests E2E (Playwright)
- **[tests/COVERAGE_ANALYSIS.md](tests/COVERAGE_ANALYSIS.md)** - Analyse couverture de code
- **[tests/WEB-TESTS.md](tests/WEB-TESTS.md)** - Tests spécifiques web
- **[src/test/java/com/oneeats/README.md](src/test/java/com/oneeats/README.md)** - Guide tests Java

#### Guides Techniques

- **[guides/GETTING_STARTED.md](docs/guides/GETTING_STARTED.md)** - Setup et démarrage
- **[guides/DEPLOYMENT_GUIDE.md](docs/guides/DEPLOYMENT_GUIDE.md)** - Déploiement production
- **[guides/SECURITY_GUIDE.md](docs/guides/SECURITY_GUIDE.md)** - Bonnes pratiques sécurité
- **[guides/TROUBLESHOOTING.md](docs/guides/TROUBLESHOOTING.md)** - Résolution de problèmes

#### Mobile et UX

- **[mobile/TECHNICAL_GUIDE.md](docs/mobile/TECHNICAL_GUIDE.md)** - Guide technique app mobile
- **[mobile/THEMING_GUIDE.md](docs/mobile/THEMING_GUIDE.md)** - Système de thèmes
- **[mobile/NAVIGATION_SETUP.md](docs/mobile/NAVIGATION_SETUP.md)** - Configuration navigation

#### Spécifications Métier

- **[business/REQUIREMENTS_SPECIFICATION.md](docs/business/REQUIREMENTS_SPECIFICATION.md)** - Cahier des charges
- **[business/MOBILE_UI_SPECIFICATIONS.md](docs/business/MOBILE_UI_SPECIFICATIONS.md)** - Specs UX/UI mobile
- **[business/WEB_UI_SPECIFICATIONS.md](docs/business/WEB_UI_SPECIFICATIONS.md)** - Specs UX/UI web

---

## Architecture du Projet

```
OneEats (Monolithe Modulaire)
├── Backend          → Java Quarkus 3.24.2 + PostgreSQL
│                      Architecture Hexagonale + DDD
├── Dashboard Web    → React + TypeScript + Vite
│                      (servi via Quinoa depuis backend)
└── App Mobile       → React Native + Expo
```

**Domaines implémentés** : User, Restaurant, Menu, Order
**Architecture détaillée** : [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## Status Projet

| Composant | Progression | Status |
|-----------|-------------|--------|
| **Backend APIs** | ✅ 95% | User, Restaurant, Menu, Order complets |
| **Web Dashboard** | ⚠️ 90% | Interface complète, intégration API en cours |
| **Mobile App** | ⚠️ 95% | Fonctionnalités avancées, intégration API en cours |
| **Auth JWT** | ❌ 30% | Documenté, pas implémenté |
| **Tests** | ⚠️ 70% | Unit tests OK, intégration partielle |

**Détails** : [docs/ROADMAP.md](docs/ROADMAP.md) - Section "Status Projet"

---

## Bugs Critiques Connus

| ID | Description | Priorité | Docs |
|----|-------------|----------|------|
| BUG-001 | Frontends utilisent mock data (pas connectés aux APIs) | 🔴 Critique | [BUGS.md](docs/BUGS.md) |
| BUG-002 | Authentification JWT non implémentée | 🔴 Critique | [BUGS.md](docs/BUGS.md) |

**Liste complète** : [docs/BUGS.md](docs/BUGS.md)

---

## Stack Technique

### Backend
- **Framework** : Quarkus 3.24.2 (Java 21)
- **Architecture** : Hexagonale + DDD + CQRS + Event Sourcing
- **Base de données** : PostgreSQL 15
- **ORM** : Hibernate + PanacheRepository
- **API** : REST avec Jackson
- **Sécurité** : Keycloak OIDC (configuré, pas implémenté)
- **Tests** : JUnit 5 + RestAssured

### Web
- **Framework** : React 18 + TypeScript
- **Build** : Vite 5.4
- **Styling** : Tailwind CSS
- **Routing** : React Router 7
- **Charts** : Recharts

### Mobile
- **Framework** : React Native + Expo 53
- **Navigation** : Expo Router 5
- **State** : TanStack Query + AsyncStorage
- **UI** : React Native Paper
- **Animations** : Reanimated

### Infrastructure
- **Containerisation** : Docker + Docker Compose
- **Base de données dev** : PostgreSQL + PgAdmin (Docker)
- **Tests E2E** : Playwright
- **CI/CD** : À configurer

---

## Contraintes Environnement (Important)

Ce projet a des contraintes spécifiques de développement :

- ✅ **Backend** : Doit être lancé depuis **IntelliJ IDEA** (Quarkus dev mode)
- ❌ **Pas de ./mvnw** en ligne de commande (pas de JDK dans le terminal)
- ✅ **Frontend Web** : Servi automatiquement via Quinoa depuis le backend (port 8080)
- ✅ **Mobile** : Expo CLI disponible normalement
- ✅ **Database** : Docker Compose disponible

**Détails complets** : [CONTEXT.md](CONTEXT.md) - Section "Architecture de Développement"

---

## Support et Contribution

### Pour rapporter un bug
1. Vérifier [docs/BUGS.md](docs/BUGS.md) si c'est un bug connu
2. Consulter [docs/guides/TROUBLESHOOTING.md](docs/guides/TROUBLESHOOTING.md)
3. Ajouter le bug dans [docs/BUGS.md](docs/BUGS.md) avec le template fourni

### Pour contribuer
1. Lire [CONTEXT.md](CONTEXT.md) pour comprendre l'architecture
2. Suivre les patterns du domaine `Order` (implémentation de référence)
3. Consulter [docs/ROADMAP.md](docs/ROADMAP.md) pour les tâches en cours
4. Mettre à jour la documentation après chaque changement majeur

---

## Dernière Mise à Jour

**Date** : 2025-12-12
**Version** : MVP 0.7
**Status** : Documentation restructurée, prêt pour Sprint 1 (Intégration APIs)
**Prochaine étape** : Connecter frontends aux APIs backend (voir [ROADMAP.md](docs/ROADMAP.md))

---

## Liens Rapides

| Type | Lien | Description |
|------|------|-------------|
| 🤖 Claude Code | [CLAUDE.md](CLAUDE.md) | Configuration et workflow Claude Code |
| 📖 Contexte | [CONTEXT.md](CONTEXT.md) | Contexte complet du projet |
| 📚 Docs | [docs/README.md](docs/README.md) | Guide navigation documentation |
| 📍 Roadmap | [docs/ROADMAP.md](docs/ROADMAP.md) | Progression et tâches |
| 🏗️ Architecture | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Architecture technique |
| 🐛 Bugs | [docs/BUGS.md](docs/BUGS.md) | Problèmes connus |

---

**Astuce** : Si tu es perdu, commence toujours par **[docs/README.md](docs/README.md)** qui te guidera vers la bonne documentation.
