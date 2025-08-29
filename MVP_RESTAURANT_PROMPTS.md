# OneEats Restaurant MVP - Prompts de Développement

Ce document contient les prompts détaillés pour compléter le MVP de la partie restaurant de OneEats.

## 🔐 1. Authentification et Sécurité

### 1.1 Configuration JWT Backend
```
Peux-tu configurer l'authentification JWT dans le backend Quarkus ? Je veux :
- Créer un endpoint /auth/login qui accepte email/password
- Générer un token JWT avec les informations utilisateur (id, email, role)
- Protéger les endpoints restaurant avec @RolesAllowed("restaurant")
- Configurer la durée du token à 24h
- Ajouter la validation des tokens dans les headers Authorization Bearer
```

### 1.2 Hook Frontend avec JWT
```
Modifie le hook useAuth pour utiliser l'API JWT au lieu des mocks :
- Connecte la fonction login() à l'endpoint /auth/login
- Stocke le token JWT dans localStorage
- Ajoute le token aux headers des requêtes API automatiquement
- Implémente la déconnexion automatique à l'expiration
- Gère les erreurs d'authentification (401/403)
```

### 1.3 Protection des Routes API
```
Sécurise tous les endpoints restaurant dans le backend :
- RestaurantResource : seul le propriétaire peut modifier son restaurant
- MenuResource : seul le restaurant propriétaire peut gérer son menu
- OrderResource : seul le restaurant concerné voit ses commandes
- Ajoute la validation @Valid sur tous les DTOs
- Implémente la gestion d'erreurs avec messages clairs
```

## 🔌 2. Intégration API Frontend-Backend

### 2.1 Remplacement des Mocks - Menu
```
Remplace les données mock dans MenuPage.tsx par des appels API réels :
- Utilise apiService.menuItems.getByRestaurant() au chargement
- Connecte handleSubmit() à apiService.menuItems.create/update()
- Implémente la suppression avec apiService.menuItems.delete()
- Ajoute les états de loading et d'erreur
- Affiche des notifications de succès/échec
- Récupère le restaurantId depuis le contexte utilisateur connecté
```

### 2.2 Remplacement des Mocks - Commandes
```
Connecte OrdersManagementPage.tsx aux vraies API :
- Charge les commandes avec apiService.orders.getByRestaurant()
- Implémente la mise à jour de statut avec apiService.orders.updateStatus()
- Ajoute un polling automatique toutes les 30 secondes pour les nouvelles commandes
- Gère les états de chargement et les erreurs réseau
- Affiche le nombre réel de commandes en attente dans la navigation
```

### 2.3 Remplacement des Mocks - Paramètres Restaurant
```
Connecte RestaurantSettingsPage.tsx à l'API :
- Charge les données avec apiService.restaurants.getByOwner()
- Sauvegarde avec apiService.restaurants.update()
- Implémente le toggle ouvert/fermé avec apiService.restaurants.updateStatus()
- Ajoute la validation des horaires côté frontend
- Gère la persistance des modifications en temps réel
```

## 📸 3. Gestion d'Images

### 3.1 Upload Backend - Quarkus
```
Crée un système d'upload d'images dans Quarkus :
- Ajoute un endpoint POST /api/uploads/restaurant-logo/{restaurantId}
- Accepte les fichiers multipart/form-data
- Valide le format (JPG, PNG, WebP) et la taille (max 5MB)
- Stocke les images dans /uploads/restaurants/
- Retourne l'URL publique de l'image
- Configure la sécurisation pour que seul le propriétaire puisse uploader
```

### 3.2 Upload Frontend - Logo Restaurant
```
Ajoute l'upload de logo dans RestaurantSettingsPage.tsx :
- Remplace le placeholder par un input file caché
- Implémente la prévisualisation avant upload
- Ajoute une barre de progression pendant l'upload
- Appelle l'API d'upload et sauvegarde l'URL retournée
- Gère les erreurs (format incorrect, taille dépassée)
- Affiche le logo existant s'il y en a un
```

### 3.3 Upload Frontend - Images de Plats
```
Ajoute l'upload d'images dans MenuPage.tsx :
- Modifie le modal d'ajout/modification de plat
- Ajoute un champ image avec prévisualisation
- Implémente l'upload vers /api/uploads/menu-item/{itemId}
- Affiche les images dans les MenuItemCard
- Remplace le placeholder ImageIcon par les vraies images
- Gère le cas où il n'y a pas d'image (fallback)
```

## 🔔 4. Système de Notifications Temps Réel

