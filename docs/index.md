# OneEats - Documentation Index

> 📚 Point d'entrée principal pour la documentation du projet
> Généré par BMAD Document-Project Workflow | 2026-01-14

---

## 🎯 Quick Reference

| Attribut | Valeur |
|----------|--------|
| **Projet** | OneEats - Plateforme Click & Collect |
| **Type** | Monorepo Multi-Part (3 parties) |
| **Backend** | Java 21 / Quarkus 3.24.2 |
| **Web** | React 18 / TypeScript / Vite |
| **Mobile** | React Native 0.81 / Expo 54 |
| **Architecture** | Hexagonale (DDD) |
| **Database** | PostgreSQL |
| **Auth** | Keycloak (OIDC) |

---

## 📋 Documentation Générée (BMAD)

| Document | Description |
|----------|-------------|
| **[Project Overview](./project-overview.md)** | Vue d'ensemble complète du projet |
| **[Source Tree Analysis](./source-tree-analysis.md)** | Structure du code source annotée |

---

## 📚 Documentation Existante

### 🏗️ Architecture & Design

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Architecture système globale |
| [ARCHITECTURE_HEXAGONALE.md](./ARCHITECTURE_HEXAGONALE.md) | Détails architecture hexagonale/DDD |
| [DATA_MODEL.md](./DATA_MODEL.md) | Modèle de données et schéma DB |

### 📝 Spécifications

| Document | Description |
|----------|-------------|
| [API_SPECS.md](./API_SPECS.md) | Spécifications des endpoints API |
| [BUSINESS_RULES.md](./BUSINESS_RULES.md) | Règles métier et workflows |
| [USE_CASES.md](./USE_CASES.md) | Cas d'utilisation détaillés |

### 📱 Frontend Specifications

| Document | Description |
|----------|-------------|
| [business/WEB_UI_SPECIFICATIONS.md](./business/WEB_UI_SPECIFICATIONS.md) | Specs UI Dashboard Web |
| [business/MOBILE_UI_SPECIFICATIONS.md](./business/MOBILE_UI_SPECIFICATIONS.md) | Specs UI App Mobile |
| [business/REQUIREMENTS_SPECIFICATION.md](./business/REQUIREMENTS_SPECIFICATION.md) | Spécifications fonctionnelles |

### 📖 Guides

| Document | Description |
|----------|-------------|
| [guides/GETTING_STARTED.md](./guides/GETTING_STARTED.md) | Guide de démarrage |
| [guides/DEPLOYMENT_GUIDE.md](./guides/DEPLOYMENT_GUIDE.md) | Guide de déploiement |
| [guides/SECURITY_GUIDE.md](./guides/SECURITY_GUIDE.md) | Guide sécurité |
| [guides/TROUBLESHOOTING.md](./guides/TROUBLESHOOTING.md) | Dépannage |

### 📱 Mobile

| Document | Description |
|----------|-------------|
| [mobile/TECHNICAL_GUIDE.md](./mobile/TECHNICAL_GUIDE.md) | Guide technique mobile |
| [mobile/NAVIGATION_SETUP.md](./mobile/NAVIGATION_SETUP.md) | Configuration navigation |
| [mobile/THEMING_GUIDE.md](./mobile/THEMING_GUIDE.md) | Guide de thème |

### 🧪 Tests

| Document | Description |
|----------|-------------|
| [TEST_STRATEGY.md](./TEST_STRATEGY.md) | Stratégie de tests globale |
| [tests/PLAN_TESTS_APP_MOBILE.md](./tests/PLAN_TESTS_APP_MOBILE.md) | Plan tests mobile |
| [tests/PLAN_TESTS_DASHBOARD_ADMIN.md](./tests/PLAN_TESTS_DASHBOARD_ADMIN.md) | Plan tests dashboard admin |
| [tests/PLAN_TESTS_DASHBOARD_RESTAURANT.md](./tests/PLAN_TESTS_DASHBOARD_RESTAURANT.md) | Plan tests dashboard restaurant |

### 🗺️ Planification

| Document | Description |
|----------|-------------|
| [ROADMAP.md](./ROADMAP.md) | Feuille de route |
| [BUGS.md](./BUGS.md) | Bugs connus et suivi |

### 💡 Concepts

| Document | Description |
|----------|-------------|
| [concepts/AI_MENU_GENERATION.md](./concepts/AI_MENU_GENERATION.md) | Concept génération IA de menus |

---

## 🚀 Démarrage Rapide

### Backend (Quarkus)

```bash
# Démarrer PostgreSQL
docker-compose -f docker-compose.dev.yml up -d

# Lancer le backend via IntelliJ IDEA (Quarkus dev mode)
# ⚠️ ./mvnw n'est pas disponible en CLI
```

### Mobile (Expo)

```bash
cd apps/mobile
npm install
npm start
```

### URLs de Développement

| Service | URL |
|---------|-----|
| Backend API | http://localhost:8080/api |
| Dashboard Web | http://localhost:8080/restaurant |
| Health Check | http://localhost:8080/q/health |
| Metrics | http://localhost:8080/q/metrics |

---

## 📊 Métriques du Projet

| Catégorie | Quantité |
|-----------|----------|
| **Domaines Métier** | 9 (user, restaurant, menu, order, admin, notification, security, analytics, favorite) |
| **API Controllers** | 12 |
| **Domain Models** | 24 |
| **Repositories** | 19 |
| **DTOs** | 19 |
| **Web Components** | 22 |
| **Web Pages** | 22 |
| **Mobile Screens** | 16 |
| **Unit Tests** | 16 |
| **Documentation Files** | 32+ |

---

## 🔗 Liens Utiles

- **CLAUDE.md** - Instructions pour Claude Code
- **CONTEXT.md** - Contexte complet du projet
- **README.md** - Documentation racine

---

## 📁 Structure des Parties

### Backend (`/`)
```
src/main/java/com/oneeats/
├── user/           # Gestion utilisateurs
├── restaurant/     # Gestion restaurants
├── menu/           # Gestion menus
├── order/          # Gestion commandes
├── admin/          # Administration
├── notification/   # Notifications
├── security/       # Auth & Sessions
├── analytics/      # Statistiques
├── favorite/       # Favoris
└── shared/         # Code partagé
```

### Web Dashboard (`apps/web/`)
```
src/
├── components/     # UI Components
├── pages/
│   ├── admin/      # Dashboard admin
│   └── restaurant/ # Dashboard restaurant
├── services/       # API calls
└── hooks/          # Custom hooks
```

### Mobile App (`apps/mobile/`)
```
app/
├── (tabs)/         # Navigation principale
├── auth/           # Authentification
├── restaurant/     # Détail restaurant
├── menu/           # Détail menu
└── order/          # Suivi commande
```

---

## 🎯 Pour les Agents IA

Quand vous travaillez sur ce projet:

1. **Nouvelle fonctionnalité backend** → Référez-vous à [ARCHITECTURE_HEXAGONALE.md](./ARCHITECTURE_HEXAGONALE.md)
2. **API endpoints** → Référez-vous à [API_SPECS.md](./API_SPECS.md)
3. **Règles métier** → Référez-vous à [BUSINESS_RULES.md](./BUSINESS_RULES.md)
4. **UI/UX** → Référez-vous aux specs dans `business/`
5. **Bugs connus** → Vérifiez [BUGS.md](./BUGS.md)

---

*Généré par BMAD Document-Project Workflow v1.2.0*
