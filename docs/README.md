# 📚 Documentation OneEats

Bienvenue dans la documentation du projet OneEats ! Cette documentation a été organisée selon les meilleures pratiques pour faciliter la collaboration avec Claude Code et l'équipe de développement.

---

## 🚀 Démarrage Rapide

### Pour Claude Code

**Commencez toujours par lire ces fichiers dans cet ordre :**

1. 📋 **[ROADMAP.md](ROADMAP.md)** - Voir la tâche en cours et les prochaines étapes
2. 📖 **[BUSINESS_RULES.md](BUSINESS_RULES.md)** - Comprendre les règles métier
3. 🏗️ **[ARCHITECTURE.md](ARCHITECTURE.md)** - Comprendre l'architecture technique

### Pour les Développeurs

1. 📖 Consultez **[guides/GETTING_STARTED.md](guides/GETTING_STARTED.md)** pour configurer votre environnement
2. 🏗️ Lisez **[ARCHITECTURE.md](ARCHITECTURE.md)** pour comprendre la structure du projet
3. 📡 Référez-vous à **[API_SPECS.md](API_SPECS.md)** pour les endpoints disponibles

---

## 📁 Structure de la Documentation

### 📄 Fichiers Principaux (Racine `/docs/`)

| Fichier | Description | Audience |
|---------|-------------|----------|
| **[BUSINESS_RULES.md](BUSINESS_RULES.md)** | Règles métier, workflows, validations | Tous |
| **[USE_CASES.md](USE_CASES.md)** | Scénarios utilisateur détaillés (Mobile, Restaurateur, Admin) | Product + Dev |
| **[TEST_STRATEGY.md](TEST_STRATEGY.md)** | Stratégie complète de tests (Unit, Integration, E2E) | Développeurs + QA |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | Architecture technique, patterns, structure | Développeurs |
| **[ARCHITECTURE_HEXAGONALE.md](ARCHITECTURE_HEXAGONALE.md)** | Guide détaillé DDD/Architecture Hexagonale | Développeurs Backend |
| **[ROADMAP.md](ROADMAP.md)** | Tâches en cours, progression, sprints | Tous |
| **[API_SPECS.md](API_SPECS.md)** | Documentation complète des APIs | Développeurs Frontend/Backend |
| **[DATA_MODEL.md](DATA_MODEL.md)** | Schéma base de données, relations | Développeurs Backend/Data |
| **[BUGS.md](BUGS.md)** | Bugs connus, solutions, workarounds | Tous |

---

### 📂 Sous-dossiers

#### `/docs/guides/` - Guides Techniques

Documentation pour la mise en place, le déploiement et la sécurité :

- **[GETTING_STARTED.md](guides/GETTING_STARTED.md)** - Guide de démarrage et setup environnement
- **[DEPLOYMENT_GUIDE.md](guides/DEPLOYMENT_GUIDE.md)** - Guide de déploiement (Docker, production)
- **[SECURITY_GUIDE.md](guides/SECURITY_GUIDE.md)** - Bonnes pratiques sécurité
- **[TROUBLESHOOTING.md](guides/TROUBLESHOOTING.md)** - Résolution de problèmes courants

#### `/docs/business/` - Spécifications Métier

Documents contractuels et spécifications UX/UI :

- **REQUIREMENTS_SPECIFICATION.md** - Spécifications des exigences
- **WEB_UI_SPECIFICATIONS.md** - Spécifications UI dashboard web
- **MOBILE_UI_SPECIFICATIONS.md** - Spécifications UI application mobile
- **TECHNICAL_PROPOSAL.md** - Proposition technique initiale
- **PROJECT_CHECKLIST.md** - Checklist du projet

#### `/docs/concepts/` - Concepts Futurs

Idées et concepts pour fonctionnalités futures :

- **AI_MENU_GENERATION.md** - Génération de menus par IA

#### `/docs/mobile/` - Documentation Mobile

Documentation spécifique à l'application mobile React Native/Expo

#### `/docs/tests/` - Documentation Tests

Stratégies de tests et documentation des suites de tests

#### `/docs/archive/` - Archives

Anciens fichiers fusionnés ou obsolètes (MVP_BACKLOG.md, MOBILE_ROADMAP.md)

---

## 🎯 Cas d'Usage

### "Je veux voir tous les scénarios utilisateur de l'application"

1. Lisez **[USE_CASES.md](USE_CASES.md)** → 19 use cases détaillés (Mobile, Web, Admin)
2. Consultez la matrice de traçabilité pour les dépendances
3. Référez-vous à **[BUSINESS_RULES.md](BUSINESS_RULES.md)** pour les règles métier associées

### "Je veux écrire tous les tests du projet (TDD, Unit, Integration, E2E)"

1. Lisez **[TEST_STRATEGY.md](TEST_STRATEGY.md)** → Méthodologie complète et templates
2. Mappez depuis **[USE_CASES.md](USE_CASES.md)** → Tests d'intégration et E2E
3. Mappez depuis **[BUSINESS_RULES.md](BUSINESS_RULES.md)** → Tests unitaires (règles RG-XXX)
4. Suivez la répartition 70-20-10 (Unitaire / Intégration / E2E)

### "Je veux comprendre comment fonctionne le système de commandes"

1. Lisez **[USE_CASES.md](USE_CASES.md)** → UC-004 (Commander), UC-101 (Recevoir commandes)
2. Consultez **[BUSINESS_RULES.md](BUSINESS_RULES.md)** → Section "Gestion des Commandes"
3. Regardez **[DATA_MODEL.md](DATA_MODEL.md)** → Tables `orders` et `order_items`
4. Vérifiez **[ARCHITECTURE.md](ARCHITECTURE.md)** → Domaine Order

