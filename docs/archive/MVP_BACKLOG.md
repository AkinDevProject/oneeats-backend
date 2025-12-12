# OneEats - MVP Backlog & Roadmap

Backlog complet organisé par priorité pour finaliser le MVP OneEats, avec prompts prêts à exécuter pour Claude Code.

---

## 🎯 **Vue d'Ensemble MVP**

### **Statut Global**
- 🏗️ **Architecture** : ✅ 100% - Complète et documentée
- 🔌 **Backend APIs** : ✅ 90% - Domaines principaux implémentés
- 🗄️ **Base données** : ✅ 95% - Schéma complet avec données test
- 🌐 **Frontend Web** : ⚠️ 70% - Interface complète mais intégration à finaliser
- 📱 **App Mobile** : ⚠️ 80% - Fonctionnalités avancées mais APIs à connecter
- 🔐 **Sécurité** : ❌ 30% - Configuration documentée mais pas implémentée
- 🚀 **Déploiement** : ❌ 20% - Guides créés mais pas testé

### **Objectif MVP**
Plateforme fonctionnelle permettant aux clients de commander via mobile et aux restaurants de gérer leurs commandes via web.

---

## 🔥 **SPRINT 1 - INTÉGRATION (Semaine 1)**
*Connexion frontend/backend pour MVP démontrable rapidement*

### **ONEE-002** 🚀 **INTÉGRATION**
**Titre** : Connecter frontend web aux vraies APIs  
**Story Points** : 5  
**Priorité** : P0 - Bloquant MVP  

**Description** : Le dashboard restaurant utilise des données mockées. Connecter aux vraies APIs backend pour un fonctionnement réel.

**Acceptance Criteria** :
- [ ] Remplacer tous les mock data par vrais appels API
- [ ] Gestion d'erreurs réseau appropriée  
- [ ] Loading states pendant requêtes
- [ ] ✨ **Mode sans auth** : Fonctionne sans authentification pour tests rapides

**Prompt Claude Code** :
```
Connecte le frontend web OneEats aux vraies APIs backend (SANS AUTHENTIFICATION pour l'instant) :

1. Analyse le dashboard restaurant dans apps/web/ et identifie tous les mock data

2. Remplace par vrais appels API :
   - Services API pour restaurants, menus, commandes
   - Configuration axios ou fetch pour localhost:8080
   - Gestion états loading/error/success

3. Configuration environnement :
   - Variables d'environnement pour URL API (.env.local)
   - Service API centralisé dans services/api.js
   - Pas d'auth headers pour l'instant (à ajouter plus tard)

4. Tests fonctionnalités :
   - Teste TOUS les écrans avec vrai backend
   - Vérifie CRUD complet (restaurants, menus, commandes)
   - Gestion erreurs réseau et validation

FOCUS : MVP fonctionnel rapidement. Auth sera ajoutée en Sprint 3.
```

---

### **ONEE-003** 🚀 **INTÉGRATION**
**Titre** : Connecter app mobile aux vraies APIs  
**Story Points** : 5  
**Priorité** : P0 - Bloquant MVP  

**Description** : L'app mobile utilise des données mockées. Connecter aux vraies APIs pour permettre vraies commandes.

**Acceptance Criteria** :
- [ ] Contexts (Order, Restaurant) utilisent vraies APIs
- [ ] Passage de commandes réel jusqu'en base
- [ ] Synchronisation états avec backend
- [ ] ✨ **Mode sans auth** : AuthContext simplifié sans vraie auth

**Prompt Claude Code** :
```
Connecte l'application mobile OneEats aux vraies APIs backend (SANS AUTHENTIFICATION pour l'instant) :

1. Configure l'intégration API :
   - URL backend adaptée mobile (10.0.2.2 pour Android, localhost pour iOS)
   - Service API centralisé dans services/api.ts
   - AuthContext simplifié (mock user ID fixe pour tests)

2. Mise à jour des Contexts :
   - OrderContext : CRUD commandes réelles avec API
   - RestaurantContext : données restaurants depuis API
   - AuthContext : user fictif fixe (id: "test-user-123")

3. Configuration sans auth :
   - Pas de JWT tokens pour l'instant
   - User ID fixe dans les appels API
   - AsyncStorage pour persistence basique (panier, etc.)

4. Tests sur émulateurs :
   - Teste flux complet commande client → backend → dashboard restaurant
   - Vérifie synchronisation temps réel données

FOCUS : Démo complète client mobile + dashboard restaurant qui fonctionne !
```

