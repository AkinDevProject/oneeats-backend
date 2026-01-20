# Spécifications UX/UI - Interfaces Administrateur et Restaurateur

**Projet :** OneEats
**Date :** 9 juillet 2025
**Auteur :** [À remplir par le porteur du projet]
**Destinataire :** UX/UI Designer
**Objectif :** Création de maquettes haute fidélité des interfaces administrateur et restaurateur, dans le cadre du développement d’une plateforme de commande de repas.

---

## Charte visuelle et intentions

- **Style visuel souhaité :** sobre, moderne, professionnel (inspiration : Stripe, Notion, Uber Eats Dashboard)
- **Typographie :** lisible, sans-serif (Inter, Roboto…)
- **Palette :** dominante claire, contrastes lisibles, couleurs secondaires pour les statuts (vert = actif, rouge = erreur, jaune = attente)
- **Icônes :** simples et significatives (Lucide, Heroicons ou similaires)
- **Responsivité :**
  - **Admin :** desktop uniquement
  - **Restaurateur :** desktop + tablette (interface tactile adaptée)

---

## 🧑‍💼 Interface Administrateur

### 1. Page de connexion
- **Composants :**
  - Champ email
  - Champ mot de passe
  - Bouton "Connexion"
  - Message d’erreur (identifiants invalides)
- **Actions :**
  - Authentification via Keycloak
  - Redirection vers `/dashboard`

---

### 2. Dashboard global
- **Composants :**
  - Carte : Nombre de commandes aujourd’hui
  - Carte : Chiffre d’affaires du jour
  - Carte : Restaurants actifs
  - Graphique (commandes / CA sur 7 jours)
  - Bloc d’alertes systèmes (ex. restaurants inactifs)
- **Interactions :**
  - Clic sur chaque carte → lien vers vue détaillée
- **État vide :**
  - "Aucune donnée aujourd’hui" affichée dans les cartes

---

### 3. Gestion des restaurants
- **Composants :**
  - Tableau avec colonnes : nom, email, date d’inscription, statut
  - Filtres : nom, date, statut
  - Boutons : "Valider", "Bloquer", "Supprimer"
  - Modal de confirmation (bloquer/supprimer)
- **États spécifiques :**
  - En attente = jaune
  - Validé = vert
  - Bloqué = rouge
  - Aucun restaurant = message "Aucun restaurant pour le moment"
- **Actions :**
  - Clic sur ligne = vue détaillée du restaurant

---

### 4. Gestion des utilisateurs
- **Composants :**
  - Tableau utilisateurs : nom, email, nb de commandes, date
  - Bouton "Désactiver utilisateur"
  - Export CSV
- **Actions :**
  - Suspension / désactivation
  - Accès au profil utilisateur (facultatif)

---

### 5. Suivi des commandes
- **Composants :**
  - Liste triée par date : ID, restaurant, client, statut
  - Filtres : par statut, date, restaurant
  - Statuts : "En attente", "Préparée", "Annulée"
- **Actions :**
  - Clic sur commande → détail complet

---

### 6. Statistiques
- **Composants :**
  - Graphiques : CA global, nb commandes
  - Filtres : jour, semaine, mois
  - Courbe ou histogramme dynamique
- **Export :**
  - Bouton "Télécharger CSV"

---

### 🧭 Flux utilisateur - Administrateur

1. Connexion
2. Dashboard
3. Gestion des restaurants → Détail → Valider / Bloquer
4. Gestion utilisateurs
5. Suivi commandes → Détail
6. Statistiques → Export

---

## 🧑‍🍳 Interface Restaurateur

### 1. Page de connexion
- **Identique à l’administrateur**
- Onboarding rapide possible (logo + bienvenue)

---

### 2. Accueil / Commandes en direct
- **Composants :**
  - Liste des commandes (ID, heure, client, plats, statut)
  - Boutons : "Accepter", "Refuser", "Commande prête"
  - Filtres : aujourd’hui, statut
  - Badge visuel + notification sonore (nouvelle commande)
- **État vide :**
  - "Aucune commande pour le moment"

---

### 3. Gestion du menu
- **Composants :**
  - Liste des catégories (ex. Plats, Boissons)
  - Produits : nom, prix, image, description, statut
  - Boutons : "Modifier", "Supprimer", "Désactiver"
  - Formulaire CRUD (ajout ou édition)
- **Interactions :**
  - Drag & drop des catégories (facultatif)
- **État vide :**
  - "Aucun plat dans cette catégorie"

---

### 4. Statistiques
- **Composants :**
  - Cartes : commandes aujourd’hui, semaine, mois
  - Graphique : évolution des commandes
  - Taux d’acceptation/refus
- **Export :**
  - PDF ou CSV

---

### 5. Paramètres du restaurant
- **Composants :**
  - Formulaire : nom, adresse, horaires, logo, catégorie
  - Toggle : "Ouvert / Fermé"
  - Bouton "Mettre à jour"
- **État :**
  - Si fermé → affichage sur l’app client "Fermé actuellement"

---

### Comportements dynamiques
- Les commandes sont en **temps réel** (WebSocket / polling)
- **Notification sonore** sur nouvelle commande (active si page visible)
- Le statut d’un plat change immédiatement dans l’UI
- Le bouton "Ouvert / Fermé" agit comme un switch live

---

### 🧭 Flux utilisateur - Restaurateur

1. Connexion
2. Réception commande en temps réel → Accepter / Refuser
3. Gestion du menu → Ajouter / Modifier un plat
4. Accès aux statistiques → consulter CA
5. Modifier infos → Changer statut "ouvert / fermé"

---

## Maquettes à livrer

### Interface Admin
- Connexion
- Dashboard
- Liste restaurants + détail
- Liste utilisateurs
- Commandes
- Statistiques

### Interface Restaurateur
- Connexion
- Accueil commandes en direct
- Gestion menu (CRUD complet)
- Statistiques
- Paramètres restaurant

---

## 📎 Annexes

- **Police recommandée :** Inter ou Roboto
- **Taille cible :**
  - Admin : desktop ≥ 1280px
  - Restaurateur : desktop 1280px + tablette 1024px (paysage)
- **Icônes suggérées :** Lucide, Heroicons, Font Awesome
- **Bibliothèques front prévues :** React.js + Tailwind CSS
- **Composants front dynamique :** liste, tableau, carte, modal, notification, bouton état

---

**Fin du document**