### "Je veux ajouter un nouvel endpoint API"

1. Consultez **[API_SPECS.md](API_SPECS.md)** pour voir les patterns existants
2. Lisez **[ARCHITECTURE.md](ARCHITECTURE.md)** pour comprendre la structure hexagonale
3. Vérifiez **[BUSINESS_RULES.md](BUSINESS_RULES.md)** pour les règles à implémenter

### "Je veux créer une nouvelle migration de base de données"

1. Consultez **[DATA_MODEL.md](DATA_MODEL.md)** → Section "Migrations"
2. Vérifiez **[BUSINESS_RULES.md](BUSINESS_RULES.md)** pour les contraintes métier
3. Suivez les patterns des migrations existantes

### "Je veux corriger un bug"

1. Vérifiez **[BUGS.md](BUGS.md)** pour voir s'il est déjà répertorié
2. Consultez **[guides/TROUBLESHOOTING.md](guides/TROUBLESHOOTING.md)** pour les problèmes courants
3. Reportez le bug dans **[BUGS.md](BUGS.md)** s'il est nouveau

### "Je veux déployer l'application"

1. Lisez **[guides/DEPLOYMENT_GUIDE.md](guides/DEPLOYMENT_GUIDE.md)**
2. Vérifiez **[guides/SECURITY_GUIDE.md](guides/SECURITY_GUIDE.md)** pour la sécurité
3. Consultez **[ARCHITECTURE.md](ARCHITECTURE.md)** pour la configuration production

---

## 📝 Conventions de Documentation

### Style et Format

- **Format** : Markdown (GitHub Flavored)
- **Langue** : Français (code et commits en français)
- **Emojis** : Utilisés pour améliorer la lisibilité (📋, 🏗️, 🐛, etc.)
- **Diagrammes** : ASCII art pour ERD et architecture

### Structure des Documents

Tous les documents principaux suivent cette structure :

```markdown
# Titre du Document

## Vue d'ensemble
[Introduction brève]

## Sections Principales
[Contenu organisé en sections]

## Exemples
[Exemples concrets quand pertinent]

## Dernière mise à jour
Date, version, responsable
```

### Mise à Jour

- **Fréquence** :
  - `ROADMAP.md` : Après chaque session de développement
  - `BUGS.md` : Dès qu'un bug est découvert ou résolu
  - `BUSINESS_RULES.md` : Quand les règles métier changent
  - `ARCHITECTURE.md` : Quand l'architecture évolue
  - `API_SPECS.md` : À chaque nouvel endpoint ou modification
  - `DATA_MODEL.md` : À chaque migration de base de données

---

## 🔍 Recherche dans la Documentation

### Par Thème

- **Scénarios Utilisateur** → USE_CASES.md
- **Tests (TDD, Unit, Integration, E2E)** → TEST_STRATEGY.md
- **Architecture Backend** → ARCHITECTURE.md, DATA_MODEL.md
- **Architecture Frontend** → ARCHITECTURE.md, API_SPECS.md
- **Règles Métier** → BUSINESS_RULES.md
- **APIs** → API_SPECS.md
- **Base de Données** → DATA_MODEL.md
- **Progression Projet** → ROADMAP.md
- **Problèmes** → BUGS.md, guides/TROUBLESHOOTING.md
- **Déploiement** → guides/DEPLOYMENT_GUIDE.md
- **Sécurité** → guides/SECURITY_GUIDE.md

### Par Domaine Métier

- **Utilisateurs** → BUSINESS_RULES.md (Gestion des Utilisateurs), DATA_MODEL.md (Table users)
- **Restaurants** → BUSINESS_RULES.md (Gestion des Restaurants), DATA_MODEL.md (Table restaurants)
- **Menus** → BUSINESS_RULES.md (Gestion des Menus), DATA_MODEL.md (Table menu_items)
- **Commandes** → BUSINESS_RULES.md (Gestion des Commandes), DATA_MODEL.md (Tables orders/order_items)

---

## 🤝 Contribuer à la Documentation

### Ajouter une nouvelle page

1. Créez le fichier dans le bon dossier (`/docs/` ou `/docs/guides/`)
2. Suivez la structure standard (voir "Structure des Documents")
3. Ajoutez un lien dans ce README.md
4. Mettez à jour CLAUDE.md si nécessaire

### Mettre à jour une page existante

1. Modifiez le contenu
2. Mettez à jour la section "Dernière mise à jour" en bas du document
3. Si changement majeur, notez-le dans ROADMAP.md → Notes de session

### Reporter un bug dans la documentation

1. Ouvrez un issue GitHub ou
2. Ajoutez une note dans BUGS.md section "Documentation"

---

## 📞 Contact et Support

- **Issues GitHub** : Pour bugs et feature requests
- **Documentation Principale** : Ce dossier `/docs/`
- **Contexte Projet** : `CONTEXT.md` (racine du projet)
- **Configuration Claude Code** : `CLAUDE.md` (racine du projet)

---

## 📅 Dernière Mise à Jour

**Date** : 2025-12-12
**Version** : MVP 0.7
**Responsable** : Équipe OneEats
**Changements** : Restructuration complète de la documentation selon bonnes pratiques Claude Code

---

## ✅ Checklist pour Nouvelle Session

Pour Claude Code et les développeurs :

- [ ] Lire `ROADMAP.md` pour connaître la tâche en cours
- [ ] Vérifier `BUGS.md` pour les problèmes connus
- [ ] Consulter `BUSINESS_RULES.md` pour les règles métier du domaine travaillé
- [ ] Référencer `ARCHITECTURE.md` et `DATA_MODEL.md` si besoin
- [ ] Mettre à jour `ROADMAP.md` en fin de session avec les avancées

**💡 Bonne documentation = Développement efficace !**
