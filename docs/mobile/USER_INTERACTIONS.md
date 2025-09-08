# OneEats – Actions Utilisateur & Règles Métier (MVP)

## 📱 ÉCRAN D'ACCUEIL (index.tsx)

### 🧭 Navigation et Recherche

* **Rechercher** : Saisir un texte pour rechercher restaurants ou cuisines.
* **Effacer recherche** : Supprimer le texte avec le bouton X.
* **Actualiser** : Tirer vers le bas pour rafraîchir la liste.
* **Retour arrière** : Navigation avec les boutons système.

### 🎯 Filtres et Tri

* **Trier par** : Distance ou temps de préparation (les restaurants peuvent ne pas proposer la livraison).
* **Filtres rapides** : Ouvert maintenant.
* **Filtres avancés** : Ouvrir/fermer panneau de filtres.
* **Supprimer filtres** : Désélectionner les filtres actifs.

### 🍽️ Catégories de Cuisine

* Tous, Italien, Asiatique, Français, Mexicain.
* Navigation horizontale pour défiler.

### 🍕 Types de Plats

* Pizza, Sushi, Kebab, Hamburger.

### 🏪 Interactions Restaurant

* **Voir restaurant** : Détails menu et informations.
* **Ajouter aux favoris** : Bouton cœur.
* **Voir note** : Affichage étoiles.
* **Voir informations** : Temps de préparation, distance, frais éventuels.

---

## 🏪 ÉCRAN RESTAURANT (\[id].tsx)

### 🎯 Navigation et Actions Générales

* Retour, ajout aux favoris, scroll vertical.

### 🔍 Filtres Rapides

* Entrées, Plats, Desserts, Boissons.

### 🍕 Menu et Articles

* Voir détails article.
* Ajouter au panier, ajuster quantité (+/-).
* Affichage du nombre d’articles.

### 📋 Modale de Personnalisation

* Voir ingrédients.
* Ajouter extras payants.
* Ajuster quantité.
* Annuler ou confirmer ajout.

### 🛒 Panier Flottant

* Voir panier, indication quantité.

---

## 🛒 ÉCRAN PANIER (cart.tsx)

### 🧭 Navigation et Onglets

* Retour, onglet Panier et Commandes.
* Vider panier avec confirmation.

### 📦 Gestion des Articles

* Modifier quantité, supprimer, voir détails.
* Instructions spéciales.

### 🎯 Tendances et Découverte

* Articles populaires, fermer tendances, explorer restaurants.

### 📝 Finalisation Commande

* Instructions spéciales, récapitulatif, choix du paiement.
* Commander, paiement sécurisé.

### 📋 Historique Commandes

* Voir commandes passées, statuts.
* Statuts : En attente de confirmation, En préparation, Prête, Récupérée, Annulée.

### ❌ Annulation d’une commande

* Côté client : tant que non en préparation.
* Côté restaurant : possible pour rupture de stock ou problème technique.
* Paiement : remboursement ou avoir si en ligne, rien si sur place.

### 💡 États Particuliers

* Panier vide, commandes vides, erreurs, chargement.

---

## 🔔 Interactions Système

### 📳 Retour Haptique

* Impact léger/moyen, notifications.

### 🔐 Authentification

* Connexion requise pour commander.
* Redirection vers login si non authentifié.

### 📊 Animations et Feedback

* Slide, Fade, Spring, Slide out, zoom boutons, parallax header.

---

## 💻 Règles Métier & MVP

* **Une commande = un seul restaurant**.
* Pas de paiement intégré (paiement sur place).
* Pas de livraison (uniquement récupération sur place).
* Menu géré par l’équipe OneEats au départ.
* Notifications en temps réel.
* Backend : Quarkus + Postgres.
* Frontend : React Native (Expo), app web pour restaurants.
* Authentification : Google / Apple via Keycloak.
* Statuts simples : En attente, En préparation, Prête, Annulée.
* Annulation côté client limitée avant préparation.
* Administration simple : gestion comptes restaurants, accès commandes, vérification menus.
