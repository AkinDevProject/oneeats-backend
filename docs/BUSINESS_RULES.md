# 📋 Règles Métier - OneEats

## 🎯 Vision du Projet

OneEats est une **plateforme de commande de plats à récupérer sur place** (MVP).

**Vision MVP** :
- ✅ Commande de plats via application mobile
- ✅ Gestion des menus et commandes par les restaurants (interface web)
- ✅ Administration et statistiques de la plateforme
- ❌ **Pas de livraison** (récupération sur place uniquement)
- ❌ **Pas de paiement en ligne** (paiement sur place uniquement)

---

## 👥 Acteurs et Permissions

> **📖 Use Cases associés** : [UC-001 (Inscription)](USE_CASES.md#uc-001--créer-un-compte-client), [UC-002 (Connexion)](USE_CASES.md#uc-002--se-connecter-à-lapplication), [UC-008 (Profil)](USE_CASES.md#uc-008--gérer-son-profil-utilisateur)

### Client (Mobile)
**Rôle** : Utilisateur final qui passe des commandes

**Permissions** :
- Consulter les restaurants (recherche, filtrage)
- Consulter les menus par catégories
- Ajouter des articles au panier
- Passer des commandes avec instructions spéciales
- Suivre le statut de ses commandes
- Gérer son profil et ses préférences

**Restrictions** :
- Ne peut pas modifier les menus
- Ne peut pas voir les commandes d'autres clients
- Ne peut pas accéder à l'interface d'administration

---

### Restaurant (Web Dashboard)
**Rôle** : Propriétaire ou gestionnaire de restaurant

**Permissions** :
- Gérer le profil restaurant (nom, description, horaires, coordonnées)
- Créer et modifier les menus (catégories, articles, prix, images)
- Gérer les catégories de menu
- Recevoir et traiter les commandes
- Mettre à jour les statuts de commandes
- Marquer des articles comme disponibles/indisponibles
- Ouvrir/fermer le restaurant manuellement
- Consulter les statistiques de son restaurant

**Restrictions** :
- Ne peut modifier que son propre restaurant
- Ne peut voir que les commandes de son restaurant
- Ne peut pas accéder aux données des autres restaurants
- Ne peut pas suspendre/activer son compte (admin seulement)

---

### Administrateur (Web Dashboard)
**Rôle** : Gestionnaire de la plateforme

**Permissions** :
- Gérer tous les comptes restaurants (validation, suspension, activation)
- Superviser toutes les commandes de la plateforme
- Consulter les statistiques globales
- Modérer les contenus (menus, descriptions, images)
- Gérer les utilisateurs (clients et restaurants)
- Accéder à tous les restaurants et menus

**Restrictions** :
- Ne peut pas passer de commandes client
- Doit respecter les données sensibles (RGPD)

---

## 🛒 Gestion des Commandes

> **📖 Use Cases associés** :
> - **Client** : [UC-004 (Commander)](USE_CASES.md#uc-004--commander-un-repas), [UC-005 (Suivre)](USE_CASES.md#uc-005--suivre-une-commande-en-temps-réel), [UC-006 (Annuler)](USE_CASES.md#uc-006--annuler-une-commande), [UC-007 (Historique)](USE_CASES.md#uc-007--consulter-lhistorique-des-commandes)
> - **Restaurateur** : [UC-101 (Recevoir)](USE_CASES.md#uc-101--recevoir-et-consulter-les-commandes), [UC-102 (Accepter/Refuser)](USE_CASES.md#uc-102--accepter-ou-refuser-une-commande), [UC-103 (Gérer cycle de vie)](USE_CASES.md#uc-103--gérer-le-cycle-de-vie-dune-commande)

### Cycle de vie d'une commande

```
[EN_ATTENTE] → [EN_PREPARATION] → [PRETE] → [RECUPEREE]
      ↓
  [ANNULEE]
```

### Règles de transition

| De              | Vers           | Qui peut effectuer | Condition                          |
|-----------------|----------------|-------------------|-------------------------------------|
| EN_ATTENTE      | EN_PREPARATION | Restaurant        | Commande validée par le restaurant  |
| EN_ATTENTE      | ANNULEE        | Client/Restaurant | Avant préparation uniquement        |
| EN_PREPARATION  | PRETE          | Restaurant        | Préparation terminée                |
| EN_PREPARATION  | ANNULEE        | Restaurant        | Problème de préparation             |
| PRETE           | RECUPEREE      | Restaurant        | Client a récupéré la commande       |
| PRETE           | ANNULEE        | Restaurant        | Client n'a pas récupéré (abandon)   |

### Règles métier commandes

- **Création commande** :
  - Le panier ne peut pas être vide
  - Tous les articles doivent être disponibles (isAvailable = true)
  - Le restaurant doit être ouvert (isOpen = true)
  - Le restaurant doit être actif (isActive = true)
  - Le client doit être authentifié

- **Modification commande** :
  - Une commande ne peut être modifiée qu'en statut EN_ATTENTE
  - Après passage à EN_PREPARATION, aucune modification n'est possible

- **Annulation commande** :
  - Le client peut annuler jusqu'à EN_PREPARATION (non inclus)
  - Le restaurant peut annuler à tout moment avant RECUPEREE
  - Une commande RECUPEREE ne peut pas être annulée

- **Calculs** :
  - Prix total = Somme(quantité × prix unitaire de chaque article)
  - Pas de frais de livraison (récupération sur place)
  - Pas de taxes additionnelles (prix TTC inclus dans le prix des articles)

---

## 🍽️ Gestion des Menus

> **📖 Use Cases associés** : [UC-104 (Gérer le menu)](USE_CASES.md#uc-104--gérer-le-menu-du-restaurant)

### Articles de Menu (MenuItem)

**Règles de validation** :
- Le nom doit être unique par restaurant
- Le prix doit être > 0
- La catégorie est obligatoire
- La description est optionnelle mais recommandée
- Le temps de préparation est optionnel

**Options diététiques** :
- isVegetarian : Plat végétarien (sans viande ni poisson)
- isVegan : Plat végétalien (sans produits animaux)
- allergens : Liste des allergènes (tableau de chaînes)
  - Exemples : "gluten", "lactose", "arachides", "fruits à coque", "soja", "œufs", "poisson", "crustacés"

**Disponibilité** :
- Un article peut être marqué indisponible temporairement (rupture de stock)
- Les articles indisponibles ne peuvent pas être ajoutés au panier
- Les articles dans un panier qui deviennent indisponibles doivent être retirés

### Catégories de Menu

**Catégories standards** :
- Entrées
- Plats principaux
- Desserts
- Boissons
- Accompagnements

**Règles** :
- Les catégories sont définies par le restaurant
- Une catégorie vide (sans articles) peut exister
- L'ordre d'affichage peut être personnalisé

---

## 🏪 Gestion des Restaurants

> **📖 Use Cases associés** :
> - **Restaurateur** : [UC-105 (Modifier statut)](USE_CASES.md#uc-105--modifier-le-statut-du-restaurant)
> - **Admin** : [UC-201 (Valider restaurant)](USE_CASES.md#uc-201--valider-un-nouveau-restaurant), [UC-202 (Gérer restaurants)](USE_CASES.md#uc-202--gérer-les-restaurants-bloqueractiver)

### Profil Restaurant

**Informations obligatoires** :
- Nom (unique dans la plateforme)
- Description
- Adresse complète
- Numéro de téléphone
- Email de contact
- Type de cuisine (cuisineType)

**Informations optionnelles** :
- Image de couverture
- Horaires d'ouverture (schedule hebdomadaire)
- Note moyenne (rating, calculée automatiquement)

### État du Restaurant

**isOpen** (Ouvert/Fermé) :
- Contrôlé manuellement par le restaurant
- Un restaurant fermé ne peut pas recevoir de commandes
- Les clients voient le statut en temps réel

**isActive** (Actif/Inactif) :
- Contrôlé par l'administrateur uniquement
- Un restaurant inactif n'apparaît pas dans les recherches
- Les commandes en cours restent visibles même si inactif

**Horaires (schedule)** :
- Format JSON avec horaires pour chaque jour
- Exemple : `{ "lundi": { "ouverture": "11:00", "fermeture": "22:00" }, ... }`
- Si aucun horaire n'est défini, le restaurant peut ouvrir manuellement

### Validation de Restaurant

**Règles d'acceptation des commandes** :
- Le restaurant doit être `isOpen = true`
- Le restaurant doit être `isActive = true`
- Au moins un article disponible dans le menu
- Les informations de contact doivent être complètes

---

## 👤 Gestion des Utilisateurs

> **📖 Use Cases associés** :
> - **Client** : [UC-001 (Inscription)](USE_CASES.md#uc-001--créer-un-compte-client), [UC-002 (Connexion)](USE_CASES.md#uc-002--se-connecter-à-lapplication), [UC-008 (Gérer profil)](USE_CASES.md#uc-008--gérer-son-profil-utilisateur)
> - **Admin** : [UC-203 (Gérer utilisateurs)](USE_CASES.md#uc-203--gérer-les-utilisateurs)

### Inscription

**Client** :
- Email unique (validation format email)
- Mot de passe (hashé avec BCrypt ou similaire)
- Prénom et nom
- Téléphone (optionnel)
- Adresse (optionnelle, peut être ajoutée plus tard)

**Restaurant** :
- Processus d'inscription spécifique (à définir)
- Validation manuelle par administrateur requise
- Informations légales (SIRET, etc.) à fournir

### Authentification

**JWT Token** :
- Durée de validité : 24 heures (à configurer)
- Refresh token : 7 jours (à configurer)
- Rôles stockés dans le token : CLIENT, RESTAURANT, ADMIN

**Règles de sécurité** :
- Maximum 5 tentatives de connexion échouées → blocage 15 minutes
- Mot de passe : minimum 8 caractères (validation côté frontend et backend)
- Session unique par utilisateur (option à configurer)

### Profil Utilisateur

**Modification autorisée** :
- Prénom, nom, téléphone, adresse
- Mot de passe (avec vérification de l'ancien mot de passe)
- Email (avec validation par nouveau email)

**Suppression de compte** :
- Le client peut supprimer son compte
- Les commandes passées restent anonymisées dans l'historique
- Données conservées selon RGPD (30 jours avant suppression définitive)

---

## 🔍 Recherche et Filtrage

> **📖 Use Cases associés** : [UC-003 (Rechercher un restaurant)](USE_CASES.md#uc-003--rechercher-un-restaurant)

### Recherche de Restaurants

**Critères de recherche** :
- Nom du restaurant (recherche textuelle)
- Type de cuisine (cuisineType)
- Distance (basée sur la localisation du client) - fonctionnalité future
- Note minimale (rating)
- Statut ouvert/fermé (isOpen)

**Tri** :
- Par distance (fonctionnalité future)
- Par note (rating décroissant)
- Par nom (alphabétique)
- Par temps de préparation moyen

### Filtres Menu

**Par catégorie** :
- Afficher uniquement les articles d'une catégorie
- Comptage du nombre d'articles par catégorie

**Par préférences alimentaires** :
- Articles végétariens (isVegetarian)
- Articles végétaliens (isVegan)
- Sans allergène spécifique (exclusion par allergen)

**Par disponibilité** :
- Afficher uniquement les articles disponibles (isAvailable = true)
- Masquer les articles en rupture

---

## 📊 Statistiques et Métriques

> **📖 Use Cases associés** :
> - **Restaurateur** : [UC-106 (Stats restaurant)](USE_CASES.md#uc-106--consulter-les-statistiques-du-restaurant)
> - **Admin** : [UC-204 (Tableau de bord global)](USE_CASES.md#uc-204--consulter-le-tableau-de-bord-global), [UC-205 (Exporter statistiques)](USE_CASES.md#uc-205--exporter-les-statistiques)

### Statistiques Restaurant

**Métriques calculées** :
- Nombre total de commandes
- Montant total des ventes
- Note moyenne (rating)
- Nombre d'articles dans le menu
- Taux d'annulation de commandes
- Temps moyen de préparation

### Statistiques Client

**Métriques calculées** :
- Nombre total de commandes passées
- Montant total dépensé
- Restaurants favoris (les plus commandés)
- Historique des commandes

### Statistiques Admin

**Métriques globales** :
- Nombre total de restaurants actifs
- Nombre total de clients
- Nombre total de commandes (par statut)
- Chiffre d'affaires total de la plateforme
- Taux de croissance (hebdomadaire, mensuel)

---

## 🔔 Notifications

> **📖 Use Cases associés** : [UC-005 (Suivre commande en temps réel)](USE_CASES.md#uc-005--suivre-une-commande-en-temps-réel)

### Notifications Clients

**Événements notifiés** :
- Commande confirmée par le restaurant (EN_ATTENTE → EN_PREPARATION)
- Commande prête à récupérer (EN_PREPARATION → PRETE)
- Commande annulée par le restaurant
- Promotions et offres spéciales (optionnel, avec consentement)

### Notifications Restaurant

**Événements notifiés** :
- Nouvelle commande reçue (EN_ATTENTE)
- Commande annulée par le client
- Avis client laissé (fonctionnalité future)

---

## ⚠️ Règles de Sécurité et Confidentialité

### RGPD

- Consentement explicite pour les emails marketing
- Droit à l'oubli : suppression des données sous 30 jours
- Export des données personnelles sur demande
- Données minimum collectées (privacy by design)

### Sécurité des Données

- Mots de passe toujours hashés (jamais en clair)
- Communications API en HTTPS uniquement (production)
- Validation des inputs côté backend (protection injection SQL, XSS)
- Rate limiting sur les endpoints publics (protection DDoS)

### Autorisations

- Un utilisateur ne peut accéder qu'à ses propres données
- Les restaurants ne voient que leurs propres commandes
- L'administrateur a accès complet mais audité (logs d'accès)

---

## 🚀 Évolutions Futures (Hors MVP)

Les fonctionnalités suivantes sont prévues mais **hors scope du MVP** :

- 🚚 **Livraison à domicile** : Intégration service de livraison
- 💳 **Paiement en ligne** : Stripe, PayPal
- ⭐ **Système d'avis** : Notes et commentaires clients
- 🎁 **Programme de fidélité** : Points et récompenses
- 📍 **Géolocalisation avancée** : Recherche par distance réelle
- 🔔 **Notifications push temps réel** : WebSocket pour mises à jour instantanées
- 📊 **Analytics avancées** : Dashboards interactifs pour restaurants et admin
- 🤖 **Recommandations IA** : Suggestions personnalisées de plats

---

## 📅 Dernière mise à jour

**Date** : 2025-12-12
**Version** : MVP 1.0
**Responsable** : Équipe OneEats
