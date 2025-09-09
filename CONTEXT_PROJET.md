# 📋 Contexte du Projet OneEats

## 🏗️ Architecture de Développement

### **Setup Backend + Frontend**
- **Backend** : Quarkus Java lancé depuis **IntelliJ IDEA** (pas de JDK terminal)
- **Frontend Dashboard** : React intégré via **Quinoa** dans Quarkus 
- **URL unique** : `http://localhost:8080` (backend + dashboard)
- **Mobile App** : React Native/Expo séparée sur `apps/mobile/`

### **Services**
- **API Backend** : `http://localhost:8080/api`
- **Dashboard Restaurant** : `http://localhost:8080/restaurant`
- **Base de données** : PostgreSQL Docker `localhost:5432`
- **App mobile** : `http://192.168.1.36:8080/api` (IP réseau local)

### **Outils de développement**
- **IDE Principal** : IntelliJ IDEA (avec Quarkus + Quinoa)
- **Terminal** : Pas de JDK disponible
- **Docker** : PostgreSQL + PgAdmin
- **Mobile** : Expo CLI

## 🎯 Implications pour les Tests

### **Tests Automatisés**
- **Une seule URL** : `localhost:8080` (Quinoa sert le React)
- **Pas de démarrage auto** : Quarkus doit être lancé manuellement depuis IntelliJ
- **Vérification manuelle** : S'assurer que `http://localhost:8080/restaurant/menu` fonctionne
- **API** : `http://localhost:8080/api` disponible sur le même port

### **Prérequis pour Tests E2E**
1. ✅ **IntelliJ ouvert** avec Quarkus en dev mode
2. ✅ **PostgreSQL** démarré (Docker)
3. ✅ **Import-dev.sql** appliqué (données Pizza Palace)
4. ✅ **Quinoa** servant le dashboard React automatiquement

### **URLs de Test**
```bash
# Dashboard Restaurant (Quinoa)
http://localhost:8080/restaurant/menu

# API Backend 
http://localhost:8080/api/restaurants
http://localhost:8080/api/menu-items/restaurant/{id}

# App Mobile (réseau local)
http://192.168.1.36:8080/api
```

## 🔧 Configuration Spécifique

### **Quinoa + Quarkus**
- Dashboard React **intégré** dans Quarkus
- **Aucun port séparé** pour le frontend
- **Hot reload** géré par Quinoa
- **Build production** : Frontend compilé dans Quarkus JAR

### **Développement**
- **Backend changes** : IntelliJ hot reload
- **Frontend changes** : Quinoa hot reload automatique
- **Mobile changes** : Expo hot reload séparé

### **Tests**
- **E2E Tests** : Playwright pointant sur `:8080`
- **API Tests** : RestAssured dans Quarkus (existants)
- **Mobile Tests** : Detox (si implémenté plus tard)

## 📁 Structure Projet

```
oneeats-backend/
├── src/main/java/          # Backend Quarkus
├── src/main/resources/     # Config + import-dev.sql
├── apps/
│   ├── web/               # React Dashboard (Quinoa)
│   └── mobile/            # React Native (Expo)
├── tests/                 # Tests E2E Playwright
└── docker-compose.dev.yml # PostgreSQL
```

## 🎯 Pour Claude Code

### **Important à retenir**
- **Pas de `./mvnw`** en ligne de commande
- **Pas de `npm run dev`** pour le dashboard (géré par Quinoa)
- **URL unique** `:8080` pour backend + dashboard
- **IntelliJ requis** pour lancer Quarkus
- **Tests E2E** adaptés à cette architecture

### **Commandes valides**
```bash
# ✅ OK - Tests
cd tests && npm test

# ✅ OK - Docker BDD  
docker-compose -f docker-compose.dev.yml up -d

# ✅ OK - Mobile
cd apps/mobile && npm start

# ❌ NON - Backend (IntelliJ seulement)
./mvnw quarkus:dev

# ❌ NON - Dashboard (intégré Quinoa)
cd apps/web && npm run dev
```

---
**📝 Note** : Ce fichier sert de référence pour Claude Code afin qu'il comprenne l'architecture spécifique du projet et adapte ses suggestions en conséquence.