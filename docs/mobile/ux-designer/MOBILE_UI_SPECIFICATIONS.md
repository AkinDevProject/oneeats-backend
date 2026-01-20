# Spécifications UX/UI - Application Mobile Client (OneEats)

**Projet :** OneEats
**Date :** 9 juillet 2025
**Auteur :** [À renseigner]
**Destinataire :** UX/UI Designer
**Objectif :** Conception des maquettes complètes pour l’application mobile permettant aux utilisateurs finaux de commander des repas à emporter ou consommer sur place.

---

## Objectifs UX

- Simplicité : navigation fluide et intuitive dès la première ouverture
- Rapidité : accès rapide aux restaurants et plats
- Confort visuel : interface claire, moderne, agréable à utiliser au quotidien
- Accessibilité : prise en compte des bonnes pratiques (contrastes, tailles, gestes tactiles)
- Cohérence : expérience homogène sur iOS et Android

---

## 🎨 Direction visuelle

- **Plateforme technique :** React Native (Expo)
- **Style :** moderne, épuré, inspiré d’**Uber Eats** et **Too Good To Go**
- **Police :** Inter / Roboto / SF Pro
- **Couleurs suggérées :**
  - Primaire : #1E90FF (bleu clair)
  - Secondaire : #FFC107 (jaune)
  - Success : #4CAF50
  - Erreur : #F44336
  - Fond clair : #F9FAFB
- **Icônes :** Heroicons, Lucide ou Font Awesome

---

## 📲 App Screens & UX Flow

### 1. Splash / Onboarding
- Logo centré
- Animation légère (fade in)
- Chargement vers la page de connexion

---

### 2. Connexion
- Champs : email, mot de passe
- Bouton "Connexion"
- Lien "Mot de passe oublié"
- Boutons externes : Connexion avec Google / Apple
- État d’erreur clair sous les champs

---

### 3. Création de compte
- Champs : nom complet, email, mot de passe, confirmation
- Validation du mot de passe fort
- CTA : "Créer mon compte"
- Checkbox RGPD (acceptation CGU)

---

### 4. Sélection du restaurant (Home)
- Barre de recherche
- Filtres : ouvert maintenant, catégorie, popularité
- Cartes restaurants :
  - Image, nom, distance, durée estimée, icône "Ouvert" ou "Fermé"
- Bouton favori (💛)

---

### 5. Détail d’un restaurant
- Bannière image + nom
- Infos : horaires, description, note moyenne
- Sélection du mode :
  - Emporter / Sur place
- Liste des plats par catégorie (entrée, plat, boisson…)
  - Image, nom, description, prix
  - Bouton [+] / [-] (quantité)

---

### 6. Panier
- Liste des articles
  - Nom, quantité, prix
- Choix : heure souhaitée (maintenant ou planifiée)
- Affichage total : TTC
- Bouton : "Commander maintenant"

---

### 7. Récapitulatif
- Résumé de commande
- Heure estimée de disponibilité
- Paiement (placeholder, pas intégré)
- Bouton de confirmation

---

### 8. Suivi de commande
- Timeline des statuts :
  - En attente
  - En préparation
  - Prête à récupérer
- Notifications push à chaque changement
- Temps estimé
- Message du restaurant (facultatif)

---

### 9. Historique
- Liste : date, restaurant, montant total
- Statut : Terminée / Annulée
- Détail : contenu et heure

---

### 10. Profil utilisateur
- Nom, email, photo
- Boutons :
  - Modifier mes infos
  - Préférences
  - Me déconnecter
  - Supprimer mon compte

---

## 📶 UX techniques & dynamiques

- **Commande en temps réel :** WebSocket ou polling
- **Notifications push :** Firebase (commande prête, refusée…)
- **Chargements :** spinners ou skeletons
- **Animations UI :**
  - Glissement entre pages
  - Animation du panier au clic
- **Accessibilité :**
  - Contraste AA minimum respecté
  - Boutons ≥ 44x44px
  - Support gestuel : swipe retour, scroll logique

---

## 🧭 Navigation (User Flow global)

1. Splash screen
2. Connexion / Création compte
3. Liste des restaurants
4. Fiche restaurant → Ajout au panier
5. Panier → Récapitulatif
6. Confirmation → Suivi temps réel
7. Historique → Profil

---

## Multilingue

- L'application doit être **prête pour une traduction multilingue** (i18n)
  - **Langues prioritaires :** Français (FR), Anglais (EN), Turc (TR)
  - Prévoir textes adaptables (éviter phrases trop longues)
  - Icônes toujours accompagnées de texte

---

## Liste des maquettes à produire

| Écran                            | Format             |
|----------------------------------|---------------------|
| Splash / Onboarding              | Portrait mobile     |
| Connexion / Inscription          | Portrait mobile     |
| Liste restaurants (Home)         | Portrait mobile     |
| Détail restaurant + menu         | Portrait mobile     |
| Panier                           | Portrait mobile     |
| Validation / récapitulatif       | Portrait mobile     |
| Suivi commande                   | Portrait mobile     |
| Historique                       | Portrait mobile     |
| Profil utilisateur               | Portrait mobile     |
| État vide (restaurants, commandes, panier) | Portrait mobile |

---

## 📎 Annexes

- **Cible technique :** React Native avec Expo
- **Résolutions ciblées :** iPhone 13 / Android Pixel 6
- **Mode sombre :** non prioritaire (à envisager plus tard)
- **Design tool :** Figma recommandé
- **Livrables attendus :**
  - Maquettes `.fig` ou `.xd`
  - Export PNG / PDF par écran
  - Guide UI (typographie, couleurs, composants réutilisables)

---

**Fin du document**