---

### **ONEE-006** 🚀 **INTÉGRATION**
**Titre** : Gestion statuts commandes avancée  
**Story Points** : 3  
**Priorité** : P0 - Critical MVP  

**Description** : Améliorer la machine à états des commandes avec plus de granularité et règles métier pour démo réaliste.

**Acceptance Criteria** :
- [ ] Statuts enrichis avec temps estimés
- [ ] Transitions logiques validées
- [ ] Interface utilisateur mise à jour
- [ ] Synchronisation temps réel mobile ↔ web

**Prompt Claude Code** :
```
Améliore la gestion des statuts de commandes OneEats pour démo MVP :

1. Enrichir OrderStatus enum :
   - EN_ATTENTE → EN_ATTENTE_CONFIRMATION  
   - Ajouter CONFIRMEE, EN_PREPARATION, PRETE_RETRAIT, RETIREE, ANNULEE
   - Temps estimé par statut (5min confirmation, 15-30min préparation, etc.)

2. State machine avec règles métier :
   - Transitions autorisées selon statut actuel
   - Calcul temps estimés selon items commandés
   - Validation côté backend et frontend

3. Intégration frontend :
   - Timeline visuelle progression sur mobile
   - Actions restaurant (confirmer, marquer prêt) sur web
   - Mise à jour automatique statuts côtés

4. Notifications simples :
   - Console.log sur changement statut (pour tests)
   - Base pour notifications futures Sprint 2

Priorise UX démo : client mobile voit progression, restaurant web gère commandes.
```

---

## ⚡ **SPRINT 2 - FONCTIONNALITÉS (Semaine 2)**
*Fonctionnalités importantes pour expérience utilisateur complète*

### **ONEE-004** ⚡ **IMPORTANT**
**Titre** : Implémenter upload d'images restaurants/menus  
**Story Points** : 5  
**Priorité** : P1 - Important MVP  

**Description** : Permettre upload logos restaurants et photos plats pour améliorer UX.

**Prompt Claude Code** :
```
Implémente le système d'upload d'images pour OneEats :

1. Backend upload service :
   - Endpoint POST /api/upload avec validation (taille, format)
   - Stockage local ou cloud (AWS S3/MinIO)
   - Génération URLs publiques images

2. Intégration domaines :
   - Restaurant : champ logoUrl 
   - MenuItem : champ imageUrl
   - Validation URLs dans DTOs

3. Frontend :
   - Composant upload avec preview
   - Intégration forms restaurant/menu
   - Optimisation images (resize, compression)

4. Sécurité :
   - Validation types fichiers (JPEG, PNG uniquement)
   - Limite taille (2MB max)
   - Scan antivirus basique

Configure stockage adapté environnement (local dev, S3 prod).
```

---

### **ONEE-005** ⚡ **IMPORTANT**
**Titre** : Système de notifications temps réel  
**Story Points** : 8  
**Priorité** : P1 - Important MVP  

**Description** : Notifications en temps réel pour restaurants (nouvelles commandes) et clients (statut commandes).

**Prompt Claude Code** :
```
Implémente le système de notifications temps réel OneEats :

1. Backend WebSocket :
   - WebSocket endpoint pour notifications temps réel
   - NotificationService pour broadcast événements
   - Intégration avec Order events (nouvelle commande, changement statut)

2. Types notifications :
   - Restaurant : nouvelle commande, commande annulée
   - Client : commande confirmée, en préparation, prête, terminée
   - Persistence historique notifications

3. Frontend web :
   - WebSocket client avec reconnexion auto
   - Toast notifications nouvelles commandes
   - Badge compteur commandes non vues

4. Mobile push :
   - Intégration avec Expo push existant
   - Trigger push depuis backend via Expo API
   - Deep linking vers détails commande

Focus sur fiabilité : queue messages, retry, offline support.
```

---

### **ONEE-006** ⚡ **IMPORTANT**
**Titre** : Gestion statuts commandes avancée  
**Story Points** : 3  
**Priorité** : P1 - Important MVP  

**Description** : Améliorer la machine à états des commandes avec plus de granularité et règles métier.

