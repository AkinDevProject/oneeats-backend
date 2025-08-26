# 🚀 Guide de Démarrage Rapide - OneEats

## Prérequis

- **Java 17+** ⚠️ REQUIS pour Quarkus 3.x
- **Node.js 18+** pour le frontend React
- **Docker** pour PostgreSQL (recommandé)
- **Maven** (inclus avec mvnw)

## 🏃‍♂️ Démarrage Express (3 étapes)

### 1. Base de Données
```bash
# Option A : Avec Docker (recommandé)
docker-compose -f docker-compose.dev.yml up -d

# Option B : PostgreSQL local
# Créer une base "oneeats_dev" avec user "oneeats_user" / password "oneeats_password"
```

### 2. Backend + Frontend
```bash
# Quarkus démarre automatiquement le frontend React via Quinoa
./mvnw quarkus:dev

# Sur Windows
mvnw.cmd quarkus:dev
```

### 3. Accès aux Applications

- **🌐 Frontend** : http://localhost:5173
- **🔧 API Backend** : http://localhost:8080/api
- **📖 Documentation** : http://localhost:8080/q/swagger-ui
- **🗄️ PgAdmin** : http://localhost:5050 (admin@oneeats.com / admin123)

## 👤 Comptes de Test

```
Admin:      admin@oneeats.com      / admin123
Restaurant: luigi@restaurant.com   / resto123
Client:     client@email.com       / client123
```

## 🏗️ Architecture

```
oneeats-backend/
├── src/main/java/com/oneeats/     # Backend Java
│   ├── user/                      # Gestion utilisateurs
│   ├── restaurant/                # Gestion restaurants
│   ├── menu/                      # Gestion menus
│   └── order/                     # Gestion commandes
├── apps/web/                      # Frontend React
│   ├── src/pages/admin/           # Interface admin
│   └── src/pages/restaurant/      # Interface restaurant
└── src/main/resources/
    ├── application.yml            # Config principale
    ├── application-dev.yml        # Config développement
    └── import.sql                 # Données de test
```

## 🔧 Développement

### Hot Reload
- **Backend** : Modification automatique des fichiers Java
- **Frontend** : Rechargement automatique avec Vite
- **Base** : Réinitialisation via `/api/dev/reset`

### Commandes Utiles
```bash
# Tests backend
./mvnw test

# Build production
./mvnw clean package -Pnative

# Frontend seul
cd apps/web && npm run dev

# Lint et format
cd apps/web && npm run lint
```

## 🐛 Résolution de Problèmes

### Erreur de Port
- Backend : Changer `quarkus.http.port` dans `application-dev.yml`
- Frontend : Modifier `server.port` dans `apps/web/vite.config.ts`

### Base de Données
- Vérifier la connection PostgreSQL
- Réinitialiser : `docker-compose down -v && docker-compose up -d`

### Cache Frontend
```bash
cd apps/web
rm -rf node_modules dist
npm install
```

## 📦 Production

```bash
# Build complet
./mvnw clean package

# Docker
docker build -t oneeats-backend .
docker run -p 8080:8080 oneeats-backend
```

## 🤝 Support

- **Documentation** : Voir `README.md` complet
- **Issues** : Créer un ticket GitHub
- **API** : Consulter Swagger UI en développement