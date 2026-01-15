# User Stories - OneEats Mobile App

> Document de référence pour toutes les User Stories de l'application mobile OneEats.
> App React Native / Expo - Commande à emporter (retrait sur place uniquement).

---

## Table des Matières

1. [Module Authentification](#1-module-authentification)
2. [Module Accueil & Découverte](#2-module-accueil--découverte)
3. [Module Restaurant & Menu](#3-module-restaurant--menu)
4. [Module Panier & Commande](#4-module-panier--commande)
5. [Module Suivi de Commande](#5-module-suivi-de-commande)
6. [Module Favoris](#6-module-favoris)
7. [Module Profil & Compte](#7-module-profil--compte)
8. [Module Paramètres](#8-module-paramètres)
9. [Module Aide & Support](#9-module-aide--support)
10. [User Stories Transversales](#10-user-stories-transversales)

---

## 1. Module Authentification

### US-AUTH-001 : Connexion via SSO Keycloak
**En tant que** utilisateur,
**Je veux** me connecter via la page d'authentification Keycloak,
**Afin de** accéder à mon compte et pouvoir passer des commandes.

**Critères d'acceptation :**
- [ ] Le bouton "Se connecter" redirige vers la page Keycloak
- [ ] L'authentification utilise le flow PKCE (sécurisé pour mobile)
- [ ] Après connexion réussie, l'utilisateur est redirigé vers l'accueil
- [ ] Les tokens sont stockés de manière sécurisée (SecureStore)
- [ ] Un feedback haptic est déclenché lors du clic
- [ ] Un loader s'affiche pendant l'authentification

**Fichier concerné :** `app/auth/login.tsx`

---

### US-AUTH-002 : Connexion via Google
**En tant que** utilisateur,
**Je veux** me connecter rapidement avec mon compte Google,
**Afin de** simplifier le processus d'inscription/connexion.

**Critères d'acceptation :**
- [ ] Le bouton "Google" déclenche l'auth via Keycloak avec `kc_idp_hint=google`
- [ ] L'utilisateur est redirigé vers la page Google de Keycloak
- [ ] Après connexion, les infos utilisateur sont récupérées automatiquement
- [ ] Un feedback haptic confirme le succès ou l'échec

**Fichier concerné :** `app/auth/login.tsx`, `src/services/authService.ts`

---

### US-AUTH-003 : Connexion via Apple
**En tant que** utilisateur iOS,
**Je veux** me connecter avec mon Apple ID,
**Afin de** utiliser Sign in with Apple conformément aux guidelines Apple.

**Critères d'acceptation :**
- [ ] Le bouton "Apple" déclenche l'auth via Keycloak avec `kc_idp_hint=apple`
- [ ] Le design respecte les guidelines Apple (bouton noir)
- [ ] L'authentification fonctionne sur iOS et simulateurs

**Fichier concerné :** `app/auth/login.tsx`

---

### US-AUTH-004 : Navigation sans compte
**En tant que** visiteur,
**Je veux** parcourir l'application sans me connecter,
**Afin de** découvrir les restaurants et menus avant de créer un compte.

**Critères d'acceptation :**
- [ ] Le lien "Continuer sans compte" permet d'accéder à l'accueil
- [ ] L'utilisateur peut voir les restaurants, menus et ajouter au panier
- [ ] La connexion est requise uniquement au moment de valider la commande
- [ ] Un message indique clairement cette limitation

**Fichier concerné :** `app/auth/login.tsx`

---

### US-AUTH-005 : Déconnexion
**En tant que** utilisateur connecté,
**Je veux** me déconnecter de mon compte,
**Afin de** sécuriser l'accès à mes informations.

**Critères d'acceptation :**
- [ ] Un dialogue de confirmation s'affiche avant déconnexion
- [ ] Les tokens Keycloak sont révoqués côté serveur
- [ ] Les données locales (tokens, user info) sont supprimées
- [ ] L'utilisateur est redirigé vers la page de connexion
- [ ] Un feedback haptic confirme l'action

**Fichier concerné :** `app/(tabs)/profile.tsx`, `src/contexts/AuthContext.tsx`

---

### US-AUTH-006 : Restauration de session
**En tant que** utilisateur,
**Je veux** que ma session soit automatiquement restaurée,
**Afin de** ne pas avoir à me reconnecter à chaque ouverture de l'app.

**Critères d'acceptation :**
- [ ] Au lancement, l'app vérifie si un token valide existe
- [ ] Si le token est expiré, un refresh automatique est tenté
- [ ] Si le refresh échoue, l'utilisateur reste déconnecté
- [ ] Les infos utilisateur sont récupérées depuis le cache ou Keycloak

**Fichier concerné :** `src/contexts/AuthContext.tsx`, `src/services/authService.ts`

---

## 2. Module Accueil & Découverte

### US-HOME-001 : Affichage de la liste des restaurants
**En tant que** utilisateur,
**Je veux** voir la liste des restaurants disponibles,
**Afin de** choisir où commander.

**Critères d'acceptation :**
- [ ] Les restaurants sont affichés sous forme de cartes avec :
  - Image du restaurant
  - Nom et type de cuisine
  - Note (étoiles)
  - Temps de préparation estimé
  - Distance (si localisation activée)
  - Badge "Ouvert" / "Fermé"
- [ ] Un loader s'affiche pendant le chargement
- [ ] Un message d'erreur s'affiche en cas d'échec
- [ ] Les animations FadeIn sont appliquées

**Fichier concerné :** `app/(tabs)/index.tsx`

---

### US-HOME-002 : Recherche de restaurants
**En tant que** utilisateur,
**Je veux** rechercher un restaurant par son nom,
**Afin de** trouver rapidement un restaurant spécifique.

**Critères d'acceptation :**
- [ ] Une barre de recherche est visible en haut de l'écran
- [ ] La recherche filtre les restaurants en temps réel
- [ ] L'icône de recherche et le placeholder sont explicites
- [ ] La recherche est case-insensitive

**Fichier concerné :** `app/(tabs)/index.tsx`

---

### US-HOME-003 : Filtrage par catégorie de cuisine
**En tant que** utilisateur,
**Je veux** filtrer les restaurants par type de cuisine,
**Afin de** trouver des restaurants correspondant à mes envies.

**Critères d'acceptation :**
- [ ] Les chips de catégories sont affichées horizontalement (scrollable)
- [ ] Catégories disponibles : Tous, Pizza, Burger, Asiatique, Sushi, Mexicain, etc.
- [ ] Le filtre sélectionné est visuellement distinct (couleur primaire)
- [ ] Un seul filtre de catégorie peut être actif à la fois
- [ ] Le feedback haptic est déclenché au changement

**Fichier concerné :** `app/(tabs)/index.tsx`

---

### US-HOME-004 : Filtres rapides
**En tant que** utilisateur,
**Je veux** appliquer des filtres rapides,
**Afin de** affiner ma recherche selon mes critères.

**Critères d'acceptation :**
- [ ] Filtres disponibles :
  - "Rapide" : restaurants avec temps < 20 min
  - "Top noté" : restaurants avec note >= 4.5
  - "Ouvert" : restaurants actuellement ouverts
  - "Promos" : restaurants avec promotions actives
- [ ] Plusieurs filtres peuvent être combinés
- [ ] Les filtres actifs sont visuellement distincts

**Fichier concerné :** `app/(tabs)/index.tsx`

---

### US-HOME-005 : Carrousel des favoris
**En tant que** utilisateur connecté,
**Je veux** voir mes restaurants favoris en haut de l'accueil,
**Afin de** y accéder rapidement.

**Critères d'acceptation :**
- [ ] Le carrousel s'affiche uniquement si l'utilisateur a des favoris
- [ ] Les cartes sont scrollables horizontalement
- [ ] Un tap sur une carte navigue vers le restaurant
- [ ] Le titre "Vos Favoris" est affiché au-dessus du carrousel

**Fichier concerné :** `app/(tabs)/index.tsx`

---

### US-HOME-006 : Navigation vers un restaurant
**En tant que** utilisateur,
**Je veux** accéder à la page d'un restaurant,
**Afin de** consulter son menu et passer commande.

**Critères d'acceptation :**
- [ ] Un tap sur une carte restaurant navigue vers `/restaurant/[id]`
- [ ] Le feedback haptic est déclenché
- [ ] La transition est fluide avec animation

**Fichier concerné :** `app/(tabs)/index.tsx`

---

### US-HOME-007 : Pull-to-refresh
**En tant que** utilisateur,
**Je veux** rafraîchir la liste des restaurants en tirant vers le bas,
**Afin de** voir les dernières mises à jour.

**Critères d'acceptation :**
- [ ] Le geste pull-to-refresh est supporté
- [ ] Un indicator de chargement s'affiche
- [ ] Les données sont rechargées depuis l'API
- [ ] Un feedback haptic confirme le rafraîchissement

**Fichier concerné :** `app/(tabs)/index.tsx`

---

## 3. Module Restaurant & Menu

### US-RESTO-001 : Affichage des détails du restaurant
**En tant que** utilisateur,
**Je veux** voir les informations complètes d'un restaurant,
**Afin de** décider si je veux y commander.

**Critères d'acceptation :**
- [ ] L'image du restaurant est affichée en header (280px)
- [ ] Le gradient permet de lire le texte sur l'image
- [ ] Informations affichées :
  - Nom du restaurant
  - Statut ouvert/fermé avec badge coloré
  - Note avec étoile
  - Temps de préparation
  - "Retrait sur place" (pas de livraison)
- [ ] Un loader s'affiche pendant le chargement
- [ ] Un état d'erreur s'affiche si le restaurant n'existe pas

**Fichier concerné :** `app/restaurant/[id].tsx`

---

### US-RESTO-002 : Affichage du menu
**En tant que** utilisateur,
**Je veux** voir le menu du restaurant,
**Afin de** choisir mes plats.

**Critères d'acceptation :**
- [ ] Les plats sont affichés sous forme de cartes avec :
  - Image du plat
  - Nom et description
  - Prix
  - Badge "Populaire" si applicable
  - Badge "Personnalisable" si options disponibles
- [ ] Le nombre total de plats est affiché
- [ ] Les animations FadeIn sont appliquées

**Fichier concerné :** `app/restaurant/[id].tsx`

---

### US-RESTO-003 : Filtrage par catégorie de plats
**En tant que** utilisateur,
**Je veux** filtrer le menu par catégorie,
**Afin de** trouver rapidement le type de plat souhaité.

**Critères d'acceptation :**
- [ ] Les chips de catégories sont générées dynamiquement
- [ ] "Tout" affiche tous les plats
- [ ] Le filtre actif est visuellement distinct
- [ ] Le nombre de plats filtrés est mis à jour

**Fichier concerné :** `app/restaurant/[id].tsx`

---

### US-RESTO-004 : Ajout rapide au panier
**En tant que** utilisateur,
**Je veux** ajouter un plat au panier en un tap,
**Afin de** commander rapidement.

**Critères d'acceptation :**
- [ ] Le bouton "+" permet d'ajouter au panier
- [ ] Si le plat a des options, l'utilisateur est redirigé vers la page de détail
- [ ] Un feedback haptic confirme l'ajout
- [ ] La quantité s'affiche si le plat est déjà dans le panier

**Fichier concerné :** `app/restaurant/[id].tsx`

---

### US-RESTO-005 : Modification de quantité depuis le menu
**En tant que** utilisateur,
**Je veux** modifier la quantité d'un plat directement depuis le menu,
**Afin de** ajuster ma commande sans aller au panier.

**Critères d'acceptation :**
- [ ] Les boutons "-" et "+" apparaissent si le plat est dans le panier
- [ ] Le bouton "-" supprime le plat si quantité = 1
- [ ] La quantité actuelle est affichée entre les boutons
- [ ] Un feedback haptic est déclenché

**Fichier concerné :** `app/restaurant/[id].tsx`

---

### US-RESTO-006 : Bouton flottant panier
**En tant que** utilisateur,
**Je veux** voir un bouton flottant vers le panier,
**Afin de** y accéder rapidement.

**Critères d'acceptation :**
- [ ] Le FAB s'affiche uniquement si le panier contient des articles
- [ ] Le nombre d'articles est affiché sur le bouton
- [ ] Un tap navigue vers l'onglet panier
- [ ] Un feedback haptic est déclenché

**Fichier concerné :** `app/restaurant/[id].tsx`

---

### US-RESTO-007 : Page de détail d'un plat
**En tant que** utilisateur,
**Je veux** voir les détails complets d'un plat,
**Afin de** le personnaliser avant de l'ajouter au panier.

**Critères d'acceptation :**
- [ ] L'image du plat est affichée en grand (250px)
- [ ] Informations affichées :
  - Nom et prix de base
  - Nom du restaurant
  - Description complète
  - Catégorie (chip)
  - Badge "Non disponible" si applicable
- [ ] Les options de personnalisation sont listées

**Fichier concerné :** `app/menu/[id].tsx`

---

### US-RESTO-008 : Personnalisation d'un plat - Options simples
**En tant que** utilisateur,
**Je veux** choisir une option parmi plusieurs choix,
**Afin de** personnaliser mon plat.

**Critères d'acceptation :**
- [ ] Les options à choix unique sont affichées en RadioButton
- [ ] Les options requises sont marquées d'un astérisque rouge
- [ ] Le prix additionnel est affiché pour chaque choix
- [ ] Un feedback haptic est déclenché au changement

**Fichier concerné :** `app/menu/[id].tsx`

---

### US-RESTO-009 : Personnalisation d'un plat - Options multiples
**En tant que** utilisateur,
**Je veux** sélectionner plusieurs extras,
**Afin de** enrichir mon plat.

**Critères d'acceptation :**
- [ ] Les options multiples sont affichées en Checkbox
- [ ] Le nombre max de sélections est affiché si limité
- [ ] Les choix au-delà de la limite sont désactivés
- [ ] "Illimité" s'affiche si maxChoices = 0

**Fichier concerné :** `app/menu/[id].tsx`

---

### US-RESTO-010 : Sélection de la quantité
**En tant que** utilisateur,
**Je veux** choisir la quantité avant d'ajouter au panier,
**Afin de** commander plusieurs fois le même plat.

**Critères d'acceptation :**
- [ ] Les boutons "-" et "+" permettent de modifier la quantité
- [ ] La quantité minimum est 1
- [ ] Le prix total est calculé en temps réel
- [ ] Un feedback haptic est déclenché

**Fichier concerné :** `app/menu/[id].tsx`

---

### US-RESTO-011 : Ajout au panier depuis le détail
**En tant que** utilisateur,
**Je veux** ajouter le plat personnalisé au panier,
**Afin de** finaliser ma sélection.

**Critères d'acceptation :**
- [ ] Le bouton "Ajouter au panier" ajoute le plat avec ses options
- [ ] Les options requises doivent être sélectionnées (validation)
- [ ] Le prix total (base + options × quantité) est affiché
- [ ] Un feedback haptic confirme l'ajout
- [ ] L'utilisateur est redirigé vers le menu du restaurant

**Fichier concerné :** `app/menu/[id].tsx`

---

### US-RESTO-012 : Modification d'un plat du panier
**En tant que** utilisateur,
**Je veux** modifier un plat déjà dans mon panier,
**Afin de** changer mes options ou quantité.

**Critères d'acceptation :**
- [ ] L'accès se fait depuis le panier (bouton modifier)
- [ ] Les options précédemment sélectionnées sont pré-remplies
- [ ] Le bouton affiche "Mettre à jour" au lieu de "Ajouter"
- [ ] Après modification, l'utilisateur retourne au panier

**Fichier concerné :** `app/menu/[id].tsx`

---

## 4. Module Panier & Commande

### US-CART-001 : Affichage du panier
**En tant que** utilisateur,
**Je veux** voir le contenu de mon panier,
**Afin de** vérifier ma commande avant validation.

**Critères d'acceptation :**
- [ ] Chaque article affiche :
  - Image du plat
  - Nom et prix unitaire
  - Options sélectionnées
  - Instructions spéciales
  - Quantité avec contrôles +/-
- [ ] Le sous-total est calculé en temps réel
- [ ] Un état vide s'affiche si le panier est vide

**Fichier concerné :** `app/(tabs)/cart.tsx`

---

### US-CART-002 : Modification de la quantité
**En tant que** utilisateur,
**Je veux** modifier la quantité d'un article dans le panier,
**Afin de** ajuster ma commande.

**Critères d'acceptation :**
- [ ] Les boutons "-" et "+" modifient la quantité
- [ ] Si quantité devient 0, l'article est supprimé
- [ ] Le total est recalculé automatiquement
- [ ] Un feedback haptic est déclenché

**Fichier concerné :** `app/(tabs)/cart.tsx`

---

### US-CART-003 : Suppression d'un article
**En tant que** utilisateur,
**Je veux** supprimer un article du panier,
**Afin de** retirer un plat que je ne veux plus.

**Critères d'acceptation :**
- [ ] Un bouton de suppression est disponible par article
- [ ] Un dialogue de confirmation peut être affiché (optionnel)
- [ ] Le panier se met à jour instantanément
- [ ] Un feedback haptic confirme la suppression

**Fichier concerné :** `app/(tabs)/cart.tsx`

---

### US-CART-004 : Instructions spéciales
**En tant que** utilisateur,
**Je veux** ajouter des instructions spéciales par article,
**Afin de** communiquer des préférences au restaurant.

**Critères d'acceptation :**
- [ ] Un champ texte permet de saisir des instructions
- [ ] Les instructions sont associées à l'article spécifique
- [ ] Les instructions sont affichées dans le récapitulatif
- [ ] Exemple : "Sans oignon", "Bien cuit"

**Fichier concerné :** `app/(tabs)/cart.tsx`

---

### US-CART-005 : Sélection de l'heure de retrait
**En tant que** utilisateur,
**Je veux** choisir l'heure à laquelle récupérer ma commande,
**Afin de** planifier mon passage au restaurant.

**Critères d'acceptation :**
- [ ] Options disponibles :
  - "Dès que possible" (par défaut)
  - Créneaux horaires (toutes les 15 min)
- [ ] Les créneaux passés ne sont pas sélectionnables
- [ ] L'heure sélectionnée est affichée dans le résumé
- [ ] Un date/time picker est utilisé pour la sélection

**Fichier concerné :** `app/(tabs)/cart.tsx`

---

### US-CART-006 : Récapitulatif de la commande
**En tant que** utilisateur,
**Je veux** voir le récapitulatif des prix,
**Afin de** connaître le montant total de ma commande.

**Critères d'acceptation :**
- [ ] Éléments affichés :
  - Sous-total (somme des articles)
  - Frais de service (si applicable)
  - Total à payer
- [ ] Les prix sont formatés avec 2 décimales et le symbole €
- [ ] Le total est mis à jour en temps réel

**Fichier concerné :** `app/(tabs)/cart.tsx`

---

### US-CART-007 : Informations client
**En tant que** utilisateur,
**Je veux** saisir mes informations de contact,
**Afin que** le restaurant puisse me contacter.

**Critères d'acceptation :**
- [ ] Champs requis :
  - Nom complet
  - Numéro de téléphone
- [ ] Les informations sont pré-remplies si l'utilisateur est connecté
- [ ] La validation vérifie que les champs sont remplis
- [ ] Le clavier approprié s'affiche (numérique pour téléphone)

**Fichier concerné :** `app/(tabs)/cart.tsx`

---

### US-CART-008 : Validation de la commande
**En tant que** utilisateur connecté,
**Je veux** valider ma commande,
**Afin de** l'envoyer au restaurant.

**Critères d'acceptation :**
- [ ] Le bouton "Commander" est désactivé si panier vide
- [ ] Si non connecté, redirection vers login
- [ ] Les informations client doivent être remplies
- [ ] La commande est envoyée à l'API backend
- [ ] Un feedback haptic confirme l'envoi
- [ ] L'utilisateur est redirigé vers le suivi de commande
- [ ] Le panier est vidé après succès

**Fichier concerné :** `app/(tabs)/cart.tsx`

---

### US-CART-009 : État panier vide
**En tant que** utilisateur,
**Je veux** voir un message quand mon panier est vide,
**Afin de** savoir comment procéder.

**Critères d'acceptation :**
- [ ] Un état vide avec icône et message s'affiche
- [ ] Un bouton "Découvrir les restaurants" redirige vers l'accueil
- [ ] Le design est cohérent avec les autres états vides de l'app

**Fichier concerné :** `app/(tabs)/cart.tsx`

---

### US-CART-010 : Vider le panier
**En tant que** utilisateur,
**Je veux** vider mon panier en un clic,
**Afin de** recommencer ma commande.

**Critères d'acceptation :**
- [ ] Un bouton "Vider le panier" est disponible
- [ ] Un dialogue de confirmation s'affiche
- [ ] Tous les articles sont supprimés après confirmation
- [ ] Un feedback haptic confirme l'action

**Fichier concerné :** `app/(tabs)/cart.tsx`

---

## 5. Module Suivi de Commande

### US-ORDER-001 : Liste des commandes en cours
**En tant que** utilisateur,
**Je veux** voir mes commandes en cours,
**Afin de** suivre leur progression.

**Critères d'acceptation :**
- [ ] L'onglet "En cours" affiche les commandes avec statut :
  - pending, confirmed, preparing, ready
- [ ] Chaque carte affiche :
  - Nom du restaurant
  - Numéro de commande
  - Statut avec emoji et couleur
  - Barre de progression
  - Heure de retrait
  - Nombre d'articles et total
- [ ] Un tap navigue vers le détail de la commande

**Fichier concerné :** `app/orders/index.tsx`

---

### US-ORDER-002 : Statuts de commande
**En tant que** utilisateur,
**Je veux** voir le statut actuel de ma commande,
**Afin de** savoir quand elle sera prête.

**Critères d'acceptation :**
- [ ] Statuts et représentation :
  - ⏳ En attente (pending) - 20% progression
  - ✅ Confirmée (confirmed) - 40% progression
  - 👨‍🍳 En préparation (preparing) - 70% progression
  - 🎉 Prête ! (ready) - 95% progression
  - ✓ Récupérée (completed) - 100%
  - ❌ Annulée (cancelled) - 0%
- [ ] La couleur du badge correspond au statut

**Fichier concerné :** `app/orders/index.tsx`, `app/order/[id].tsx`

---

### US-ORDER-003 : Historique des commandes
**En tant que** utilisateur,
**Je veux** voir l'historique de mes commandes passées,
**Afin de** consulter mes anciennes commandes.

**Critères d'acceptation :**
- [ ] L'onglet "Historique" affiche les commandes terminées/annulées
- [ ] Chaque carte affiche :
  - Nom du restaurant
  - Date de la commande
  - Statut final
  - Nombre d'articles et total
- [ ] Un tap navigue vers le détail

**Fichier concerné :** `app/orders/index.tsx`

---

### US-ORDER-004 : Recommander une commande
**En tant que** utilisateur,
**Je veux** recommander une commande passée,
**Afin de** repasser facilement la même commande.

**Critères d'acceptation :**
- [ ] Le bouton "Recommander" est disponible sur les commandes complétées
- [ ] Un dialogue propose deux options :
  - "Vider et ajouter" : remplace le panier
  - "Ajouter au panier" : ajoute aux articles existants
- [ ] Les articles avec leurs options sont ajoutés au panier
- [ ] Un feedback haptic confirme l'action
- [ ] L'utilisateur peut naviguer vers le panier

**Fichier concerné :** `app/orders/index.tsx`

---

### US-ORDER-005 : Détail d'une commande
**En tant que** utilisateur,
**Je veux** voir le détail complet d'une commande,
**Afin de** avoir toutes les informations.

**Critères d'acceptation :**
- [ ] Informations affichées :
  - Statut avec icône/emoji
  - Numéro de commande
  - Nom et adresse du restaurant
  - Horaires d'ouverture
  - Téléphone du restaurant
  - Heure de retrait prévue
  - Liste des articles avec options
  - Récapitulatif des prix

**Fichier concerné :** `app/order/[id].tsx`

---

### US-ORDER-006 : Voir l'itinéraire vers le restaurant
**En tant que** utilisateur,
**Je veux** ouvrir l'itinéraire vers le restaurant,
**Afin de** me rendre sur place pour récupérer ma commande.

**Critères d'acceptation :**
- [ ] Le bouton "Voir l'itinéraire" ouvre l'application Maps
- [ ] L'adresse du restaurant est passée en paramètre
- [ ] Fonctionne sur iOS (Apple Maps) et Android (Google Maps)
- [ ] Un feedback haptic est déclenché

**Fichier concerné :** `app/order/[id].tsx`

---

### US-ORDER-007 : Appeler le restaurant
**En tant que** utilisateur,
**Je veux** appeler le restaurant directement,
**Afin de** poser une question ou signaler un problème.

**Critères d'acceptation :**
- [ ] Le numéro de téléphone est cliquable
- [ ] Un tap ouvre l'application Téléphone
- [ ] Un feedback haptic est déclenché

**Fichier concerné :** `app/order/[id].tsx`

---

### US-ORDER-008 : Annuler une commande
**En tant que** utilisateur,
**Je veux** annuler ma commande si elle n'est pas encore en préparation,
**Afin de** changer d'avis.

**Critères d'acceptation :**
- [ ] Le bouton "Annuler" est visible uniquement si statut = pending ou confirmed
- [ ] Un dialogue de confirmation s'affiche
- [ ] L'annulation est envoyée à l'API
- [ ] Le statut passe à "cancelled"
- [ ] Un feedback haptic confirme l'action

**Fichier concerné :** `app/order/[id].tsx`

---

### US-ORDER-009 : Pull-to-refresh des commandes
**En tant que** utilisateur,
**Je veux** rafraîchir la liste de mes commandes,
**Afin de** voir les mises à jour de statut.

**Critères d'acceptation :**
- [ ] Le geste pull-to-refresh est supporté
- [ ] Un indicateur de chargement s'affiche
- [ ] Les commandes sont rechargées depuis l'API
- [ ] Un feedback haptic confirme le rafraîchissement

**Fichier concerné :** `app/orders/index.tsx`

---

### US-ORDER-010 : Badge de notification sur l'onglet
**En tant que** utilisateur,
**Je veux** voir un badge sur l'onglet "En cours",
**Afin de** savoir combien de commandes sont actives.

**Critères d'acceptation :**
- [ ] Le badge orange affiche le nombre de commandes en cours
- [ ] Le badge disparaît si aucune commande en cours
- [ ] Le badge gris affiche le nombre dans l'historique

**Fichier concerné :** `app/orders/index.tsx`

---

## 6. Module Favoris

### US-FAV-001 : Liste des restaurants favoris
**En tant que** utilisateur,
**Je veux** voir la liste de mes restaurants favoris,
**Afin de** y accéder rapidement.

**Critères d'acceptation :**
- [ ] Les restaurants favoris sont affichés sous forme de cartes
- [ ] Informations affichées par carte :
  - Image du restaurant
  - Nom et type de cuisine
  - Note et temps de préparation
- [ ] Un état vide s'affiche si aucun favori

**Fichier concerné :** `app/(tabs)/favorites.tsx`

---

### US-FAV-002 : Ajout aux favoris
**En tant que** utilisateur,
**Je veux** ajouter un restaurant à mes favoris,
**Afin de** le retrouver facilement plus tard.

**Critères d'acceptation :**
- [ ] L'icône coeur permet d'ajouter/retirer des favoris
- [ ] L'action est persistée localement (AsyncStorage)
- [ ] L'action peut être synchronisée avec le backend (si connecté)
- [ ] Un feedback haptic confirme l'action

**Fichier concerné :** `app/(tabs)/favorites.tsx`, `src/hooks/useFavorites.ts`

---

### US-FAV-003 : Retrait des favoris
**En tant que** utilisateur,
**Je veux** retirer un restaurant de mes favoris,
**Afin de** gérer ma liste.

**Critères d'acceptation :**
- [ ] L'icône coeur rempli permet de retirer des favoris
- [ ] Le restaurant disparaît de la liste
- [ ] Un feedback haptic confirme l'action

**Fichier concerné :** `app/(tabs)/favorites.tsx`

---

### US-FAV-004 : Navigation vers un favori
**En tant que** utilisateur,
**Je veux** accéder à un restaurant depuis mes favoris,
**Afin de** consulter son menu.

**Critères d'acceptation :**
- [ ] Un tap sur la carte navigue vers `/restaurant/[id]`
- [ ] Un feedback haptic est déclenché
- [ ] La transition est fluide

**Fichier concerné :** `app/(tabs)/favorites.tsx`

---

## 7. Module Profil & Compte

### US-PROFILE-001 : Page profil principale
**En tant que** utilisateur connecté,
**Je veux** voir ma page de profil,
**Afin de** accéder à mes informations et paramètres.

**Critères d'acceptation :**
- [ ] Header coloré avec :
  - Avatar (initiale du prénom)
  - Nom et email
  - Statistiques (commandes, favoris)
- [ ] Sections de menu :
  - Mon Compte
  - Préférences
  - Autres
- [ ] Bouton de déconnexion
- [ ] Version de l'app en footer

**Fichier concerné :** `app/(tabs)/profile.tsx`

---

### US-PROFILE-002 : Profil non connecté
**En tant que** visiteur,
**Je veux** voir une page profil adaptée,
**Afin de** comprendre les avantages de la connexion.

**Critères d'acceptation :**
- [ ] Message de bienvenue
- [ ] Bouton "Se connecter" visible
- [ ] Menu limité (Aide & Support visible)
- [ ] Pas de bouton déconnexion

**Fichier concerné :** `app/(tabs)/profile.tsx`

---

### US-PROFILE-003 : Bannière commandes en cours
**En tant que** utilisateur,
**Je veux** voir un rappel si j'ai des commandes en cours,
**Afin de** y accéder rapidement.

**Critères d'acceptation :**
- [ ] La bannière s'affiche uniquement si commandes actives
- [ ] Le nombre de commandes est indiqué
- [ ] Un tap navigue vers la page commandes
- [ ] Design distinct (couleur orange)

**Fichier concerné :** `app/(tabs)/profile.tsx`

---

### US-PROFILE-004 : Navigation vers le profil personnel
**En tant que** utilisateur,
**Je veux** accéder à la page de modification de profil,
**Afin de** modifier mes informations.

**Critères d'acceptation :**
- [ ] Le menu "Profil personnel" navigue vers `/account`
- [ ] Un feedback haptic est déclenché
- [ ] L'icône d'édition est visible sur l'avatar

**Fichier concerné :** `app/(tabs)/profile.tsx`

---

### US-PROFILE-005 : Partage de l'application
**En tant que** utilisateur,
**Je veux** partager l'application avec mes amis,
**Afin de** leur faire découvrir OneEats.

**Critères d'acceptation :**
- [ ] Le menu "Inviter des amis" ouvre le share sheet natif
- [ ] Un message pré-rempli est proposé
- [ ] Un feedback haptic est déclenché

**Fichier concerné :** `app/(tabs)/profile.tsx`

---

### US-ACCOUNT-001 : Modification des informations personnelles
**En tant que** utilisateur,
**Je veux** modifier mes informations personnelles,
**Afin de** mettre à jour mon profil.

**Critères d'acceptation :**
- [ ] Champs modifiables :
  - Prénom
  - Nom
  - Email
  - Téléphone
- [ ] Un dialogue d'édition s'ouvre au tap
- [ ] La validation vérifie le format (email, téléphone)
- [ ] Les modifications sont sauvegardées
- [ ] Un feedback haptic confirme la sauvegarde

**Fichier concerné :** `app/account/index.tsx`

---

### US-ACCOUNT-002 : Changement de mot de passe
**En tant que** utilisateur,
**Je veux** changer mon mot de passe,
**Afin de** sécuriser mon compte.

**Critères d'acceptation :**
- [ ] Un dialogue de changement de mot de passe s'ouvre
- [ ] Le nouveau mot de passe doit faire minimum 6 caractères
- [ ] La confirmation du mot de passe est requise
- [ ] Un feedback haptic confirme le changement

**Fichier concerné :** `app/account/index.tsx`, `app/settings/index.tsx`

---

### US-ACCOUNT-003 : Export des données
**En tant que** utilisateur,
**Je veux** exporter mes données personnelles,
**Afin de** exercer mon droit RGPD.

**Critères d'acceptation :**
- [ ] Le bouton "Exporter mes données" déclenche la demande
- [ ] Un message confirme l'envoi par email sous 24h
- [ ] Un feedback haptic confirme l'action

**Fichier concerné :** `app/account/index.tsx`

---

### US-ACCOUNT-004 : Suppression de compte
**En tant que** utilisateur,
**Je veux** supprimer mon compte,
**Afin de** exercer mon droit RGPD.

**Critères d'acceptation :**
- [ ] Le bouton se trouve dans une "Zone de Danger"
- [ ] Un dialogue de confirmation s'affiche
- [ ] Le message avertit de l'irréversibilité
- [ ] Après suppression, l'utilisateur est déconnecté
- [ ] Un feedback haptic de warning est déclenché

**Fichier concerné :** `app/account/index.tsx`

---

### US-ACCOUNT-005 : Affichage de la date d'inscription
**En tant que** utilisateur,
**Je veux** voir depuis quand je suis membre,
**Afin de** connaître mon ancienneté.

**Critères d'acceptation :**
- [ ] La date est affichée en format "Membre depuis [mois] [année]"
- [ ] L'information est en bas de page

**Fichier concerné :** `app/account/index.tsx`

---

## 8. Module Paramètres

### US-SETTINGS-001 : Paramètres de notifications
**En tant que** utilisateur,
**Je veux** gérer mes préférences de notifications,
**Afin de** contrôler ce que je reçois.

**Critères d'acceptation :**
- [ ] Paramètres disponibles :
  - Mises à jour commandes (on/off)
  - Promotions (on/off)
  - Son (on/off)
  - Vibration (on/off)
- [ ] Les changements sont persistés localement
- [ ] Un feedback haptic est déclenché au changement

**Fichier concerné :** `app/settings/index.tsx`

---

### US-SETTINGS-002 : Sélection du thème
**En tant que** utilisateur,
**Je veux** choisir le thème de l'application,
**Afin de** personnaliser l'apparence.

**Critères d'acceptation :**
- [ ] Thèmes disponibles :
  - Clair (default)
  - Sombre
  - Système (suit le thème OS)
  - Autres variantes
- [ ] Le changement est appliqué immédiatement
- [ ] Un feedback haptic est déclenché

**Fichier concerné :** `app/settings/index.tsx`, `app/designs/design-selector.tsx`

---

### US-SETTINGS-003 : Sélection de la langue
**En tant que** utilisateur,
**Je veux** choisir la langue de l'application,
**Afin de** l'utiliser dans ma langue préférée.

**Critères d'acceptation :**
- [ ] Langues disponibles :
  - Français 🇫🇷
  - English 🇬🇧
  - Español 🇪🇸
- [ ] Un dialogue de sélection s'affiche
- [ ] Le changement est appliqué (i18n non implémenté pour MVP)
- [ ] Un feedback haptic est déclenché

**Fichier concerné :** `app/settings/index.tsx`

---

### US-SETTINGS-004 : Sélection de la devise
**En tant que** utilisateur,
**Je veux** choisir la devise d'affichage,
**Afin de** voir les prix dans ma monnaie.

**Critères d'acceptation :**
- [ ] Devises disponibles :
  - EUR €
  - USD $
  - GBP £
- [ ] Un dialogue de sélection s'affiche
- [ ] Le symbole est affiché partout dans l'app
- [ ] Un feedback haptic est déclenché

**Fichier concerné :** `app/settings/index.tsx`

---

### US-SETTINGS-005 : Paramètres de confidentialité
**En tant que** utilisateur,
**Je veux** gérer mes paramètres de confidentialité,
**Afin de** contrôler mes données.

**Critères d'acceptation :**
- [ ] Paramètres disponibles :
  - Partager la localisation (on/off)
  - Données d'usage anonymes (on/off)
  - Emails marketing (on/off)
- [ ] Les changements sont persistés
- [ ] Un feedback haptic est déclenché

**Fichier concerné :** `app/settings/index.tsx`

---

### US-SETTINGS-006 : Réinitialisation des paramètres
**En tant que** utilisateur,
**Je veux** réinitialiser tous les paramètres,
**Afin de** revenir à la configuration par défaut.

**Critères d'acceptation :**
- [ ] Un dialogue de confirmation s'affiche
- [ ] Tous les paramètres reprennent leurs valeurs par défaut
- [ ] Un feedback haptic confirme l'action

**Fichier concerné :** `app/settings/index.tsx`

---

## 9. Module Aide & Support

### US-SUPPORT-001 : Contact téléphonique
**En tant que** utilisateur,
**Je veux** appeler le support,
**Afin de** poser une question.

**Critères d'acceptation :**
- [ ] Le bouton "Appeler" ouvre l'app Téléphone
- [ ] Les horaires sont affichés (9h-18h)
- [ ] Un feedback haptic est déclenché

**Fichier concerné :** `app/aide-support.tsx`

---

### US-SUPPORT-002 : Contact WhatsApp
**En tant que** utilisateur,
**Je veux** contacter le support via WhatsApp,
**Afin de** discuter par message.

**Critères d'acceptation :**
- [ ] Le bouton "WhatsApp" ouvre l'app WhatsApp
- [ ] Les horaires sont affichés (8h-22h)
- [ ] Un feedback haptic est déclenché

**Fichier concerné :** `app/aide-support.tsx`

---

### US-SUPPORT-003 : Contact email
**En tant que** utilisateur,
**Je veux** envoyer un email au support,
**Afin de** détailler ma demande.

**Critères d'acceptation :**
- [ ] Le bouton "Email" ouvre l'app Mail
- [ ] L'adresse support@oneeats.com est pré-remplie
- [ ] Un feedback haptic est déclenché

**Fichier concerné :** `app/aide-support.tsx`

---

### US-SUPPORT-004 : FAQ
**En tant que** utilisateur,
**Je veux** consulter les questions fréquentes,
**Afin de** trouver une réponse rapidement.

**Critères d'acceptation :**
- [ ] Les questions sont affichées en accordéon
- [ ] Un tap développe/collapse la réponse
- [ ] Questions disponibles :
  - Comment passer une commande ?
  - Quels sont les délais de préparation ?
  - Comment suivre ma commande ?
  - Quels moyens de paiement acceptez-vous ?
  - Puis-je annuler ma commande ?
  - Comment ajouter un restaurant aux favoris ?
- [ ] Un feedback haptic est déclenché

**Fichier concerné :** `app/aide-support.tsx`

---

### US-SUPPORT-005 : Noter l'application
**En tant que** utilisateur,
**Je veux** noter l'application,
**Afin de** donner mon avis.

**Critères d'acceptation :**
- [ ] Le bouton "Noter" redirige vers le store (App Store / Play Store)
- [ ] Un feedback haptic est déclenché
- [ ] (MVP : message placeholder)

**Fichier concerné :** `app/aide-support.tsx`

---

### US-SUPPORT-006 : Feedback utilisateur
**En tant que** utilisateur,
**Je veux** envoyer un commentaire libre,
**Afin de** partager mes suggestions.

**Critères d'acceptation :**
- [ ] Un dialogue avec zone de texte s'ouvre
- [ ] Le texte peut être partagé via share sheet
- [ ] Un message de confirmation s'affiche
- [ ] Un feedback haptic confirme l'envoi

**Fichier concerné :** `app/aide-support.tsx`

---

### US-SUPPORT-007 : Liens légaux
**En tant que** utilisateur,
**Je veux** accéder aux informations légales,
**Afin de** consulter les CGU et politique de confidentialité.

**Critères d'acceptation :**
- [ ] Liens disponibles :
  - CGU
  - Politique de confidentialité
  - Site web
- [ ] Les liens ouvrent le navigateur externe
- [ ] La version de l'app est affichée

**Fichier concerné :** `app/aide-support.tsx`

---

## 10. User Stories Transversales

### US-UX-001 : Feedback haptic
**En tant que** utilisateur,
**Je veux** ressentir un feedback tactile lors de mes interactions,
**Afin d'** avoir une confirmation physique de mes actions.

**Critères d'acceptation :**
- [ ] Feedback Light : navigation, sélection simple
- [ ] Feedback Medium : actions importantes (ajout panier, connexion)
- [ ] Feedback Success : opérations réussies
- [ ] Feedback Error : erreurs
- [ ] Feedback Warning : actions destructives (suppression, déconnexion)

**Fichiers concernés :** Tous les écrans

---

### US-UX-002 : Animations d'entrée
**En tant que** utilisateur,
**Je veux** voir des animations fluides,
**Afin d'** avoir une expérience agréable.

**Critères d'acceptation :**
- [ ] FadeIn pour les headers et éléments principaux
- [ ] FadeInDown pour les éléments de liste (avec delay progressif)
- [ ] SlideInUp pour les cartes de commande
- [ ] Les animations sont implémentées via react-native-reanimated

**Fichiers concernés :** Tous les écrans

---

### US-UX-003 : États de chargement
**En tant que** utilisateur,
**Je veux** voir un indicateur pendant le chargement,
**Afin de** savoir que l'app travaille.

**Critères d'acceptation :**
- [ ] ActivityIndicator affiché au centre
- [ ] Message explicatif ("Chargement du restaurant...")
- [ ] Couleur primaire du thème utilisée

**Fichiers concernés :** Tous les écrans avec données async

---

### US-UX-004 : États vides
**En tant que** utilisateur,
**Je veux** voir un message quand il n'y a pas de données,
**Afin de** comprendre la situation.

**Critères d'acceptation :**
- [ ] Icône ou emoji représentatif
- [ ] Titre clair
- [ ] Sous-titre explicatif
- [ ] Bouton d'action si pertinent
- [ ] Composant EmptyState réutilisable

**Fichiers concernés :** Panier, Favoris, Commandes

---

### US-UX-005 : États d'erreur
**En tant que** utilisateur,
**Je veux** voir un message d'erreur clair,
**Afin de** savoir quoi faire.

**Critères d'acceptation :**
- [ ] Icône d'erreur
- [ ] Message explicatif
- [ ] Bouton "Réessayer" si applicable
- [ ] Bouton "Retour" si non récupérable

**Fichiers concernés :** Tous les écrans avec données async

---

### US-UX-006 : Thème cohérent
**En tant que** utilisateur,
**Je veux** une apparence cohérente,
**Afin d'** avoir une expérience unifiée.

**Critères d'acceptation :**
- [ ] Couleurs du thème Material Design 3
- [ ] Utilisation de currentTheme.colors partout
- [ ] Switch automatique clair/sombre si thème système
- [ ] Emojis utilisés pour les icônes de menu

**Fichiers concernés :** Tous les écrans

---

### US-UX-007 : Header cohérent
**En tant que** utilisateur,
**Je veux** un header de navigation cohérent,
**Afin de** retrouver facilement mes repères.

**Critères d'acceptation :**
- [ ] Bouton retour (flèche) à gauche
- [ ] Titre centré
- [ ] Fond de couleur surface
- [ ] Bordure inférieure subtile
- [ ] Même pattern sur toutes les pages secondaires

**Fichiers concernés :** orders, order/[id], account, settings, aide-support

---

### US-UX-008 : Navigation par onglets
**En tant que** utilisateur,
**Je veux** naviguer entre les sections principales,
**Afin de** accéder rapidement aux fonctionnalités.

**Critères d'acceptation :**
- [ ] Onglets disponibles :
  - Accueil (restaurants)
  - Favoris
  - Panier (avec badge quantité)
  - Profil
- [ ] L'onglet actif est visuellement distinct
- [ ] La navigation est fluide

**Fichier concerné :** `app/(tabs)/_layout.tsx`

---

### US-NOTIF-001 : Notifications push (préparation)
**En tant que** utilisateur,
**Je veux** recevoir des notifications sur ma commande,
**Afin d'** être informé des changements de statut.

**Critères d'acceptation :**
- [ ] Permission demandée au démarrage
- [ ] Token enregistré côté backend
- [ ] Notifications reçues pour :
  - Commande confirmée
  - Commande en préparation
  - Commande prête à récupérer
- [ ] Son et vibration selon les paramètres

**Fichier concerné :** `src/contexts/PushNotificationContext.tsx`

---

### US-PERF-001 : Cache des données
**En tant que** utilisateur,
**Je veux** que l'app soit réactive,
**Afin de** ne pas attendre à chaque fois.

**Critères d'acceptation :**
- [ ] React Query avec staleTime de 10 minutes
- [ ] Cache des restaurants et menus
- [ ] Rafraîchissement en arrière-plan
- [ ] Pas de refetch automatique au focus

**Fichier concerné :** `app/_layout.tsx` (QueryClient config)

---

---

## Priorisation MVP

### Must Have (P0)
- US-AUTH-001, US-AUTH-004 (Connexion)
- US-HOME-001, US-HOME-006 (Restaurants)
- US-RESTO-001 à US-RESTO-006 (Menu)
- US-CART-001 à US-CART-008 (Panier)
- US-ORDER-001 à US-ORDER-005 (Suivi)

### Should Have (P1)
- US-AUTH-002, US-AUTH-003 (Social login)
- US-FAV-001 à US-FAV-004 (Favoris)
- US-PROFILE-001, US-PROFILE-005 (Profil)
- US-ORDER-006, US-ORDER-007 (Maps, téléphone)

### Nice to Have (P2)
- US-HOME-003, US-HOME-004 (Filtres avancés)
- US-SETTINGS-001 à US-SETTINGS-006 (Paramètres)
- US-SUPPORT-001 à US-SUPPORT-007 (Support)
- US-ACCOUNT-001 à US-ACCOUNT-005 (Gestion compte)

---

## Légende

- **US** : User Story
- **P0** : Critique pour le MVP
- **P1** : Important mais pas bloquant
- **P2** : Améliorations futures

---

*Document généré le 2026-01-15*
*Version : 1.0*
*Application : OneEats Mobile v1.0.0*
