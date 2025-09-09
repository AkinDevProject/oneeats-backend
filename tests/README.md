# 🤖 Tests Automatisés OneEats

Ce dossier contient la suite complète de tests automatisés end-to-end pour OneEats, remplaçant les tests manuels du fichier `PLAN_TESTS_UTILISATEUR.md`.

## 🚀 Lancement Rapide

### ⚠️ **PRÉREQUIS OBLIGATOIRES**
1. **Lancer Quarkus depuis IntelliJ IDEA** (mode dev)
2. **Démarrer PostgreSQL** : `docker-compose -f docker-compose.dev.yml up -d`
3. **Vérifier** que `http://localhost:8080/restaurant/menu` fonctionne

### Windows
```bash
cd tests
./run-tests.bat
```

### Linux/Mac
```bash
cd tests
chmod +x run-tests.sh
./run-tests.sh
```

### Manuel
```bash
cd tests
npm install
npx playwright install
npm test
```

### 🎯 **Setup Quinoa**
- Dashboard sur : `http://localhost:8080/restaurant` 
- API sur : `http://localhost:8080/api`
- **Une seule URL** grâce à Quinoa !

## 📋 Tests Automatisés

### **Phase 1 : Dashboard Restaurant**
- ✅ Vérification menu complet (8+ plats)
- ✅ Gestion de la disponibilité
- ✅ Filtres et recherche
- ✅ Synchronisation avec BDD

### **Phase 2 : API Backend**
- ✅ API Restaurants (`GET /restaurants`)
- ✅ API Restaurant détails (`GET /restaurants/{id}`)
- ✅ API Menu Items (`GET /menu-items/restaurant/{id}`)
- ✅ Cohérence API-BDD
- ✅ Tests de performance

### **Phase 3 : Simulation Mobile & Commandes**
- ✅ Simulation commande mobile complète
- ✅ Cycle de vie complet des commandes
- ✅ Validation données en BDD
- ✅ Tests de performance commandes

### **Phase 4 : Intégration Complète**
- ✅ Flow end-to-end Dashboard → API → Mobile → BDD
- ✅ Tests de régression
- ✅ Validation de toute la chaîne

## 🎯 Configuration

### Variables d'Environnement (`.env`)
```bash
# URLs de test
API_BASE_URL=http://localhost:8080/api
WEB_BASE_URL=http://localhost:5173

# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=oneeats_dev
DB_USER=oneeats_user
DB_PASSWORD=oneeats_pass

# Test data
TEST_RESTAURANT_ID=11111111-1111-1111-1111-111111111111
TEST_USER_ID=12345678-1234-1234-1234-123456789012
```

## 📊 Rapports de Test

Après les tests, consultez :
- **Rapport HTML** : `tests/reports/html/index.html`
- **Captures d'écran** : `tests/test-results/`
- **Vidéos d'échec** : `tests/test-results/`

## 🛠️ Commandes Utiles

```bash
# Tests avec interface graphique
npm run test:ui

# Tests en mode debug
npm run test:debug

# Tests avec navigateur visible
npm run test:headed

# Afficher dernier rapport
npm run test:report

# Tests spécifiques
npx playwright test phase1-dashboard
npx playwright test phase2-api
npx playwright test phase3-orders
npx playwright test integration-complete
```

## 📝 Structure des Tests

```
tests/
├── specs/                          # Tests Playwright
│   ├── phase1-dashboard.spec.ts     # Tests Dashboard Restaurant
│   ├── phase2-api.spec.ts          # Tests API Backend
│   ├── phase3-orders.spec.ts       # Tests Simulation Mobile
│   └── integration-complete.spec.ts # Tests Intégration
├── helpers/                        # Utilitaires de test
│   ├── database-helper.ts          # Helper base de données
│   └── api-helper.ts              # Helper API
├── setup/                          # Configuration globale
│   ├── global-setup.ts            # Setup avant tests
│   └── global-teardown.ts         # Nettoyage après tests
└── reports/                       # Rapports générés
```

## 🎪 Avantages vs Tests Manuels

| Aspect | Tests Manuels | Tests Automatisés |
|--------|---------------|-------------------|
| **Temps** | 30-45 minutes | 3-5 minutes |
| **Cohérence** | Variable | Toujours identique |
| **Couverture** | Partielle | Complète + BDD |
| **Rapports** | Manuel | HTML + captures |
| **Régression** | Long à refaire | Automatique |
| **CI/CD** | Non intégrable | Intégrable |

## ⚡ Résultats Attendus

### ✅ Tests Réussis
- Tous les plats Pizza Palace visibles
- API répond correctement
- Commandes créées et persistées
- Cycle de vie complet fonctionnel
- BDD cohérente avec interface

### ❌ En cas d'Échec
- Captures d'écran automatiques
- Logs détaillés
- Localisation précise du problème
- Suggestions de correction

## 🔧 Dépannage

### Services non démarrés
```bash
# Backend Quarkus
./mvnw quarkus:dev

# Frontend React  
cd apps/web && npm run dev

# Base de données
docker-compose -f docker-compose.dev.yml up -d
```

### Erreurs de connexion BDD
- Vérifier les credentials dans `.env`
- S'assurer que PostgreSQL est démarré
- Vérifier que `import-dev.sql` est appliqué

### Tests qui échouent
- Vérifier les URLs dans `.env`
- Nettoyer et relancer : `npx playwright test --workers=1`
- Mode debug : `npm run test:debug`

## 🎯 Équivalence avec PLAN_TESTS_UTILISATEUR.md

Ce système automatisé remplace intégralement les tests manuels :

- **Test 1.1 → phase1-dashboard.spec.ts** : "Création menu complet"
- **Test 2.1 → phase2-api.spec.ts** : "Navigation et découverte"
- **Test 2.2 → phase3-orders.spec.ts** : "Processus de commande"
- **Test 3.1 → integration-complete.spec.ts** : "Réception commande temps réel"
- **Test 5.1 → Tous les specs** : "Vérification base de données"

## 🚀 Intégration CI/CD

Pour intégrer dans une pipeline :

```yaml
# GitHub Actions exemple
- name: Run E2E Tests
  run: |
    cd tests
    npm ci
    npx playwright install --with-deps
    npm test
- name: Upload test results
  uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: tests/reports/
```

---

**🎉 Avec ce système, les tests OneEats sont maintenant automatisés, fiables et rapides !**