**Prompt Claude Code** :
```
Améliore la gestion des statuts de commandes OneEats :

1. Enrichir OrderStatus enum :
   - PENDING → EN_ATTENTE_CONFIRMATION  
   - Ajouter CONFIRMEE, EN_PREPARATION, PRETE_RETRAIT, RETIREE, ANNULEE
   - Temps estimé par statut

2. Règles de transition :
   - State machine avec validations transitions autorisées
   - Seul restaurant peut confirmer/préparer
   - Seul client peut marquer "retiré"
   - Annulation possible selon statut

3. Intégration business :
   - Calcul temps estimés selon restaurant/items
   - Notifications automatiques changements statut  
   - Métriques temps moyen par statut

4. Frontend :
   - Timeline visuelle progression commande
   - Actions contextuelles selon statut et rôle
   - Mise à jour temps réel

Assure-toi que les transitions respectent la logique métier réelle.
```

---

### **ONEE-010** ⚡ **FONCTIONNALITÉ**
**Titre** : Recherche et filtrage avancés  
**Story Points** : 5  
**Priorité** : P1 - UX MVP  

**Description** : Améliorer recherche restaurants avec filtres avancés (cuisine, prix, distance, note) pour UX complète.

**Prompt Claude Code** :
```
Implémente la recherche avancée OneEats :

1. Backend search :
   - Endpoint GET /api/restaurants/search avec query params
   - Filtres : cuisine, prix min/max, distance, note min, ouvert/fermé
   - Full-text search sur nom/description (PostgreSQL)
   - Tri par pertinence, distance, note

2. Géolocalisation basique :
   - Calcul distance avec coordonnées GPS
   - Filtrage par rayon (1km, 5km, 10km)
   - Mock coordonnées pour restaurants test

3. Frontend web :
   - Interface filtres avec facettes
   - Autocomplete recherche textuelle
   - Sauvegarde préférences utilisateur

4. Mobile :
   - Recherche avec géolocalisation automatique
   - Filtres mobile-friendly (bottom sheet)
   - Historique recherches

Focus sur fonctionnalités démo impressionnantes pour clients.
```

---

## 🔐 **SPRINT 3 - SÉCURITÉ (Semaine 3)**
*Authentification et sécurisation avant production*

### **ONEE-001** 🔐 **SÉCURITÉ**
**Titre** : Implémenter l'authentification JWT complète  
**Story Points** : 8  
**Priorité** : P1 - Sécurité MVP  

**Description** : Ajouter authentification JWT en surcouche sur l'application fonctionnelle existante.

**Acceptance Criteria** :
- [ ] Endpoints `/api/auth/login`, `/api/auth/register`, `/api/auth/logout` fonctionnels
- [ ] Génération et validation JWT tokens
- [ ] Middleware de vérification sur endpoints protégés
- [ ] Migration frontend/mobile vers auth réelle

**Prompt Claude Code** :
```
Implémente l'authentification JWT sur OneEats EXISTANT :

1. Crée domaine auth :
   - AuthResource avec endpoints login/register/logout/profile
   - AuthService pour logique métier (vérification credentials, génération JWT)
   - JWTService pour création/validation tokens avec rôles

2. Sécurise APIs existantes :
   - Ajoute @RolesAllowed sur endpoints selon règles métier
   - Vérifie ownership (user ses commandes, restaurant ses menus)
   - Configuration CORS mise à jour

3. Migration frontend web :
   - Ajoute écran login/register
   - Intègre JWT tokens dans service API existant
   - Gestion déconnexion automatique (token expiré)

4. Migration mobile :
   - Remplace AuthContext mock par vraie authentification
   - AsyncStorage pour JWT tokens
   - Gestion refresh token

IMPORTANT : L'app fonctionne déjà sans auth, ajoute auth comme couche sécurité.
```

---

### **ONEE-007** 🔧 **TECHNIQUE**
**Titre** : Tests automatisés critiques  
**Story Points** : 5  
**Priorité** : P1 - Qualité MVP  

**Description** : Tests essentiels pour assurer MVP stable (pas couverture complète, juste critical path).

**Prompt Claude Code** :
```
Implémente les tests critiques OneEats MVP :

1. Tests backend essentiels :
   - OrderService : création/validation commandes
   - AuthService : login/register/JWT validation
   - Tests intégration endpoints critiques (/api/orders, /api/auth)

2. Tests E2E scenarios MVP :
   - Flux complet : mobile commande → backend → dashboard restaurant
   - Tests authentification et autorisations
   - Tests changements statuts commandes

3. Setup CI basique :
   - GitHub Actions pour tests backend sur PR
   - Tests bloquants sur branches main
   - Pas de tests frontend pour l'instant (manuel)

FOCUS : Stabilité MVP, pas couverture complète. Tests complets en post-MVP.
```

