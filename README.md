# OneEats - Plateforme de Commande Alimentaire

OneEats est une plateforme de commande de plats à récupérer sur place, construite avec une architecture monolithique modulaire moderne.

## 🚀 Démarrage Rapide

```bash
# 1. Démarrer la base de données
docker-compose -f docker-compose.dev.yml up -d

# 2. Lancer le backend (inclut le frontend web via Quinoa)
./mvnw quarkus:dev

# 3. Lancer l'app mobile (optionnel)
cd apps/mobile && npm start
```

**URLs importantes :**
- Frontend Web : http://localhost:5173
- API Backend : http://localhost:8080/api
- Documentation API : http://localhost:8080/q/swagger-ui

## 🏗️ Architecture

**Monorepo** avec architecture **hexagonale/clean** et **Domain-Driven Design** :

```
oneeats-backend/
├── src/main/java/com/oneeats/    # Backend Java Quarkus
├── apps/web/                     # Frontend React restaurant
├── apps/mobile/                  # App React Native client
└── docs/                         # Documentation projet
```

## 📚 Documentation

- **[Architecture Guide](docs/ARCHITECTURE_GUIDE.md)** - Guide architectural complet
- **[Getting Started](docs/GETTING_STARTED.md)** - Configuration et démarrage rapide
- **[API Reference](docs/API_REFERENCE.md)** - Documentation APIs complète
- **[Mobile Roadmap](docs/MOBILE_ROADMAP.md)** - Roadmap et plan mobile
- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** - Guide déploiement production
- **[Security Guide](docs/SECURITY_GUIDE.md)** - Guide sécurité complet
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Guide dépannage et résolution problèmes
- **[MVP Backlog](docs/MVP_BACKLOG.md)** - 🎯 **Roadmap complète avec tâches prioritaires MVP**
- **[Mobile Documentation](docs/mobile/)** - Guides techniques mobile
- **[Business Documents](docs/business/)** - Spécifications et cahiers des charges

## 🎯 MVP Fonctionnalités

### Pour les Clients (Mobile)
- 📱 Recherche restaurants par proximité/cuisine
- 🛒 Ajout articles au panier
- 📋 Passage commandes avec suivi temps réel
- ⭐ Système de favoris

### Pour les Restaurants (Web)
- 🏪 Gestion profil restaurant
- 🍽️ Création/modification menus
- 📦 Traitement commandes
- 📊 Statistiques et analytics

### Pour les Admins (Web)
- 👥 Gestion restaurants
- 📋 Supervision commandes
- 📈 Tableau de bord global

## 🛠️ Stack Technique

### Backend
- **Quarkus 3.24.2** + Java 21
- **PostgreSQL** + Hibernate ORM
- **Architecture hexagonale** + DDD
- **Event-driven** avec CDI Events

### Frontend Web
- **React 18** + TypeScript + Vite
- **Tailwind CSS** + Recharts
- **React Router DOM**

### Mobile
- **React Native** + Expo 53
- **Expo Router** + React Query
- **React Native Paper**
- **Push notifications** intégrées

## 📦 Domaines Implémentés

- ✅ **Order** - Gestion commandes complète
- ✅ **User** - Utilisateurs et authentification
- ✅ **Restaurant** - Gestion restaurants
- ✅ **Menu** - Items et catégories
- ✅ **Admin** - Administration
- ✅ **Notification** - Push notifications

## 🔧 Commandes Utiles

```bash
# Backend
./mvnw quarkus:dev              # Mode développement
./mvnw test                     # Tests
./mvnw clean package           # Build production

# Frontend web
cd apps/web && npm run dev     # Développement
cd apps/web && npm run build   # Production

# Mobile
cd apps/mobile && npm start    # Expo dev server
cd apps/mobile && npm run android  # Android
```

## 📊 État MVP

- 🏗️ **Architecture** : ✅ Complète
- 🔌 **APIs Backend** : ✅ Toutes les APIs nécessaires
- 💾 **Base données** : ✅ Schéma complet + données test
- 🎨 **Frontend Web** : ✅ Dashboard restaurant fonctionnel
- 📱 **App Mobile** : ✅ Fonctionnalités client complètes
- 🔐 **Authentification** : 🔨 À finaliser
- 📊 **Analytics** : 🔨 Stats de base implémentées

## 📝 Licence

Projet privé - OneEats 2024