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

## 🔥 **SPRINT 1 - CRITIQUE (Semaine 1)**
*Tâches bloquantes pour un MVP fonctionnel*

### **ONEE-001** 🚨 **CRITIQUE**
**Titre** : Implémenter l'authentification JWT complète  
**Story Points** : 8  
**Priorité** : P0 - Bloquant MVP  

**Description** : Actuellement l'authentification est désactivée. Implémenter JWT + endpoints auth pour permettre login/register des utilisateurs.

**Acceptance Criteria** :
- [ ] Endpoints `/api/auth/login`, `/api/auth/register`, `/api/auth/logout` fonctionnels
- [ ] Génération et validation JWT tokens
- [ ] Middleware de vérification sur endpoints protégés
- [ ] Tests d'intégration auth

**Prompt Claude Code** :
```
Implémente l'authentification JWT complète pour OneEats :

1. Crée un domaine `auth` avec :
   - AuthResource avec endpoints login/register/logout/profile
   - AuthService pour logique métier (vérification credentials, génération JWT)
   - JWTService pour création/validation tokens
   
2. Configure la sécurité :
   - Middleware JWT pour vérifier tokens sur endpoints protégés
   - Gestion des rôles USER/RESTAURANT_OWNER/ADMIN
   - Configuration CORS mise à jour

3. Sécurise les endpoints existants :
   - Ajoute @RolesAllowed sur tous les endpoints selon règles métier
   - Vérifie ownership (user ne peut voir que ses commandes, etc.)

4. Tests :
   - Tests unitaires AuthService
   - Tests d'intégration endpoints auth
   - Tests sécurité (tentatives accès non autorisé)

Utilise les patterns existants (Order, User) et assure-toi que l'auth s'intègre bien avec le frontend.
```

---

### **ONEE-002** 🚨 **CRITIQUE** 
**Titre** : Connecter frontend web aux vraies APIs  
**Story Points** : 5  
**Priorité** : P0 - Bloquant MVP  

**Description** : Le dashboard restaurant utilise des données mockées. Connecter aux vraies APIs backend pour un fonctionnement réel.

**Acceptance Criteria** :
- [ ] Remplacer tous les mock data par vrais appels API
- [ ] Gestion d'erreurs réseau appropriée  
- [ ] Loading states pendant requêtes
- [ ] Authentification intégrée dans les appels

**Prompt Claude Code** :
```
Connecte le frontend web OneEats aux vraies APIs backend :

1. Analyse le dashboard restaurant dans apps/web/ et identifie tous les mock data

2. Remplace par vrais appels API :
   - Services API pour restaurants, menus, commandes
   - Intégration authentification (JWT tokens dans headers)
   - Gestion états loading/error/success

3. Configuration environnement :
   - Variables d'environnement pour URL API
   - Configuration axios ou fetch avec intercepteurs auth

4. Tests intégration :
   - Teste toutes les fonctionnalités avec vrai backend
   - Vérifie gestion erreurs (réseau, auth, validation)

Assure-toi que toutes les fonctionnalités dashboard fonctionnent avec les vraies APIs.
```

---

### **ONEE-003** 🚨 **CRITIQUE**
**Titre** : Connecter app mobile aux vraies APIs  
**Story Points** : 5  
**Priorité** : P0 - Bloquant MVP  

**Description** : L'app mobile utilise des données mockées. Connecter aux vraies APIs pour permettre vraies commandes.

**Acceptance Criteria** :
- [ ] Contexts (Auth, Order, Restaurant) utilisent vraies APIs
- [ ] Authentification mobile fonctionnelle
- [ ] Passage de commandes réel jusqu'en base
- [ ] Synchronisation états avec backend

**Prompt Claude Code** :
```
Connecte l'application mobile OneEats aux vraies APIs backend :

1. Configure l'intégration API :
   - URL backend adaptée mobile (10.0.2.2 pour Android emulator)
   - Service API centralisé avec gestion auth
   - AsyncStorage pour persistence tokens JWT

2. Mise à jour des Contexts :
   - AuthContext : login/register via API
   - OrderContext : CRUD commandes réelles
   - RestaurantContext : données restaurants depuis API

3. Gestion réseau mobile :
   - Offline support basique avec AsyncStorage
   - Retry automatique sur erreurs réseau
   - Loading states et error handling

4. Tests sur émulateurs :
   - Teste flux complet commande client
   - Vérifie synchronisation avec dashboard restaurant

Focus sur les user journeys critiques : inscription, recherche restaurants, commande, suivi.
```

---

## ⚡ **SPRINT 2 - IMPORTANT (Semaine 2)**
*Fonctionnalités importantes pour expérience utilisateur*

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

## 🔧 **SPRINT 3 - TECHNIQUE (Semaine 3)**
*Améliorations techniques et performance*

### **ONEE-007** 🔧 **TECHNIQUE**
**Titre** : Tests automatisés complets  
**Story Points** : 8  
**Priorité** : P2 - Qualité MVP  

**Description** : Couverture test complète pour assurer qualité et non-régression.

**Prompt Claude Code** :
```
Implémente la stratégie de tests complète OneEats :

1. Tests unitaires backend :
   - Services métier (OrderService, RestaurantService, etc.)
   - Mappers et validators
   - Couverture >80% domaines critiques

2. Tests intégration :
   - Endpoints REST avec RestAssured
   - Tests base de données avec @Transactional
   - Tests sécurité (auth, autorisations)

3. Tests frontend :
   - Composants React avec Testing Library
   - Tests integration API calls
   - Tests mobile avec Detox (basique)

4. Tests E2E :
   - Scenarios critiques (commande complète)
   - Tests cross-platform (web + mobile)
   - CI/CD integration GitHub Actions

Configure pipeline CI qui bloque merge si tests échouent.
```

---

### **ONEE-008** 🔧 **TECHNIQUE**
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

### **Estimation Vélocité**
- **Sprint 1** : 18 story points (critique)
- **Sprint 2** : 16 story points (important)  
- **Sprint 3** : 18 story points (technique)
- **Sprint 4** : 13 story points (UX)
- **Total MVP** : 65 story points (~4 semaines)

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