---

## 🚀 **SPRINT 4 - DÉPLOIEMENT (Semaine 4)**
*Préparation production et finitions*

### **ONEE-008** 🚀 **DÉPLOIEMENT**
**Titre** : Configuration environnements (dev/staging/prod)  
**Story Points** : 5  
**Priorité** : P2 - Déploiement MVP  

**Description** : Setup environnements multiples avec configuration appropriée.

**Prompt Claude Code** :
```
Configure les environnements OneEats pour déploiement :

1. Profils Quarkus :
   - application-dev.yml (DB local, logs debug, sécurité allégée)
   - application-staging.yml (DB staging, logs normal, sécurité prod)  
   - application-prod.yml (DB prod, logs JSON, sécurité maximale)

2. Configuration CI/CD :
   - GitHub Actions pour build/test/deploy
   - Deploy automatique staging sur push main
   - Deploy manuel production avec approbation

3. Infrastructure :
   - Docker Compose pour dev/staging
   - Scripts déploiement Kubernetes prod
   - Variables secrets par environnement

4. Monitoring :
   - Health checks différenciés par env
   - Métriques Prometheus par environnement
   - Alertes critiques production

Teste le pipeline complet dev → staging → prod.
```

---

### **ONEE-009** 🔧 **TECHNIQUE**
**Titre** : Optimisation performances  
**Story Points** : 5  
**Priorité** : P2 - Performance MVP  

**Description** : Optimisations pour supporter charge utilisateurs réelle.

**Prompt Claude Code** :
```
Optimise les performances OneEats pour production :

1. Backend optimisations :
   - Cache Redis pour restaurants/menus consultés
   - Index database sur requêtes fréquentes
   - Connection pooling optimisé PostgreSQL
   - Lazy loading relations JPA

2. API optimisations :
   - Pagination systématique avec liens hypermedia
   - Compression responses (gzip)
   - ETags pour cache HTTP
   - Rate limiting configuré par endpoint

3. Frontend optimisations :
   - Code splitting React avec lazy loading
   - Image optimization et lazy loading
   - Service Worker pour cache offline
   - Bundle analysis et tree shaking

4. Mobile optimisations :
   - Utilise les optimisations performance existantes
   - Cache AsyncStorage intelligent
   - Images optimized avec cache

Mesure et documente les améliorations performance obtenues.
```

---

## 🎨 **SPRINT 4 - UX/POLISH (Semaine 4)**
*Finitions et expérience utilisateur*

### **ONEE-010** 🎨 **UX**
**Titre** : Recherche et filtrage avancés  
**Story Points** : 5  
**Priorité** : P2 - UX MVP  

**Description** : Améliorer recherche restaurants avec filtres avancés (cuisine, prix, distance, note).

**Prompt Claude Code** :
```
Implémente la recherche avancée OneEats :

1. Backend search :
   - Endpoint GET /api/restaurants/search avec query params
   - Filtres : cuisine, prix min/max, distance, note min, ouvert/fermé
   - Full-text search sur nom/description (PostgreSQL)
   - Tri par pertinence, distance, note

2. Géolocalisation :
   - Calcul distance avec coordonnées GPS
   - API géocodage pour adresses
   - Filtrage par rayon (1km, 5km, 10km)

3. Frontend web :
   - Interface filtres avec facettes
   - Autocomplete recherche textuelle
   - Sauvegarde préférences utilisateur

4. Mobile :
   - Recherche avec géolocalisation automatique
   - Filtres mobile-friendly (bottom sheet)
   - Historique recherches

Optimise pour performance avec beaucoup de restaurants.
```

---

### **ONEE-011** 🎨 **UX**  
**Titre** : Système de favoris et historique  
**Story Points** : 3  
**Priorité** : P3 - Nice to have MVP  

**Description** : Permettre aux clients de sauvegarder restaurants favoris et voir historique commandes.