### 4.1 WebSocket Backend
```
Implémente WebSocket dans Quarkus pour les notifications temps réel :
- Configure @ServerEndpoint("/ws/restaurant/{restaurantId}")
- Crée un système de rooms par restaurant
- Envoie une notification quand une nouvelle commande arrive
- Notifie les changements de statut de commande
- Gère la connexion/déconnexion des clients
- Sécurise avec validation du token JWT
```

### 4.2 WebSocket Frontend - Hook
```
Crée un hook useWebSocket pour la connexion temps réel :
- Établit la connexion WebSocket avec le token d'auth
- Reconnexion automatique en cas de déconnexion
- Écoute les événements "new_order" et "order_status_changed"
- Retourne les callbacks pour gérer les notifications
- Gère les états de connexion (connecting, connected, disconnected)
```

### 4.3 Notifications UI Frontend
```
Intègre les notifications dans l'interface restaurant :
- Ajoute un composant NotificationToast
- Affiche une notification quand une nouvelle commande arrive
- Met à jour automatiquement la liste des commandes
- Ajoute un son de notification (optionnel)
- Met à jour le badge du nombre de commandes en attente
- Affiche l'état de connexion WebSocket dans la sidebar
```

## ⚡ 5. Fonctionnalités Critiques Manquantes

### 5.1 Gestion des Stocks
```
Ajoute la gestion des ruptures de stock :
- Ajoute un champ "stock" à MenuItem (optionnel, null = illimité)
- Modifie MenuPage.tsx pour permettre la saisie du stock
- Décrémente automatiquement le stock à chaque commande
- Marque automatiquement indisponible quand stock = 0
- Ajoute un indicateur visuel de stock faible (< 5)
- Permet la remise en stock manuelle
```

### 5.2 Temps de Préparation Dynamique
```
Améliore la gestion des temps de préparation :
- Ajoute un champ estimatedPrepTime à MenuItem (en minutes)
- Calcule automatiquement le temps total de la commande
- Permet au restaurant de modifier le temps estimé par commande
- Affiche le temps restant en temps réel côté client
- Envoie une notification quand le temps est écoulé
```

### 5.3 Historique et Analytics Basiques
```
Crée une page d'historique des commandes simple :
- Ajoute un onglet "Historique" dans la navigation restaurant
- Affiche les commandes terminées des 30 derniers jours
- Permet de filtrer par date, statut, client
- Affiche des statistiques basiques : nombre total, CA du jour/semaine
- Exporte en CSV (optionnel)
```

### 5.4 Gestion des Erreurs et Validations
```
Améliore la robustesse de l'application :
- Ajoute des validations complètes côté backend (Bean Validation)
- Implémente un middleware de gestion d'erreurs global
- Ajoute des messages d'erreur utilisateur-friendly
- Crée un composant ErrorBoundary React pour les erreurs JS
- Ajoute des fallbacks pour les images cassées
- Implémente un système de retry automatique pour les requêtes échouées
```

## 🧪 6. Tests et Finalisation MVP

### 6.1 Tests Backend
```
Écris les tests essentiels pour le backend Quarkus :
- Tests d'intégration pour les endpoints REST
- Tests unitaires pour les use cases critiques
- Tests de sécurité (authentification, autorisation)
- Tests de validation des données
- Configuration de test avec base H2 en mémoire
```

### 6.2 Tests Frontend
```
Ajoute les tests React essentiels :
- Tests unitaires pour les hooks useAuth et useApi
- Tests d'intégration pour les pages principales
- Tests du système de notifications WebSocket
- Tests d'accessibilité basiques
- Tests de responsive design
```

### 6.3 Configuration Production
```
Prépare l'app pour la production :
- Configure les variables d'environnement (VITE_API_URL, JWT_SECRET)
- Ajoute un docker-compose pour déploiement
- Configure CORS pour le domaine de production
- Optimise les bundles JavaScript (code splitting)
- Ajoute un health check endpoint
- Configure les logs applicatifs
```

---

## 🚀 Ordre de Priorité Recommandé

1. **Authentification JWT** (1.1 → 1.2 → 1.3)
2. **Intégration API** (2.1 → 2.2 → 2.3)
3. **WebSocket Notifications** (4.1 → 4.2 → 4.3)
4. **Upload Images** (3.1 → 3.2 → 3.3)
5. **Fonctionnalités Critiques** (5.1 → 5.2)
6. **Tests et Production** (6.1 → 6.3)

Chaque prompt peut être utilisé indépendamment. Commencez par celui qui vous semble le plus prioritaire !