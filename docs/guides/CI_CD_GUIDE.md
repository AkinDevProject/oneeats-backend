# Guide CI/CD OneEats

Ce document décrit la pipeline CI/CD du projet OneEats.

## Vue d'ensemble

La pipeline CI/CD est configurée avec GitHub Actions et comprend les stages suivants :

```
┌──────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  BUILD       │    │  TESTS          │    │  VALIDATION     │
│  & LINT      │ -> │  UNITAIRES      │ -> │  INTEGRATION    │
│  (parallèle) │    │  (parallèle)    │    │  + BURN-IN      │
└──────────────┘    └─────────────────┘    └─────────────────┘
       │                    │                       │
       ▼                    ▼                       ▼
  ┌─────────┐         ┌─────────┐            ┌─────────┐
  │Backend  │         │Backend  │            │Integration│
  │Web App  │         │Mobile   │            │Burn-in   │
  │Mobile   │         │         │            │E2E Mobile│
  └─────────┘         └─────────┘            └─────────┘
```

## Déclencheurs

| Événement | Branches | Actions |
|-----------|----------|---------|
| Push | `main`, `develop` | Pipeline complète |
| Pull Request | vers `main`, `develop` | Pipeline complète + Burn-in |
| Schedule | Lundi 6h UTC | Pipeline complète (régression) |

## Jobs de la Pipeline

### Stage 1: Build & Lint (Parallèle)

| Job | Description | Durée estimée |
|-----|-------------|---------------|
| `build-backend` | Compilation Java + Checkstyle | ~2 min |
| `build-web` | npm install + lint + build | ~1 min |
| `build-mobile` | npm install + lint | ~1 min |

### Stage 2: Tests Unitaires (Parallèle)

| Job | Tests | Durée estimée |
|-----|-------|---------------|
| `test-backend-unit` | 379 tests Java | ~2 min |
| `test-mobile-unit` | Tests Jest | ~1 min |

### Stage 3: Tests d'Intégration

| Job | Description | Durée estimée |
|-----|-------------|---------------|
| `test-backend-integration` | 33 tests avec PostgreSQL | ~3 min |

### Stage 4: Burn-in (PR vers main uniquement)

| Job | Description | Durée estimée |
|-----|-------------|---------------|
| `burn-in` | 10 itérations pour détecter les tests flaky | ~20 min |

### Stage 5: Tests E2E Mobile (Optionnel)

| Job | Description | Durée estimée |
|-----|-------------|---------------|
| `test-mobile-e2e` | Tests Maestro sur émulateur Android | ~15 min |

### Stage 6: Rapport & Notifications

| Job | Description |
|-----|-------------|
| `report` | Génère un résumé dans GitHub Actions |
| `notify-failure` | Notification Slack + création d'issue |

## Durées Estimées

| Scénario | Durée |
|----------|-------|
| Push sur develop | ~8 min |
| PR vers main (avec burn-in) | ~25 min |
| Exécution hebdomadaire | ~8 min |

## Exécution Locale

### Script CI Local

Pour exécuter la pipeline localement :

```bash
# Pipeline complète
./scripts/ci-local.sh

# Mode rapide (lint + unit tests seulement)
./scripts/ci-local.sh --quick

# Sans tests d'intégration
./scripts/ci-local.sh --skip-integration

# Sans tests mobile
./scripts/ci-local.sh --skip-mobile
```

### Script Burn-in

Pour détecter les tests flaky :

```bash
# 10 itérations (défaut)
./scripts/burn-in.sh

# 5 itérations
./scripts/burn-in.sh 5

# 10 itérations sur les tests d'intégration
./scripts/burn-in.sh 10 "*IT"

# 20 itérations sur les tests Order
./scripts/burn-in.sh 20 "Order*"
```

## Configuration des Secrets

### Secrets Requis

| Secret | Description | Obligatoire |
|--------|-------------|-------------|
| `SLACK_WEBHOOK_URL` | Webhook Slack pour notifications | Non |
| `CODECOV_TOKEN` | Token Codecov pour couverture | Non |

### Configuration dans GitHub

1. Aller dans **Settings** > **Secrets and variables** > **Actions**
2. Cliquer sur **New repository secret**
3. Ajouter les secrets nécessaires

## Artefacts

Les artefacts suivants sont générés :

| Artefact | Contenu | Rétention |
|----------|---------|-----------|
| `backend-build` | Classes compilées | 1 jour |
| `web-build` | Build Vite (dist/) | 1 jour |
| `backend-unit-test-results` | Rapports Surefire + JaCoCo | 7 jours |
| `backend-integration-test-results` | Rapports tests IT | 7 jours |
| `mobile-unit-test-results` | Coverage Jest | 7 jours |
| `burn-in-failures` | Logs des échecs burn-in | 30 jours |
| `mobile-e2e-results` | Résultats Maestro | 7 jours |

## Debugging

### Pipeline échoue sur build-backend

```bash
# Vérifier la compilation locale
./mvnw compile -B
```

### Tests d'intégration échouent

```bash
# Vérifier que PostgreSQL est démarré
docker-compose up -d postgres-test

# Vérifier la connexion
pg_isready -h localhost -p 5433 -U oneeats_test_user

# Lancer les tests localement
./mvnw test -Dtest="*IT"
```

### Tests flaky détectés

```bash
# Identifier les tests instables
./scripts/burn-in.sh 20

# Examiner les logs
cat target/burn-in-failure-*.log

# Lancer un test spécifique plusieurs fois
./scripts/burn-in.sh 10 "NomDuTest"
```

## Badges

Ajoutez ces badges à votre README :

```markdown
![CI/CD](https://github.com/AkinDevProject/oneeats-backend/actions/workflows/ci.yml/badge.svg)
[![codecov](https://codecov.io/gh/AkinDevProject/oneeats-backend/branch/main/graph/badge.svg)](https://codecov.io/gh/AkinDevProject/oneeats-backend)
```

## Bonnes Pratiques

### Avant de créer une PR

1. ✅ Exécuter `./scripts/ci-local.sh --quick` pour validation rapide
2. ✅ S'assurer que tous les tests passent localement
3. ✅ Lancer `./scripts/burn-in.sh 3` pour vérifier la stabilité

### En cas d'échec CI

1. 📥 Télécharger les artefacts de test
2. 🔍 Examiner les rapports Surefire
3. 🔄 Reproduire le problème localement
4. 🛠️ Corriger et re-pusher

### Tests Flaky

Un test est considéré "flaky" s'il échoue de manière intermittente. Causes communes :

- Race conditions
- Dépendances d'ordre d'exécution
- Timeouts trop courts
- État partagé entre tests
- Dépendances externes non mockées

## Architecture de la Pipeline

```yaml
# Fichiers de configuration
.github/
└── workflows/
    └── ci.yml          # Pipeline principale

scripts/
├── ci-local.sh         # Exécution locale
└── burn-in.sh          # Détection tests flaky

docs/guides/
└── CI_CD_GUIDE.md      # Cette documentation
```

## Changelog

| Version | Date | Changements |
|---------|------|-------------|
| 1.0.0 | 2026-01-17 | Pipeline initiale avec tous les stages |

---

*Généré par BMAD Test Architect*