**Prompt Claude Code** :
```
Implémente le système favoris et historique OneEats :

1. Backend features :
   - Table user_favorite_restaurants (user_id, restaurant_id, created_at)
   - Endpoints POST/DELETE /api/users/favorites/{restaurantId}
   - GET /api/users/orders/history avec pagination

2. Logique métier :
   - Éviter doublons favoris
   - Historique trié par date récente
   - Statistiques utilisateur (restaurant le + commandé)

3. Frontend web :
   - Page favoris utilisateur
   - Historique commandes avec détails
   - Bouton favori sur cartes restaurants

4. Mobile :
   - Écran favoris avec accès rapide
   - Historique avec search/filtres
   - Widget "commander à nouveau"

Focus sur UX fluide et données utiles utilisateur.
```

---

### **ONEE-012** 🎨 **UX**
**Titre** : Système de review et ratings  
**Story Points** : 5  
**Priorité** : P3 - Nice to have MVP  

**Description** : Permettre aux clients de noter et commenter restaurants après commande.

**Prompt Claude Code** :
```
Implémente le système de reviews OneEats :

1. Modèle données :
   - Table review (user_id, restaurant_id, order_id, rating, comment, created_at)
   - Contrainte : 1 review par commande
   - Rating 1-5 étoiles obligatoire, commentaire optionnel

2. Backend logic :
   - Endpoint POST /api/reviews (après commande terminée)
   - Calcul rating moyen restaurant automatique
   - Modération basique (mots interdits)

3. Frontend features :
   - Modal review après commande terminée
   - Affichage reviews sur page restaurant
   - Système signalement reviews inappropriées

4. Business rules :
   - Review possible seulement après commande récupérée
   - Modification review possible 24h
   - Réponse restaurant possible

Assure-toi que le système encourage reviews constructives.
```

---

## 📊 **BACKLOG OPTIONNEL - POST-MVP**
*Fonctionnalités avancées pour versions futures*

### **ONEE-013** 📊 **POST-MVP**
**Titre** : Analytics et dashboard admin avancé  
**Story Points** : 8  
**Priorité** : P4 - Future  

**Description** : Dashboard admin avec KPIs, métriques business et analytics avancées.

### **ONEE-014** 📊 **POST-MVP**  
**Titre** : Intégration paiement en ligne  
**Story Points** : 13  
**Priorité** : P4 - Future  

**Description** : Intégration Stripe/PayPal pour paiement en ligne (évolution du "paiement sur place").

### **ONEE-015** 📊 **POST-MVP**
**Titre** : Système de livraison  
**Story Points** : 21  
**Priorité** : P4 - Future  

**Description** : Évolution vers livraison avec tracking livreurs, estimation temps, etc.

---

## 📈 **MÉTRIQUES SPRINT & VÉLOCITÉ**

### **Estimation Vélocité - NOUVELLE APPROCHE**
- **Sprint 1 - INTÉGRATION** : 13 story points (connexion frontend/backend)
- **Sprint 2 - FONCTIONNALITÉS** : 16 story points (upload, notifications, recherche)  
- **Sprint 3 - SÉCURITÉ** : 18 story points (auth JWT + tests critiques)
- **Sprint 4 - DÉPLOIEMENT** : 13 story points (config environnements + finitions)
- **Total MVP** : 60 story points (~4 semaines)

### **🎯 Avantages Nouvel Ordre**
- **Semaine 1** : MVP démontrable sans auth (présentation client possible)
- **Semaine 2** : MVP complet fonctionnellement (UX riche)
- **Semaine 3** : MVP sécurisé (prêt production)
- **Semaine 4** : MVP déployable (production ready)

### **Définition de "Done"**
- [ ] Code développé et testé
- [ ] Tests automatisés passent
- [ ] Code review effectué
- [ ] Documentation mise à jour
- [ ] Déployé en staging et testé
- [ ] Validation métier obtenue

---

## 🚀 **COMMENT UTILISER CE BACKLOG**

### **1. Priorisation**
Suivez l'ordre des sprints. Les tâches **CRITIQUE** bloquent le MVP.

### **2. Prompts Claude Code**
Copiez-collez directement les prompts dans Claude Code pour exécuter les tâches.

### **3. Adaptation**
Ajustez les priorités selon vos contraintes business/techniques.

### **4. Suivi**
Marquez les tâches complètes et adaptez la vélocité selon votre rythme.

**Avec ce backlog, votre MVP OneEats sera fonctionnel et prêt pour les premiers utilisateurs ! 🎯**