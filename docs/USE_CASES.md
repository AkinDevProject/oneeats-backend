# 📖 Use Cases - OneEats

## 🎯 Vue d'Ensemble

Ce document décrit tous les cas d'usage de la plateforme OneEats pour les trois types d'acteurs :
- **Client** : Application mobile (React Native + Expo)
- **Restaurateur** : Dashboard web (React + Vite)
- **Administrateur** : Dashboard web (React + Vite)

**Dernière mise à jour** : 2025-12-12
**Version** : MVP 0.7

---

## 📚 Table des Matières

### 📱 Application Mobile Client
- [UC-001 : Créer un compte client](#uc-001--créer-un-compte-client)
- [UC-002 : Se connecter à l'application](#uc-002--se-connecter-à-lapplication)
- [UC-003 : Rechercher un restaurant](#uc-003--rechercher-un-restaurant)
- [UC-004 : Commander un repas](#uc-004--commander-un-repas)
- [UC-005 : Suivre une commande en temps réel](#uc-005--suivre-une-commande-en-temps-réel)
- [UC-006 : Annuler une commande](#uc-006--annuler-une-commande)
- [UC-007 : Consulter l'historique des commandes](#uc-007--consulter-lhistorique-des-commandes)
- [UC-008 : Gérer son profil utilisateur](#uc-008--gérer-son-profil-utilisateur)

### 🍽️ Dashboard Restaurateur
- [UC-101 : Recevoir et consulter les commandes](#uc-101--recevoir-et-consulter-les-commandes)
- [UC-102 : Accepter ou refuser une commande](#uc-102--accepter-ou-refuser-une-commande)
- [UC-103 : Gérer le cycle de vie d'une commande](#uc-103--gérer-le-cycle-de-vie-dune-commande)
- [UC-104 : Gérer le menu du restaurant](#uc-104--gérer-le-menu-du-restaurant)
- [UC-105 : Modifier le statut du restaurant](#uc-105--modifier-le-statut-du-restaurant)
- [UC-106 : Consulter les statistiques du restaurant](#uc-106--consulter-les-statistiques-du-restaurant)

### 🛡️ Dashboard Administrateur
- [UC-201 : Valider un nouveau restaurant](#uc-201--valider-un-nouveau-restaurant)
- [UC-202 : Gérer les restaurants (bloquer/activer)](#uc-202--gérer-les-restaurants-bloqueractiver)
- [UC-203 : Gérer les utilisateurs](#uc-203--gérer-les-utilisateurs)
- [UC-204 : Consulter le tableau de bord global](#uc-204--consulter-le-tableau-de-bord-global)
- [UC-205 : Exporter les statistiques](#uc-205--exporter-les-statistiques)

---

# 📱 Application Mobile Client

---

## UC-001 : Créer un compte client

### Informations Générales

| Propriété | Valeur |
|-----------|--------|
| **ID** | UC-001 |
| **Acteur principal** | Client (non authentifié) |
| **Type** | Primaire |
| **Priorité** | Haute |
| **Complexité** | Moyenne |

### Description
Le client crée un compte sur l'application mobile pour pouvoir passer des commandes.

### Préconditions
- L'application mobile est installée et lancée
- Le client n'est pas encore inscrit
- Connexion internet disponible

### Postconditions (succès)
- Un compte client est créé dans le système
- Le client reçoit un email de confirmation
- Le client est automatiquement connecté
- Le client est redirigé vers la page d'accueil (liste des restaurants)

### Flux Principal

1. Le client ouvre l'application mobile
2. Le client sélectionne "Créer un compte"
3. Le système affiche le formulaire d'inscription
4. Le client saisit :
   - Nom complet
   - Email
   - Mot de passe
   - Confirmation du mot de passe
5. Le client accepte les Conditions Générales d'Utilisation (RGPD)
6. Le client soumet le formulaire
7. Le système valide les données saisies
8. Le système crée le compte client avec le statut ACTIVE
9. Le système envoie un email de bienvenue
10. Le système connecte automatiquement le client
11. Le système redirige vers la page d'accueil

### Flux Alternatifs

**4a. Email déjà utilisé**
- Le système détecte que l'email existe déjà
- Le système affiche : "Cet email est déjà utilisé. Veuillez vous connecter."
- Le système propose un lien vers la page de connexion
- Retour à l'étape 2

**4b. Mot de passe trop faible**
- Le système détecte que le mot de passe ne respecte pas les critères
- Le système affiche : "Le mot de passe doit contenir au moins 8 caractères"
- Retour à l'étape 4

**4c. Les mots de passe ne correspondent pas**
- Le système détecte que les deux mots de passe sont différents
- Le système affiche : "Les mots de passe ne correspondent pas"
- Retour à l'étape 4

**5a. CGU non acceptées**
- Le client n'a pas coché la case d'acceptation
- Le système affiche : "Vous devez accepter les CGU pour continuer"
- Retour à l'étape 5

**7a. Erreur de validation**
- Le système détecte des données invalides
- Le système affiche les erreurs de validation
- Retour à l'étape 4

**7b. Erreur réseau**
- Le système ne peut pas communiquer avec le serveur
- Le système affiche : "Erreur de connexion. Veuillez réessayer."
- Retour à l'étape 6

### Règles Métier
- **RG-001** : L'email doit être unique dans le système
- **RG-002** : Le mot de passe doit contenir au moins 8 caractères
- **RG-003** : Le nom complet est obligatoire (min 2 caractères)
- **RG-004** : L'acceptation des CGU est obligatoire
- **RG-005** : Le compte est créé avec le statut ACTIVE par défaut

### Exigences Non Fonctionnelles
- **Performance** : La création du compte doit prendre moins de 2 secondes
- **Sécurité** : Le mot de passe doit être hashé (bcrypt) avant stockage
- **UX** : Validation en temps réel des champs (affichage instantané des erreurs)

---

## UC-002 : Se connecter à l'application

### Informations Générales

| Propriété | Valeur |
|-----------|--------|
| **ID** | UC-002 |
| **Acteur principal** | Client (non authentifié) |
| **Type** | Primaire |
| **Priorité** | Haute |
| **Complexité** | Faible |

### Description
Le client se connecte à l'application mobile avec son email et mot de passe.

### Préconditions
- Le client possède un compte actif (ACTIVE)
- L'application mobile est lancée
- Connexion internet disponible

### Postconditions (succès)
- Le client est authentifié dans le système
- Un token JWT est généré et stocké localement
- Le client est redirigé vers la page d'accueil (liste des restaurants)

### Flux Principal

1. Le client ouvre l'application mobile
2. Le client sélectionne "Se connecter"
3. Le système affiche le formulaire de connexion
4. Le client saisit son email
5. Le client saisit son mot de passe
6. Le client soumet le formulaire
7. Le système vérifie les identifiants
8. Le système génère un token JWT
9. Le système stocke le token localement (AsyncStorage)
10. Le système redirige vers la page d'accueil

### Flux Alternatifs

**7a. Identifiants incorrects**
- Le système détecte que l'email ou le mot de passe est incorrect
- Le système affiche : "Email ou mot de passe incorrect"
- Retour à l'étape 4

**7b. Compte inactif ou bloqué**
- Le système détecte que le compte a un statut différent de ACTIVE
- Le système affiche : "Votre compte est temporairement désactivé. Contactez le support."
- Fin du cas d'usage

**7c. Erreur réseau**
- Le système ne peut pas communiquer avec le serveur
- Le système affiche : "Erreur de connexion. Veuillez réessayer."
- Retour à l'étape 6

**7d. Mot de passe oublié**
- Le client clique sur "Mot de passe oublié ?"
- Le système affiche le formulaire de récupération
- Le client saisit son email
- Le système envoie un email de réinitialisation
- Fin du cas d'usage

### Règles Métier
- **RG-006** : Seuls les comptes avec statut ACTIVE peuvent se connecter
- **RG-007** : Le token JWT expire après 24 heures
- **RG-008** : Maximum 5 tentatives de connexion échouées par heure

### Exigences Non Fonctionnelles
- **Performance** : La connexion doit prendre moins de 1 seconde
- **Sécurité** :
  - Transmission des identifiants via HTTPS uniquement
  - Utilisation de JWT pour l'authentification
  - Pas de stockage du mot de passe en clair

---

## UC-003 : Rechercher un restaurant

### Informations Générales

| Propriété | Valeur |
|-----------|--------|
| **ID** | UC-003 |
| **Acteur principal** | Client (authentifié) |
| **Type** | Primaire |
| **Priorité** | Haute |
| **Complexité** | Moyenne |

### Description
Le client recherche et filtre les restaurants disponibles selon différents critères.

### Préconditions
- Le client est connecté
- Au moins un restaurant existe dans le système
- Connexion internet disponible

### Postconditions (succès)
- La liste des restaurants correspondant aux critères est affichée
- Le client peut sélectionner un restaurant pour consulter son menu

### Flux Principal

1. Le client accède à la page d'accueil
2. Le système affiche la liste de tous les restaurants actifs
3. Le client saisit un terme de recherche dans la barre de recherche
4. Le système filtre la liste en temps réel
5. Le client peut appliquer des filtres supplémentaires :
   - Statut : Ouvert maintenant / Tous
   - Catégorie : Fast-food, Restaurant, Café, Boulangerie, etc.
   - Distance : Proximité géographique (si géolocalisation activée)
6. Le système affiche les restaurants correspondants
7. Le client consulte les informations de chaque restaurant :
   - Nom
   - Description
   - Image
   - Distance (si géolocalisation activée)
   - Statut (Ouvert/Fermé)
   - Horaires d'ouverture
8. Le client sélectionne un restaurant
9. Le système redirige vers la page détail du restaurant (UC-004)

### Flux Alternatifs

**2a. Aucun restaurant disponible**
- Le système détecte qu'aucun restaurant n'est actif
- Le système affiche : "Aucun restaurant disponible pour le moment"
- Fin du cas d'usage

**4a. Aucun résultat trouvé**
- Le système ne trouve aucun restaurant correspondant
- Le système affiche : "Aucun restaurant trouvé pour votre recherche"
- Le système suggère de modifier les critères
- Retour à l'étape 3

**5a. Géolocalisation désactivée**
- Le client n'a pas autorisé la géolocalisation
- Le système affiche les restaurants sans tri par distance
- Le système propose d'activer la géolocalisation
- Suite à l'étape 6

**6a. Erreur de chargement**
- Le système ne peut pas charger la liste des restaurants
- Le système affiche : "Erreur de chargement. Veuillez réessayer."
- Le système propose un bouton "Réessayer"
- Retour à l'étape 2

### Règles Métier
- **RG-009** : Seuls les restaurants avec statut ACTIVE sont affichés
- **RG-010** : Les restaurants fermés sont affichés mais marqués clairement
- **RG-011** : La recherche est insensible à la casse et aux accents
- **RG-012** : Les résultats sont triés par pertinence puis par distance

### Exigences Non Fonctionnelles
- **Performance** : Le filtrage en temps réel doit être instantané (< 100ms)
- **UX** :
  - Skeleton loading pendant le chargement initial
  - Pull-to-refresh pour rafraîchir la liste
  - Scroll infini si plus de 20 restaurants

---

## UC-004 : Commander un repas

### Informations Générales

| Propriété | Valeur |
|-----------|--------|
| **ID** | UC-004 |
| **Acteur principal** | Client (authentifié) |
| **Type** | Primaire |
| **Priorité** | Critique |
| **Complexité** | Haute |

### Description
Le client sélectionne des plats dans un restaurant, les ajoute au panier et passe une commande.

### Préconditions
- Le client est connecté
- Le client a sélectionné un restaurant (UC-003)
- Le restaurant est ouvert (isOpen = true)
- Le restaurant est actif (isActive = true)
- Le restaurant a au moins un article disponible

### Postconditions (succès)
- Une commande est créée avec le statut EN_ATTENTE
- Le panier du client est vidé
- Le restaurant reçoit une notification de nouvelle commande
- Le client reçoit une confirmation avec un numéro de commande
- Le client est redirigé vers la page de suivi de commande (UC-005)

### Flux Principal

1. Le client consulte la page détail du restaurant
2. Le système affiche :
   - Informations du restaurant (nom, description, horaires)
   - Choix du mode de récupération
   - Menu organisé par catégories
3. Le client choisit le mode de récupération :
   - **À emporter** (TAKEAWAY)
   - **Sur place** (DINE_IN)
4. Le client parcourt le menu par catégories
5. Le client sélectionne un article
6. Le système affiche les détails de l'article :
   - Nom, description, prix
   - Image
   - Options diététiques (végétarien, vegan, allergènes)
   - Temps de préparation estimé
7. Le client ajuste la quantité (+/-)
8. Le client ajoute l'article au panier
9. Le système met à jour le panier et affiche le total
10. Le client répète les étapes 5-9 pour chaque article souhaité
11. Le client accède au panier
12. Le système affiche :
    - Liste des articles (nom, quantité, prix unitaire, sous-total)
    - Prix total TTC
    - Mode de récupération sélectionné
13. Le client peut ajouter des instructions spéciales (optionnel)
14. Le client valide le panier
15. Le système affiche le récapitulatif de la commande
16. Le client confirme la commande
17. Le système vérifie :
    - Restaurant toujours ouvert et actif
    - Articles toujours disponibles
    - Prix toujours valides
18. Le système crée la commande avec statut EN_ATTENTE
19. Le système calcule le temps de préparation estimé
20. Le système envoie une notification au restaurant
21. Le système affiche la confirmation avec :
    - Numéro de commande
    - Temps d'attente estimé
    - Récapitulatif de la commande
22. Le système redirige vers la page de suivi (UC-005)

### Flux Alternatifs

**2a. Restaurant fermé**
- Le système détecte que le restaurant est fermé (isOpen = false)
- Le système affiche : "Ce restaurant est actuellement fermé"
- Le système affiche les horaires d'ouverture
- Fin du cas d'usage

**2b. Restaurant inactif**
- Le système détecte que le restaurant est inactif (isActive = false)
- Le système affiche : "Ce restaurant n'accepte plus de commandes"
- Le système propose de retourner à la recherche
- Fin du cas d'usage

**2c. Aucun article disponible**
- Le système détecte qu'aucun article n'est disponible
- Le système affiche : "Aucun plat disponible actuellement"
- Fin du cas d'usage

**5a. Article indisponible**
- Le client sélectionne un article marqué comme indisponible
- Le système affiche : "Cet article n'est pas disponible"
- Le système grise le bouton d'ajout au panier
- Retour à l'étape 4

**8a. Panier vide**
- Le client tente de valider un panier vide
- Le système affiche : "Votre panier est vide"
- Retour à l'étape 4

**17a. Restaurant fermé entre-temps**
- Le système détecte que le restaurant s'est fermé
- Le système annule l'opération
- Le système affiche : "Le restaurant est maintenant fermé. Votre commande n'a pas pu être passée."
- Le système propose de conserver le panier pour plus tard
- Fin du cas d'usage

**17b. Article devenu indisponible**
- Le système détecte qu'un article du panier est devenu indisponible
- Le système affiche : "[Nom article] n'est plus disponible"
- Le système retire l'article du panier
- Le système recalcule le total
- Le système propose de continuer sans cet article
- Retour à l'étape 14

**17c. Prix modifié**
- Le système détecte qu'un prix a changé
- Le système affiche : "Les prix ont été mis à jour"
- Le système recalcule le total
- Retour à l'étape 14

**18a. Erreur de création**
- Le système ne peut pas créer la commande (erreur serveur)
- Le système affiche : "Une erreur est survenue. Votre commande n'a pas pu être passée."
- Le système propose de réessayer
- Retour à l'étape 16

### Règles Métier
- **RG-013** : Le panier ne peut pas être vide
- **RG-014** : Tous les articles du panier doivent être disponibles (isAvailable = true)
- **RG-015** : Le restaurant doit être ouvert ET actif au moment de la commande
- **RG-016** : Prix total = Somme(quantité × prix unitaire)
- **RG-017** : Pas de frais de livraison (récupération sur place)
- **RG-018** : Instructions spéciales limitées à 500 caractères
- **RG-019** : Temps estimé = Max(temps de préparation des articles) + 5 minutes

### Exigences Non Fonctionnelles
- **Performance** :
  - Ajout au panier instantané (< 100ms)
  - Création de commande < 2 secondes
- **UX** :
  - Animation visuelle lors de l'ajout au panier
  - Badge panier avec nombre d'articles
  - Confirmation visuelle de la commande
- **Sécurité** : Vérification de l'intégrité des prix côté serveur

---

## UC-005 : Suivre une commande en temps réel

### Informations Générales

| Propriété | Valeur |
|-----------|--------|
| **ID** | UC-005 |
| **Acteur principal** | Client (authentifié) |
| **Type** | Primaire |
| **Priorité** | Haute |
| **Complexité** | Moyenne |

### Description
Le client suit l'évolution de sa commande en temps réel et reçoit des notifications à chaque changement de statut.

### Préconditions
- Le client est connecté
- Le client a passé une commande (UC-004)
- La commande existe avec un statut actif

### Postconditions (succès)
- Le client connaît le statut actuel de sa commande
- Le client a été notifié des changements de statut
- Le client sait quand récupérer sa commande

### Flux Principal

1. Le client accède à la page de suivi de commande
2. Le système affiche :
   - Numéro de commande
   - Statut actuel
   - Timeline des statuts (visuelle)
   - Temps d'attente estimé
   - Détails de la commande
   - Nom et adresse du restaurant
3. Le système écoute les changements de statut en temps réel
4. Lorsque le restaurant change le statut :
   - Le système met à jour l'affichage
   - Le système envoie une notification push au client
5. Le client consulte la notification et/ou l'application
6. Le système affiche le nouveau statut et temps estimé

**Statuts possibles :**
- ⏳ **EN_ATTENTE** : "Votre commande a été envoyée au restaurant"
- 👨‍🍳 **EN_PREPARATION** : "Votre commande est en cours de préparation"
- ✅ **PRETE** : "Votre commande est prête ! Vous pouvez venir la récupérer"
- 🎉 **RECUPEREE** : "Commande récupérée. Bon appétit !"
- ❌ **ANNULEE** : "Votre commande a été annulée"

### Flux Alternatifs

**4a. Commande annulée par le restaurant**
- Le système reçoit le statut ANNULEE
- Le système envoie une notification : "Votre commande a été annulée par le restaurant"
- Le système affiche le motif d'annulation
- Le système propose de passer une nouvelle commande
- Fin du cas d'usage

**4b. Commande annulée par le client**
- Voir UC-006

**4c. Perte de connexion**
- Le système ne peut pas recevoir les mises à jour
- Le système affiche : "Connexion perdue. Reconnexion..."
- Le système tente de se reconnecter automatiquement
- Suite à l'étape 3

**6a. Temps d'attente dépassé**
- Le système détecte que le temps estimé est dépassé de plus de 15 minutes
- Le système affiche : "Votre commande prend plus de temps que prévu"
- Le système suggère de contacter le restaurant
- Suite à l'étape 6

### Règles Métier
- **RG-020** : Les statuts suivent le cycle : EN_ATTENTE → EN_PREPARATION → PRETE → RECUPEREE
- **RG-021** : Une commande peut passer à ANNULEE depuis n'importe quel statut sauf RECUPEREE
- **RG-022** : Le temps estimé est recalculé à chaque changement de statut
- **RG-023** : Les notifications sont envoyées uniquement si l'application n'est pas au premier plan

### Exigences Non Fonctionnelles
- **Performance** :
  - Mise à jour temps réel (< 500ms après changement)
  - Notifications push reçues en < 2 secondes
- **UX** :
  - Timeline visuelle claire et intuitive
  - Animations de transition entre statuts
  - Sons/vibrations pour notifications (configurables)
- **Technique** : WebSocket ou polling (intervalle 5 secondes) pour temps réel

---

## UC-006 : Annuler une commande

### Informations Générales

| Propriété | Valeur |
|-----------|--------|
| **ID** | UC-006 |
| **Acteur principal** | Client (authentifié) |
| **Type** | Primaire |
| **Priorité** | Moyenne |
| **Complexité** | Moyenne |

### Description
Le client annule sa commande si elle n'a pas encore commencé à être préparée.

### Préconditions
- Le client est connecté
- Le client a une commande active
- La commande est en statut EN_ATTENTE uniquement
- La commande n'a pas encore été acceptée par le restaurant

### Postconditions (succès)
- La commande passe au statut ANNULEE
- Le restaurant reçoit une notification d'annulation
- Le client reçoit une confirmation d'annulation
- Le client peut passer une nouvelle commande

### Flux Principal

1. Le client accède à la page de suivi de sa commande (UC-005)
2. Le système affiche le bouton "Annuler la commande" (si statut = EN_ATTENTE)
3. Le client clique sur "Annuler la commande"
4. Le système affiche une modale de confirmation :
   - "Êtes-vous sûr de vouloir annuler cette commande ?"
   - Boutons : "Confirmer" / "Non, conserver"
5. Le client confirme l'annulation
6. Le système vérifie que la commande est toujours en statut EN_ATTENTE
7. Le système passe la commande au statut ANNULEE
8. Le système envoie une notification au restaurant
9. Le système affiche : "Votre commande a été annulée avec succès"
10. Le système propose de retourner à la recherche de restaurants

### Flux Alternatifs

**2a. Annulation impossible**
- Le système détecte que la commande n'est plus en statut EN_ATTENTE
- Le système masque le bouton "Annuler la commande"
- Le système affiche : "Cette commande ne peut plus être annulée"
- Fin du cas d'usage

**6a. Commande déjà acceptée**
- Le système détecte que la commande est passée à EN_PREPARATION
- Le système affiche : "Cette commande a déjà été acceptée par le restaurant et ne peut plus être annulée"
- Le système suggère de contacter le restaurant directement
- Fin du cas d'usage

**7a. Erreur d'annulation**
- Le système ne peut pas annuler la commande (erreur serveur)
- Le système affiche : "Une erreur est survenue. L'annulation a échoué."
- Le système propose de réessayer
- Retour à l'étape 5

### Règles Métier
- **RG-024** : Seules les commandes en statut EN_ATTENTE peuvent être annulées par le client
- **RG-025** : Après passage à EN_PREPARATION, seul le restaurant peut annuler
- **RG-026** : Une commande ANNULEE ne peut pas revenir à un autre statut

### Exigences Non Fonctionnelles
- **Performance** : Annulation effective en < 1 seconde
- **UX** :
  - Confirmation obligatoire pour éviter les annulations accidentelles
  - Message clair et rassurant
- **Sécurité** : Vérification côté serveur que l'utilisateur est bien le propriétaire de la commande

---

## UC-007 : Consulter l'historique des commandes

### Informations Générales

| Propriété | Valeur |
|-----------|--------|
| **ID** | UC-007 |
| **Acteur principal** | Client (authentifié) |
| **Type** | Secondaire |
| **Priorité** | Moyenne |
| **Complexité** | Faible |

### Description
Le client consulte la liste de toutes ses commandes passées avec leurs détails.

### Préconditions
- Le client est connecté
- Le client a passé au moins une commande dans le passé

### Postconditions (succès)
- Le client visualise l'historique complet de ses commandes
- Le client peut consulter le détail de chaque commande

### Flux Principal

1. Le client accède à son profil
2. Le client sélectionne "Historique des commandes"
3. Le système affiche la liste des commandes par ordre chronologique inversé (plus récentes en premier)
4. Pour chaque commande, le système affiche :
   - Date et heure
   - Nom du restaurant
   - Statut final (RECUPEREE, ANNULEE)
   - Prix total
   - Miniature du premier article
5. Le client peut filtrer par :
   - Statut (Toutes / Terminées / Annulées)
   - Période (Dernière semaine / Dernier mois / Tout)
   - Restaurant
6. Le client sélectionne une commande
7. Le système affiche le détail complet :
   - Tous les articles commandés (nom, quantité, prix)
   - Prix total
   - Mode de récupération
   - Instructions spéciales
   - Timeline complète des statuts
   - Informations du restaurant
8. Le client peut réutiliser cette commande (bouton "Commander à nouveau")
9. Le système pré-remplit le panier avec les mêmes articles
10. Redirection vers UC-004 (étape 11)

### Flux Alternatifs

**3a. Aucune commande dans l'historique**
- Le système détecte que le client n'a jamais passé de commande
- Le système affiche : "Vous n'avez pas encore passé de commande"
- Le système propose un bouton "Découvrir les restaurants"
- Fin du cas d'usage

**5a. Aucun résultat pour les filtres**
- Le système ne trouve aucune commande correspondant aux filtres
- Le système affiche : "Aucune commande trouvée pour ces critères"
- Le système propose de modifier les filtres
- Retour à l'étape 5

**9a. Articles indisponibles**
- Le système détecte que certains articles ne sont plus disponibles
- Le système ajoute uniquement les articles disponibles au panier
- Le système affiche : "Certains articles ne sont plus disponibles et ont été retirés"
- Suite à l'étape 10

**9b. Restaurant fermé ou inactif**
- Le système détecte que le restaurant n'est plus disponible
- Le système affiche : "Ce restaurant n'accepte plus de commandes"
- Le système masque le bouton "Commander à nouveau"
- Retour à l'étape 7

### Règles Métier
- **RG-027** : L'historique affiche uniquement les commandes du client connecté
- **RG-028** : Les commandes sont triées par date décroissante (plus récentes d'abord)
- **RG-029** : L'historique contient toutes les commandes quel que soit leur statut

### Exigences Non Fonctionnelles
- **Performance** :
  - Chargement de l'historique < 2 secondes
  - Pagination si > 50 commandes
- **UX** :
  - Pull-to-refresh
  - Skeleton loading
  - Scroll infini

---

## UC-008 : Gérer son profil utilisateur

### Informations Générales

| Propriété | Valeur |
|-----------|--------|
| **ID** | UC-008 |
| **Acteur principal** | Client (authentifié) |
| **Type** | Secondaire |
| **Priorité** | Basse |
| **Complexité** | Faible |

### Description
Le client consulte et modifie les informations de son profil personnel.

### Préconditions
- Le client est connecté

### Postconditions (succès)
- Les informations du profil sont mises à jour
- Le client reçoit une confirmation

### Flux Principal

1. Le client accède à son profil
2. Le système affiche :
   - Photo de profil (optionnelle)
   - Nom complet
   - Email
   - Téléphone (optionnel)
   - Adresse (optionnelle)
   - Préférences (notifications, langue)
3. Le client sélectionne "Modifier mon profil"
4. Le système affiche le formulaire d'édition
5. Le client modifie les champs souhaités
6. Le client soumet les modifications
7. Le système valide les données
8. Le système met à jour le profil
9. Le système affiche : "Profil mis à jour avec succès"
10. Le système redirige vers la vue du profil

### Flux Alternatifs

**7a. Email déjà utilisé**
- Le système détecte que le nouvel email existe déjà
- Le système affiche : "Cet email est déjà utilisé"
- Retour à l'étape 5

**7b. Données invalides**
- Le système détecte des données invalides
- Le système affiche les erreurs de validation
- Retour à l'étape 5

**8a. Erreur de mise à jour**
- Le système ne peut pas mettre à jour le profil
- Le système affiche : "Une erreur est survenue. Veuillez réessayer."
- Retour à l'étape 6

**Flux alternatif : Modifier le mot de passe**
1. Le client sélectionne "Changer mon mot de passe"
2. Le système affiche le formulaire :
   - Mot de passe actuel
   - Nouveau mot de passe
   - Confirmation nouveau mot de passe
3. Le client saisit les informations
4. Le système vérifie le mot de passe actuel
5. Le système valide le nouveau mot de passe
6. Le système met à jour le mot de passe
7. Le système affiche : "Mot de passe modifié avec succès"
8. Le système déconnecte le client pour sécurité
9. Redirection vers la page de connexion (UC-002)

**Flux alternatif : Supprimer le compte**
1. Le client sélectionne "Supprimer mon compte"
2. Le système affiche un avertissement :
   - "Cette action est irréversible"
   - "Toutes vos données seront supprimées"
   - "Vos commandes en cours seront annulées"
3. Le client confirme en saisissant son mot de passe
4. Le système vérifie le mot de passe
5. Le système annule toutes les commandes en cours (EN_ATTENTE)
6. Le système supprime le compte (soft delete ou hard delete selon RGPD)
7. Le système affiche : "Votre compte a été supprimé"
8. Le système déconnecte le client
9. Fin du cas d'usage

### Règles Métier
- **RG-030** : L'email doit rester unique
- **RG-031** : Le téléphone doit être au format international (si renseigné)
- **RG-032** : Le nouveau mot de passe doit respecter les mêmes règles que lors de l'inscription
- **RG-033** : La suppression du compte annule automatiquement toutes les commandes EN_ATTENTE

### Exigences Non Fonctionnelles
- **Performance** : Mise à jour < 1 seconde
- **Sécurité** :
  - Demander le mot de passe actuel pour changements sensibles
  - Déconnexion après changement de mot de passe
  - Confirmation obligatoire pour suppression de compte
- **RGPD** : Respect du droit à l'effacement des données

---

# 🍽️ Dashboard Restaurateur

---

## UC-101 : Recevoir et consulter les commandes

### Informations Générales

| Propriété | Valeur |
|-----------|--------|
| **ID** | UC-101 |
| **Acteur principal** | Restaurateur (authentifié) |
| **Type** | Primaire |
| **Priorité** | Critique |
| **Complexité** | Haute |

### Description
Le restaurateur reçoit les commandes en temps réel et consulte leur détail sur le dashboard web.

### Préconditions
- Le restaurateur est connecté au dashboard web
- Le restaurant est actif (isActive = true)
- Le restaurant est ouvert (isOpen = true)

### Postconditions (succès)
- Le restaurateur visualise toutes les commandes en cours
- Le restaurateur est notifié des nouvelles commandes
- Le restaurateur peut traiter les commandes

### Flux Principal

1. Le restaurateur accède à la page "Commandes"
2. Le système affiche la liste des commandes filtrées par statut :
   - **Nouvelles** (EN_ATTENTE) - Badge rouge
   - **En préparation** (EN_PREPARATION) - Badge orange
   - **Prêtes** (PRETE) - Badge vert
   - **Récupérées** (RECUPEREE) - Badge gris
   - **Annulées** (ANNULEE) - Badge noir
3. Pour chaque commande, le système affiche :
   - Numéro de commande
   - Heure de commande
   - Nom du client
   - Mode de récupération (Emporter / Sur place)
   - Nombre d'articles
   - Prix total
   - Temps écoulé depuis la commande
   - Statut actuel
4. Le système écoute les nouvelles commandes en temps réel
5. Lorsqu'une nouvelle commande arrive :
   - Le système affiche une notification visuelle (badge, popup)
   - Le système émet un son de notification (si activé)
   - Le système ajoute la commande en haut de la liste "Nouvelles"
   - Le système fait clignoter la ligne pendant 3 secondes
6. Le restaurateur clique sur une commande
7. Le système affiche le détail complet :
   - Toutes les informations client (nom, téléphone si disponible)
   - Liste détaillée des articles (nom, quantité, prix unitaire)
   - Instructions spéciales du client
   - Heure de commande
   - Temps estimé de préparation
   - Mode de récupération
   - Prix total
   - Historique des changements de statut
8. Le restaurateur peut choisir une action :
   - Accepter (UC-102)
   - Refuser (UC-102)
   - Changer le statut (UC-103)

### Flux Alternatifs

**2a. Aucune commande**
- Le système détecte qu'il n'y a aucune commande
- Le système affiche : "Aucune commande pour le moment"
- Le système reste en écoute des nouvelles commandes
- Suite à l'étape 4

**5a. Notifications désactivées**
- Le restaurateur a désactivé les notifications sonores
- Le système affiche uniquement la notification visuelle
- Suite à l'étape 5

**5b. Multiple commandes simultanées**
- Le système reçoit plusieurs commandes en même temps
- Le système empile les notifications
- Le système affiche le nombre total de nouvelles commandes
- Suite à l'étape 5

**6a. Perte de connexion**
- Le système ne peut plus recevoir les mises à jour en temps réel
- Le système affiche : "Connexion perdue. Reconnexion..."
- Le système tente de se reconnecter automatiquement
- Suite à l'étape 4

### Règles Métier
- **RG-034** : Le restaurateur ne voit que les commandes de son propre restaurant
- **RG-035** : Les commandes EN_ATTENTE doivent être traitées en priorité
- **RG-036** : Une alerte visuelle est affichée si une commande EN_ATTENTE a plus de 10 minutes
- **RG-037** : Les notifications sonores peuvent être activées/désactivées

### Exigences Non Fonctionnelles
- **Performance** :
  - Affichage temps réel (< 500ms après création)
  - Chargement de la liste < 2 secondes
- **UX** :
  - Tri automatique par urgence (temps écoulé)
  - Rafraîchissement automatique toutes les 5 secondes (fallback si WebSocket échoue)
  - Indicateur visuel clair pour commandes urgentes
- **Accessibilité** : Notifications sonores configurables (volume, type de son)

---

## UC-102 : Accepter ou refuser une commande

### Informations Générales

| Propriété | Valeur |
|-----------|--------|
| **ID** | UC-102 |
| **Acteur principal** | Restaurateur (authentifié) |
| **Type** | Primaire |
| **Priorité** | Critique |
| **Complexité** | Moyenne |

### Description
Le restaurateur décide d'accepter ou de refuser une commande en statut EN_ATTENTE.

### Préconditions
- Le restaurateur est connecté
- La commande existe et est en statut EN_ATTENTE
- Le restaurant est actif et ouvert

### Postconditions (succès)

**Si acceptée :**
- La commande passe au statut EN_PREPARATION
- Le client reçoit une notification d'acceptation
- Le timer de préparation démarre

**Si refusée :**
- La commande passe au statut ANNULEE
- Le client reçoit une notification avec le motif
- Le client peut passer une nouvelle commande

### Flux Principal : Accepter

1. Le restaurateur consulte le détail d'une commande EN_ATTENTE (UC-101)
2. Le restaurateur vérifie :
   - Disponibilité des ingrédients
   - Capacité de production
   - Temps de préparation nécessaire
3. Le restaurateur clique sur "Accepter la commande"
4. Le système affiche une modale :
   - "Temps de préparation estimé ?" (pré-rempli selon menu)
   - Champ ajustable (en minutes)
   - Bouton "Confirmer"
5. Le restaurateur ajuste le temps si nécessaire
6. Le restaurateur confirme
7. Le système passe la commande à EN_PREPARATION
8. Le système démarre le timer de préparation
9. Le système envoie une notification push au client :
   - "Votre commande a été acceptée et est en cours de préparation"
   - "Temps estimé : X minutes"
10. Le système affiche : "Commande acceptée avec succès"
11. La commande passe dans l'onglet "En préparation"

### Flux Principal : Refuser

1. Le restaurateur consulte le détail d'une commande EN_ATTENTE (UC-101)
2. Le restaurateur identifie une raison de refus :
   - Rupture de stock
   - Fermeture imprévue
   - Trop de commandes en cours
   - Autre raison
3. Le restaurateur clique sur "Refuser la commande"
4. Le système affiche une modale :
   - "Raison du refus ?" (menu déroulant + champ texte libre)
   - Options prédéfinies :
     - "Article(s) indisponible(s)"
     - "Fermeture imprévue"
     - "Trop de commandes"
     - "Autre (préciser)"
   - Bouton "Confirmer le refus"
5. Le restaurateur sélectionne/saisit la raison
6. Le restaurateur confirme le refus
7. Le système passe la commande à ANNULEE
8. Le système enregistre la raison de refus
9. Le système envoie une notification push au client :
   - "Votre commande a été refusée"
   - "Raison : [raison]"
   - "Vous pouvez passer une nouvelle commande"
10. Le système affiche : "Commande refusée"
11. La commande passe dans l'onglet "Annulées"

### Flux Alternatifs

**6a. Temps de préparation non renseigné (Acceptation)**
- Le restaurateur n'a pas renseigné de temps
- Le système utilise la valeur par défaut (somme des temps des articles)
- Suite à l'étape 7

**6b. Temps de préparation trop long (Acceptation)**
- Le restaurateur saisit un temps > 60 minutes
- Le système affiche un avertissement : "Ce délai est très long. Le client sera notifié."
- Le restaurateur peut confirmer ou ajuster
- Suite à l'étape 7

**5a. Raison de refus non renseignée (Refus)**
- Le restaurateur n'a pas sélectionné/saisi de raison
- Le système affiche : "Veuillez indiquer une raison de refus"
- Retour à l'étape 5

**7a. Commande déjà annulée par le client**
- Le système détecte que le client a annulé entre-temps
- Le système affiche : "Cette commande a été annulée par le client"
- La commande disparaît de la liste EN_ATTENTE
- Fin du cas d'usage

**7b. Erreur de changement de statut**
- Le système ne peut pas changer le statut (erreur serveur)
- Le système affiche : "Une erreur est survenue. Veuillez réessayer."
- Retour à l'étape 3 ou 6 selon l'action

### Règles Métier
- **RG-038** : Seules les commandes EN_ATTENTE peuvent être acceptées ou refusées
- **RG-039** : Une commande refusée ne peut pas revenir à un autre statut
- **RG-040** : Le temps de préparation doit être entre 5 et 120 minutes
- **RG-041** : La raison de refus est obligatoire et enregistrée
- **RG-042** : L'acceptation démarre automatiquement le timer de préparation

### Exigences Non Fonctionnelles
- **Performance** : Changement de statut < 1 seconde
- **UX** :
  - Boutons "Accepter" et "Refuser" clairement différenciés (couleurs)
  - Confirmation obligatoire pour refus (éviter erreurs)
  - Feedback visuel immédiat
- **Analytics** :
  - Taux d'acceptation/refus enregistré
  - Raisons de refus trackées pour amélioration

---

## UC-103 : Gérer le cycle de vie d'une commande

### Informations Générales

| Propriété | Valeur |
|-----------|--------|
| **ID** | UC-103 |
| **Acteur principal** | Restaurateur (authentifié) |
| **Type** | Primaire |
| **Priorité** | Critique |
| **Complexité** | Moyenne |

### Description
Le restaurateur fait progresser la commande à travers les différents statuts jusqu'à sa récupération par le client.

### Préconditions
- Le restaurateur est connecté
- La commande existe et est en statut EN_PREPARATION ou PRETE

### Postconditions (succès)
- La commande progresse au statut suivant
- Le client reçoit une notification du changement
- Le timer est mis à jour

### Flux Principal : EN_PREPARATION → PRETE

1. Le restaurateur consulte les commandes en préparation
2. La préparation de la commande est terminée
3. Le restaurateur clique sur "Marquer comme prête"
4. Le système affiche une confirmation :
   - "La commande est-elle vraiment prête ?"
   - Bouton "Oui, elle est prête"
5. Le restaurateur confirme
6. Le système passe la commande à PRETE
7. Le système arrête le timer de préparation
8. Le système envoie une notification push au client :
   - "Votre commande est prête !"
   - "Vous pouvez venir la récupérer"
   - Adresse du restaurant
9. Le système affiche : "Commande marquée comme prête"
10. La commande passe dans l'onglet "Prêtes"
11. Le système active un timer d'attente (max 30 minutes)

### Flux Principal : PRETE → RECUPEREE

1. Le restaurateur consulte les commandes prêtes
2. Le client arrive pour récupérer sa commande
3. Le restaurateur vérifie l'identité du client (nom, numéro de commande)
4. Le restaurateur remet la commande au client
5. Le restaurateur clique sur "Commande récupérée"
6. Le système affiche une confirmation :
   - "La commande a-t-elle été récupérée par le client ?"
   - Bouton "Oui, remise au client"
7. Le restaurateur confirme
8. Le système passe la commande à RECUPEREE
9. Le système arrête le timer d'attente
10. Le système enregistre l'heure de récupération
11. Le système affiche : "Commande terminée"
12. La commande passe dans l'onglet "Récupérées"
13. Le système peut demander un feedback (optionnel)

### Flux Alternatifs

**11a. Client ne vient pas récupérer (PRETE → ANNULEE)**
- Le timer d'attente expire (> 30 minutes)
- Le système affiche une alerte : "Commande prête depuis plus de 30 minutes"
- Le restaurateur tente de contacter le client (si numéro disponible)
- Le restaurateur clique sur "Client absent - Annuler"
- Le système affiche une modale de confirmation
- Le restaurateur confirme
- Le système passe la commande à ANNULEE
- Le système enregistre le motif : "Client n'a pas récupéré"
- Fin du cas d'usage

**3a. Problème pendant la préparation (EN_PREPARATION → ANNULEE)**
- Le restaurateur détecte un problème (rupture ingrédient, incident)
- Le restaurateur clique sur "Annuler la commande"
- Le système affiche : "Raison de l'annulation ?"
- Le restaurateur saisit la raison
- Le restaurateur confirme
- Le système passe la commande à ANNULEE
- Le système envoie une notification au client avec la raison
- Le système suggère un geste commercial (coupon, remise)
- Fin du cas d'usage

**6a. Erreur de changement de statut**
- Le système ne peut pas changer le statut
- Le système affiche : "Une erreur est survenue. Veuillez réessayer."
- Retour à l'étape 5

### Règles Métier
- **RG-043** : EN_PREPARATION → PRETE → RECUPEREE (cycle normal)
- **RG-044** : EN_PREPARATION ou PRETE → ANNULEE (en cas de problème)
- **RG-045** : Une commande RECUPEREE ne peut plus changer de statut
- **RG-046** : Alerte si commande PRETE > 30 minutes
- **RG-047** : L'heure de récupération effective est enregistrée

### Exigences Non Fonctionnelles
- **Performance** : Changement de statut instantané (< 500ms)
- **UX** :
  - Boutons d'action visibles et accessibles
  - Confirmations rapides (pas trop de clics)
  - Tri des commandes par temps d'attente
- **Analytics** :
  - Temps moyen de préparation
  - Temps moyen d'attente après PRETE
  - Taux d'abandons (PRETE non récupérée)

---

## UC-104 : Gérer le menu du restaurant

### Informations Générales

| Propriété | Valeur |
|-----------|--------|
| **ID** | UC-104 |
| **Acteur principal** | Restaurateur (authentifié) |
| **Type** | Primaire |
| **Priorité** | Haute |
| **Complexité** | Haute |

### Description
Le restaurateur crée, modifie, supprime et gère la disponibilité des articles de menu et des catégories.

### Préconditions
- Le restaurateur est connecté
- Le restaurant existe et est validé

### Postconditions (succès)
- Le menu est mis à jour
- Les modifications sont visibles immédiatement pour les clients
- Les articles indisponibles ne peuvent plus être commandés

### Flux Principal : Créer un article

1. Le restaurateur accède à la page "Menu"
2. Le système affiche :
   - Liste des catégories
   - Liste des articles par catégorie
   - Bouton "Ajouter un article"
3. Le restaurateur clique sur "Ajouter un article"
4. Le système affiche le formulaire :
   - Nom* (max 100 caractères)
   - Description (max 500 caractères)
   - Prix* (€, avec décimales)
   - Catégorie* (menu déroulant)
   - Image (upload)
   - Temps de préparation (minutes)
   - Options diététiques :
     - ☑ Végétarien
     - ☑ Vegan
     - Allergènes (multi-sélection)
   - ☑ Disponible (coché par défaut)
5. Le restaurateur remplit le formulaire
6. Le restaurateur soumet
7. Le système valide les données :
   - Nom unique pour ce restaurant
   - Prix > 0
   - Catégorie existe
8. Le système crée l'article
9. Le système compresse et stocke l'image (si fournie)
10. Le système affiche : "Article créé avec succès"
11. L'article apparaît dans la liste de sa catégorie

### Flux Principal : Modifier un article

1. Le restaurateur consulte le menu
2. Le restaurateur clique sur un article
3. Le système affiche le détail de l'article
4. Le restaurateur clique sur "Modifier"
5. Le système affiche le formulaire pré-rempli
6. Le restaurateur modifie les champs souhaités
7. Le restaurateur soumet
8. Le système valide les modifications
9. Le système met à jour l'article
10. Le système affiche : "Article mis à jour"
11. Le système met à jour le cache et notifie les clients

### Flux Principal : Supprimer un article

1. Le restaurateur consulte le menu
2. Le restaurateur clique sur un article
3. Le restaurateur clique sur "Supprimer"
4. Le système affiche une modale :
   - "Êtes-vous sûr de vouloir supprimer cet article ?"
   - "Cette action est irréversible"
   - Liste des commandes en cours contenant cet article (si applicable)
   - Boutons : "Confirmer" / "Annuler"
5. Le restaurateur confirme
6. Le système vérifie qu'aucune commande en cours ne contient cet article
7. Le système supprime l'article (soft delete)
8. Le système affiche : "Article supprimé"
9. L'article disparaît de la liste

### Flux Principal : Gérer la disponibilité

1. Le restaurateur consulte le menu
2. Le restaurateur repère un article en rupture de stock
3. Le restaurateur clique sur le toggle "Disponible/Indisponible"
4. Le système change immédiatement le statut
5. Le système affiche : "Disponibilité mise à jour"
6. Si passage à "Indisponible" :
   - L'article est grisé dans la liste
   - Les clients ne peuvent plus l'ajouter au panier
   - Les articles déjà dans les paniers sont retirés

### Flux Principal : Gérer les catégories

1. Le restaurateur accède à la page "Catégories"
2. Le système affiche toutes les catégories avec nombre d'articles
3. Le restaurateur peut :
   - Créer une nouvelle catégorie (nom + description)
   - Modifier une catégorie existante
   - Supprimer une catégorie (si vide)
   - Réorganiser les catégories (drag & drop)
4. Le système valide et applique les changements
5. Le système affiche : "Catégories mises à jour"

### Flux Alternatifs

**7a. Nom d'article déjà utilisé (Création)**
- Le système détecte que le nom existe déjà pour ce restaurant
- Le système affiche : "Un article avec ce nom existe déjà"
- Retour à l'étape 5

**7b. Prix invalide (Création/Modification)**
- Le système détecte un prix ≤ 0 ou format incorrect
- Le système affiche : "Le prix doit être supérieur à 0"
- Retour à l'étape 5 ou 6

**7c. Image trop volumineuse (Création/Modification)**
- Le système détecte une image > 5 Mo
- Le système affiche : "L'image doit faire moins de 5 Mo"
- Le système propose de la compresser automatiquement
- Retour à l'étape 5 ou 6

**6a. Article dans des commandes en cours (Suppression)**
- Le système détecte que l'article est dans des commandes EN_ATTENTE ou EN_PREPARATION
- Le système affiche : "Cet article ne peut pas être supprimé car il est dans X commande(s) en cours"
- Le système propose de le marquer comme indisponible à la place
- Retour à l'étape 3

**4a. Catégorie non vide (Suppression catégorie)**
- Le système détecte que la catégorie contient encore des articles
- Le système affiche : "Impossible de supprimer une catégorie contenant des articles"
- Le système propose de déplacer les articles vers une autre catégorie
- Retour à l'étape 3

### Règles Métier
- **RG-048** : Le nom d'un article doit être unique par restaurant
- **RG-049** : Le prix doit être > 0 et en format décimal (ex: 12.50)
- **RG-050** : Une catégorie est obligatoire pour chaque article
- **RG-051** : Les articles indisponibles ne peuvent pas être commandés
- **RG-052** : Un article dans une commande en cours ne peut pas être supprimé
- **RG-053** : Les images sont automatiquement compressées et redimensionnées (max 800x800px)
- **RG-054** : Une catégorie ne peut être supprimée que si elle est vide

### Exigences Non Fonctionnelles
- **Performance** :
  - Upload image avec barre de progression
  - Compression image côté serveur
  - Mise à jour disponibilité instantanée (< 500ms)
- **UX** :
  - Prévisualisation de l'image avant upload
  - Validation en temps réel des champs
  - Drag & drop pour réorganiser
  - Recherche et filtres dans le menu
- **Sécurité** :
  - Vérification du type de fichier (JPEG, PNG uniquement)
  - Scan antivirus des images uploadées

---

## UC-105 : Modifier le statut du restaurant

### Informations Générales

| Propriété | Valeur |
|-----------|--------|
| **ID** | UC-105 |
| **Acteur principal** | Restaurateur (authentifié) |
| **Type** | Primaire |
| **Priorité** | Haute |
| **Complexité** | Faible |

### Description
Le restaurateur ouvre ou ferme son restaurant manuellement pour arrêter temporairement de recevoir des commandes.

### Préconditions
- Le restaurateur est connecté
- Le restaurant est actif (isActive = true)

### Postconditions (succès)
- Le statut du restaurant est mis à jour (isOpen)
- Les clients voient le changement immédiatement
- Si fermé, les nouvelles commandes sont impossibles

### Flux Principal : Fermer le restaurant

1. Le restaurateur accède au dashboard
2. Le système affiche le statut actuel : "Ouvert" (toggle vert)
3. Le restaurateur clique sur le toggle "Ouvert/Fermé"
4. Le système affiche une confirmation :
   - "Voulez-vous fermer le restaurant ?"
   - "Les clients ne pourront plus passer de commandes"
   - "Les commandes en cours restent actives"
   - Boutons : "Oui, fermer" / "Annuler"
5. Le restaurateur confirme
6. Le système passe isOpen à false
7. Le système affiche : "Restaurant fermé"
8. Le toggle passe au rouge avec mention "Fermé"
9. Les clients voient "Fermé actuellement" sur la fiche du restaurant
10. Les nouvelles commandes sont bloquées

### Flux Principal : Ouvrir le restaurant

1. Le restaurateur accède au dashboard
2. Le système affiche le statut actuel : "Fermé" (toggle rouge)
3. Le restaurateur clique sur le toggle "Ouvert/Fermé"
4. Le système affiche une confirmation :
   - "Voulez-vous ouvrir le restaurant ?"
   - "Les clients pourront à nouveau commander"
   - Boutons : "Oui, ouvrir" / "Annuler"
5. Le restaurateur confirme
6. Le système passe isOpen à true
7. Le système affiche : "Restaurant ouvert"
8. Le toggle passe au vert avec mention "Ouvert"
9. Les clients peuvent à nouveau passer des commandes

### Flux Alternatifs

**6a. Commandes en attente lors de la fermeture**
- Le système détecte des commandes EN_ATTENTE
- Le système affiche : "Vous avez X commande(s) en attente. Que souhaitez-vous faire ?"
- Options :
  - "Les traiter puis fermer" (annule la fermeture, retour au dashboard)
  - "Les refuser et fermer" (refus automatique avec motif)
  - "Annuler"
- Le restaurateur choisit
- Si refus : toutes les commandes EN_ATTENTE passent à ANNULEE
- Suite à l'étape 6

**6b. Erreur de mise à jour**
- Le système ne peut pas changer le statut
- Le système affiche : "Une erreur est survenue. Veuillez réessayer."
- Retour à l'étape 3

**Flux alternatif : Fermeture automatique selon horaires**
- Le système détecte qu'il est 22h00 (heure de fermeture programmée)
- Le système ferme automatiquement le restaurant
- Le système envoie une notification au restaurateur :
  - "Votre restaurant a été fermé automatiquement selon vos horaires"
- Le restaurateur peut réouvrir manuellement si besoin

### Règles Métier
- **RG-055** : Seuls les restaurants actifs (isActive = true) peuvent changer leur statut d'ouverture
- **RG-056** : Un restaurant fermé n'apparaît pas dans les recherches par défaut (filtre "Ouvert maintenant")
- **RG-057** : Les commandes en cours ne sont pas affectées par la fermeture
- **RG-058** : Le changement de statut est immédiat et visible par tous les clients
- **RG-059** : La fermeture automatique selon horaires est configurable

### Exigences Non Fonctionnelles
- **Performance** : Changement de statut instantané (< 500ms)
- **UX** :
  - Toggle très visible sur le dashboard
  - Indication claire du statut actuel
  - Confirmation pour éviter les erreurs
- **Analytics** : Heures d'ouverture/fermeture enregistrées pour statistiques

---

## UC-106 : Consulter les statistiques du restaurant

### Informations Générales

| Propriété | Valeur |
|-----------|--------|
| **ID** | UC-106 |
| **Acteur principal** | Restaurateur (authentifié) |
| **Type** | Secondaire |
| **Priorité** | Moyenne |
| **Complexité** | Moyenne |

### Description
Le restaurateur consulte les statistiques et performances de son restaurant.

### Préconditions
- Le restaurateur est connecté
- Le restaurant a au moins quelques commandes dans l'historique

### Postconditions (succès)
- Le restaurateur visualise les métriques clés
- Le restaurateur peut exporter les données
- Le restaurateur prend des décisions éclairées

### Flux Principal

1. Le restaurateur accède à la page "Statistiques"
2. Le système affiche les filtres :
   - Période : Aujourd'hui / Semaine / Mois / Personnalisée
   - Type de commande : Toutes / Emporter / Sur place
3. Le restaurateur sélectionne une période (par défaut : Aujourd'hui)
4. Le système affiche les **métriques principales** :
   - 📊 **Nombre de commandes** (total, terminées, annulées)
   - 💰 **Chiffre d'affaires** (total TTC)
   - 💵 **Panier moyen** (CA total / nombre de commandes)
   - ✅ **Taux d'acceptation** (acceptées / total × 100)
   - ⏱️ **Temps moyen de préparation**
   - 📦 **Articles les plus vendus** (top 5)
5. Le système affiche les **graphiques** :
   - Évolution du CA sur la période (courbe)
   - Répartition des commandes par statut (diagramme circulaire)
   - Commandes par heure de la journée (histogramme)
   - Commandes par jour de la semaine (histogramme)
   - Mode de récupération (Emporter vs Sur place)
6. Le système affiche les **détails** :
   - Liste des commandes de la période (tableau)
   - Performance par catégorie de menu
   - Heures de pointe
   - Taux d'annulation avec raisons principales
7. Le restaurateur peut exporter les données :
   - Format CSV (tableau Excel)
   - Format PDF (rapport visuel)
8. Le système génère le fichier
9. Le système télécharge le fichier

### Flux Alternatifs

**3a. Aucune commande sur la période**
- Le système détecte qu'aucune commande n'existe pour la période sélectionnée
- Le système affiche : "Aucune donnée disponible pour cette période"
- Le système suggère d'élargir la période
- Retour à l'étape 3

**3b. Période personnalisée**
- Le restaurateur sélectionne "Personnalisée"
- Le système affiche un sélecteur de dates (début - fin)
- Le restaurateur choisit les dates
- Le système valide (max 1 an d'écart)
- Suite à l'étape 4

**8a. Erreur de génération du fichier**
- Le système ne peut pas générer le fichier
- Le système affiche : "Erreur lors de l'export. Veuillez réessayer."
- Retour à l'étape 7

### Règles Métier
- **RG-060** : Le restaurateur ne voit que les statistiques de son propre restaurant
- **RG-061** : Le CA affiché est celui effectivement encaissé (commandes RECUPEREE uniquement)
- **RG-062** : Le taux d'acceptation = (commandes acceptées / commandes reçues) × 100
- **RG-063** : Les commandes ANNULEE ne comptent pas dans le CA mais dans les statistiques d'annulation
- **RG-064** : L'export est limité à 1 an de données maximum

### Exigences Non Fonctionnelles
- **Performance** :
  - Chargement des stats < 3 secondes
  - Génération export < 5 secondes
- **UX** :
  - Graphiques interactifs (hover pour détails)
  - Design responsive (tablette compatible)
  - Couleurs cohérentes avec le dashboard
- **Analytics** : Toutes les données sont calculées en temps réel (pas de cache)

---

# 🛡️ Dashboard Administrateur

---

## UC-201 : Valider un nouveau restaurant

### Informations Générales

| Propriété | Valeur |
|-----------|--------|
| **ID** | UC-201 |
| **Acteur principal** | Administrateur (authentifié) |
| **Type** | Primaire |
| **Priorité** | Haute |
| **Complexité** | Moyenne |

### Description
L'administrateur examine et valide (ou rejette) les demandes d'inscription de nouveaux restaurants.

### Préconditions
- L'administrateur est connecté
- Au moins un restaurant a le statut PENDING (en attente de validation)

### Postconditions (succès)

**Si validé :**
- Le restaurant passe au statut ACTIVE
- Le restaurateur reçoit un email de confirmation
- Le restaurant devient visible pour les clients

**Si rejeté :**
- Le restaurant passe au statut REJECTED
- Le restaurateur reçoit un email avec le motif
- Le restaurant reste invisible pour les clients

### Flux Principal : Valider

1. L'administrateur accède à la page "Restaurants"
2. Le système affiche la liste des restaurants avec filtres :
   - Tous / En attente / Actifs / Bloqués / Rejetés
3. L'administrateur filtre par "En attente"
4. Le système affiche la liste des restaurants PENDING :
   - Nom du restaurant
   - Email du propriétaire
   - Date d'inscription
   - Badge "En attente de validation"
5. L'administrateur clique sur un restaurant
6. Le système affiche le détail complet :
   - **Informations générales** :
     - Nom du restaurant
     - Description
     - Catégorie (Fast-food, Restaurant, Café, etc.)
     - Logo/Image
   - **Coordonnées** :
     - Adresse complète
     - Téléphone
     - Email de contact
   - **Horaires** :
     - Horaires d'ouverture par jour
   - **Propriétaire** :
     - Nom
     - Email
     - Date d'inscription
   - **Statut** : PENDING
7. L'administrateur examine les informations
8. L'administrateur clique sur "Valider le restaurant"
9. Le système affiche une confirmation :
   - "Valider ce restaurant ?"
   - "Le restaurant sera immédiatement actif et visible par les clients"
   - Bouton "Confirmer la validation"
10. L'administrateur confirme
11. Le système passe le restaurant à ACTIVE (isActive = true)
12. Le système active par défaut le restaurant (isOpen = true)
13. Le système envoie un email au restaurateur :
    - "Félicitations ! Votre restaurant a été validé"
    - Lien vers le dashboard restaurateur
    - Guide de démarrage rapide
14. Le système affiche : "Restaurant validé avec succès"
15. Le restaurant disparaît de la liste "En attente"

### Flux Principal : Rejeter

1. L'administrateur examine le restaurant (étapes 1-7)
2. L'administrateur détecte un problème :
   - Informations incomplètes ou invalides
   - Doublons
   - Non-conformité aux CGU
   - Suspicion de fraude
3. L'administrateur clique sur "Rejeter le restaurant"
4. Le système affiche une modale :
   - "Raison du rejet ?" (champ texte obligatoire)
   - "Cette raison sera envoyée au restaurateur"
   - Bouton "Confirmer le rejet"
5. L'administrateur saisit la raison
6. L'administrateur confirme
7. Le système passe le restaurant à REJECTED
8. Le système envoie un email au restaurateur :
   - "Votre demande d'inscription a été refusée"
   - "Raison : [raison saisie]"
   - "Vous pouvez corriger et soumettre une nouvelle demande"
9. Le système affiche : "Restaurant rejeté"
10. Le restaurant passe dans la liste "Rejetés"

### Flux Alternatifs

**7a. Informations manquantes**
- L'administrateur détecte des informations manquantes
- L'administrateur clique sur "Demander des compléments"
- Le système envoie un email au restaurateur listant les informations à compléter
- Le statut reste PENDING
- Le restaurant reste dans la liste "En attente"
- Fin du cas d'usage

**11a. Erreur de validation**
- Le système ne peut pas valider le restaurant
- Le système affiche : "Une erreur est survenue. Veuillez réessayer."
- Retour à l'étape 10

**5a. Raison de rejet non saisie**
- L'administrateur n'a pas saisi de raison
- Le système affiche : "Veuillez indiquer une raison de rejet"
- Retour à l'étape 5

### Règles Métier
- **RG-065** : Seuls les restaurants PENDING peuvent être validés ou rejetés
- **RG-066** : Un restaurant validé (ACTIVE) est immédiatement visible par les clients
- **RG-067** : Un restaurant rejeté (REJECTED) peut soumettre une nouvelle demande
- **RG-068** : La raison de rejet est obligatoire et envoyée au restaurateur
- **RG-069** : La validation ouvre automatiquement le restaurant (isOpen = true)

### Exigences Non Fonctionnelles
- **Performance** : Validation/rejet < 2 secondes
- **UX** :
  - Affichage clair de toutes les informations
  - Possibilité de visualiser le logo/images en grand
  - Badge visuel pour statut PENDING
- **Email** : Templates professionnels et personnalisés

---

## UC-202 : Gérer les restaurants (bloquer/activer)

### Informations Générales

| Propriété | Valeur |
|-----------|--------|
| **ID** | UC-202 |
| **Acteur principal** | Administrateur (authentifié) |
| **Type** | Primaire |
| **Priorité** | Haute |
| **Complexité** | Moyenne |

### Description
L'administrateur peut bloquer ou réactiver un restaurant déjà validé en cas de problème ou résolution.

### Préconditions
- L'administrateur est connecté
- Le restaurant existe avec un statut ACTIVE ou BLOCKED

### Postconditions (succès)

**Si bloqué :**
- Le restaurant passe au statut BLOCKED (isActive = false)
- Le restaurant devient invisible pour les clients
- Le restaurateur ne peut plus recevoir de commandes
- Le restaurateur reçoit une notification

**Si réactivé :**
- Le restaurant passe au statut ACTIVE (isActive = true)
- Le restaurant redevient visible (si ouvert)
- Le restaurateur peut à nouveau recevoir des commandes
- Le restaurateur reçoit une notification

### Flux Principal : Bloquer un restaurant

1. L'administrateur accède à la liste des restaurants
2. L'administrateur filtre par "Actifs"
3. L'administrateur identifie un restaurant à bloquer (raisons possibles) :
   - Non-respect des CGU
   - Plaintes clients répétées
   - Qualité insuffisante
   - Fraude détectée
   - Fermeture définitive
4. L'administrateur clique sur le restaurant
5. L'administrateur clique sur "Bloquer le restaurant"
6. Le système affiche une modale :
   - "Bloquer ce restaurant ?"
   - "Le restaurant ne sera plus visible par les clients"
   - "Les commandes en cours seront annulées"
   - "Raison du blocage ?" (champ texte obligatoire)
   - Boutons : "Confirmer le blocage" / "Annuler"
7. L'administrateur saisit la raison
8. L'administrateur confirme
9. Le système vérifie s'il y a des commandes en cours (EN_ATTENTE, EN_PREPARATION, PRETE)
10. Si commandes en cours :
    - Le système affiche la liste
    - Le système propose de les annuler automatiquement
    - L'administrateur confirme
    - Le système annule toutes les commandes en cours
11. Le système passe le restaurant à BLOCKED (isActive = false)
12. Le système ferme le restaurant (isOpen = false)
13. Le système envoie un email au restaurateur :
    - "Votre restaurant a été bloqué"
    - "Raison : [raison]"
    - "Pour plus d'informations, contactez le support"
14. Le système affiche : "Restaurant bloqué"
15. Le restaurant passe dans la liste "Bloqués"

### Flux Principal : Réactiver un restaurant

1. L'administrateur accède à la liste des restaurants
2. L'administrateur filtre par "Bloqués"
3. L'administrateur clique sur un restaurant bloqué
4. L'administrateur vérifie que les problèmes ont été résolus
5. L'administrateur clique sur "Réactiver le restaurant"
6. Le système affiche une confirmation :
   - "Réactiver ce restaurant ?"
   - "Le restaurant redeviendra visible par les clients"
   - "Message au restaurateur ?" (champ texte optionnel)
   - Boutons : "Confirmer" / "Annuler"
7. L'administrateur peut ajouter un message (optionnel)
8. L'administrateur confirme
9. Le système passe le restaurant à ACTIVE (isActive = true)
10. Le système laisse isOpen à false (le restaurateur devra ouvrir manuellement)
11. Le système envoie un email au restaurateur :
    - "Votre restaurant a été réactivé"
    - Message personnalisé de l'administrateur (si fourni)
    - "Vous pouvez maintenant ouvrir votre restaurant et recevoir des commandes"
12. Le système affiche : "Restaurant réactivé"
13. Le restaurant revient dans la liste "Actifs"

### Flux Alternatifs

**7a. Raison de blocage non saisie**
- L'administrateur n'a pas saisi de raison
- Le système affiche : "Veuillez indiquer une raison de blocage"
- Retour à l'étape 7

**9a. Aucune commande en cours**
- Le système ne détecte aucune commande en cours
- Suite directe à l'étape 11

**10a. L'administrateur refuse d'annuler les commandes**
- L'administrateur annule l'opération
- Le système affiche : "Blocage annulé"
- Retour à l'étape 5

**11a. Erreur de blocage**
- Le système ne peut pas bloquer le restaurant
- Le système affiche : "Une erreur est survenue. Veuillez réessayer."
- Retour à l'étape 8

### Règles Métier
- **RG-070** : Seuls les restaurants ACTIVE peuvent être bloqués
- **RG-071** : Seuls les restaurants BLOCKED peuvent être réactivés
- **RG-072** : Le blocage annule automatiquement toutes les commandes en cours
- **RG-073** : La raison de blocage est obligatoire et enregistrée
- **RG-074** : Un restaurant réactivé est fermé par défaut (isOpen = false)

### Exigences Non Fonctionnelles
- **Performance** : Blocage/réactivation < 2 secondes
- **UX** :
  - Confirmation obligatoire pour éviter erreurs
  - Affichage clair des commandes en cours avant blocage
  - Message personnalisable pour réactivation
- **Audit** : Toutes les actions de blocage/réactivation sont loggées avec horodatage et admin responsable

---

## UC-203 : Gérer les utilisateurs

### Informations Générales

| Propriété | Valeur |
|-----------|--------|
| **ID** | UC-203 |
| **Acteur principal** | Administrateur (authentifié) |
| **Type** | Secondaire |
| **Priorité** | Moyenne |
| **Complexité** | Moyenne |

### Description
L'administrateur consulte, filtre et gère les comptes utilisateurs (clients et restaurateurs).

### Préconditions
- L'administrateur est connecté
- Des utilisateurs existent dans le système

### Postconditions (succès)
- L'administrateur visualise les utilisateurs
- Les utilisateurs problématiques sont gérés (suspension/suppression)
- Les données sont exportables

### Flux Principal : Consulter les utilisateurs

1. L'administrateur accède à la page "Utilisateurs"
2. Le système affiche la liste des utilisateurs avec filtres :
   - Type : Tous / Clients / Restaurateurs / Administrateurs
   - Statut : Tous / Actifs / Inactifs / Suspendus
   - Recherche : Nom ou email
3. Pour chaque utilisateur, le système affiche :
   - Nom complet
   - Email
   - Rôle (CLIENT, RESTAURANT_OWNER, ADMIN)
   - Statut (ACTIVE, INACTIVE, SUSPENDED)
   - Date d'inscription
   - Nombre de commandes (si client)
   - Nombre de restaurants (si restaurateur)
4. L'administrateur peut trier par :
   - Date d'inscription
   - Nom
   - Nombre de commandes
5. L'administrateur clique sur un utilisateur
6. Le système affiche le profil détaillé :
   - **Informations personnelles** :
     - Nom, email, téléphone
     - Date d'inscription
     - Dernière connexion
     - Statut
   - **Activité** :
     - Si client : historique des commandes
     - Si restaurateur : liste des restaurants gérés
   - **Statistiques** :
     - Nombre de commandes passées/reçues
     - Montant total dépensé/encaissé
   - **Actions** :
     - Suspendre/Réactiver
     - Supprimer le compte
     - Envoyer un message

### Flux Principal : Suspendre un utilisateur

1. L'administrateur consulte le profil d'un utilisateur (étapes 1-6)
2. L'administrateur identifie un comportement problématique :
   - Abus (commandes fantômes répétées)
   - Plaintes de restaurants
   - Suspicion de fraude
   - Violation des CGU
3. L'administrateur clique sur "Suspendre l'utilisateur"
4. Le système affiche une modale :
   - "Suspendre cet utilisateur ?"
   - "L'utilisateur ne pourra plus se connecter"
   - "Durée de la suspension ?" (1 jour / 7 jours / 30 jours / Indéfinie)
   - "Raison de la suspension ?" (champ texte obligatoire)
   - Boutons : "Confirmer" / "Annuler"
5. L'administrateur sélectionne la durée et saisit la raison
6. L'administrateur confirme
7. Le système passe l'utilisateur à SUSPENDED
8. Le système enregistre la date de fin de suspension (si applicable)
9. Le système annule toutes les commandes EN_ATTENTE de l'utilisateur
10. Le système envoie un email à l'utilisateur :
    - "Votre compte a été suspendu"
    - "Raison : [raison]"
    - "Durée : [durée]"
    - "Pour contester, contactez le support"
11. Le système affiche : "Utilisateur suspendu"
12. Le système déconnecte l'utilisateur (invalide son token JWT)

### Flux Principal : Réactiver un utilisateur suspendu

1. L'administrateur filtre par "Suspendus"
2. L'administrateur clique sur un utilisateur suspendu
3. L'administrateur vérifie que les problèmes sont résolus
4. L'administrateur clique sur "Réactiver l'utilisateur"
5. Le système affiche une confirmation
6. L'administrateur confirme
7. Le système passe l'utilisateur à ACTIVE
8. Le système envoie un email à l'utilisateur :
   - "Votre compte a été réactivé"
   - "Vous pouvez à nouveau vous connecter"
9. Le système affiche : "Utilisateur réactivé"

### Flux Principal : Supprimer un utilisateur

1. L'administrateur consulte le profil d'un utilisateur
2. L'administrateur clique sur "Supprimer le compte"
3. Le système affiche un avertissement :
   - "Supprimer cet utilisateur ?"
   - "Cette action est irréversible"
   - "Toutes ses données seront supprimées (RGPD)"
   - "Les commandes en cours seront annulées"
   - Boutons : "Confirmer la suppression" / "Annuler"
4. L'administrateur confirme en saisissant "SUPPRIMER"
5. Le système annule toutes les commandes en cours
6. Le système supprime toutes les données personnelles (RGPD)
7. Le système conserve les données anonymisées pour statistiques
8. Le système affiche : "Utilisateur supprimé"

### Flux Principal : Exporter les données

1. L'administrateur applique des filtres
2. L'administrateur clique sur "Exporter"
3. Le système affiche les options :
   - Format : CSV / Excel / PDF
   - Données : Liste simple / Profils détaillés
4. L'administrateur sélectionne
5. Le système génère le fichier
6. Le système télécharge le fichier

### Flux Alternatifs

**5a. Raison de suspension non saisie**
- Le système affiche : "Veuillez indiquer une raison de suspension"
- Retour à l'étape 5

**9a. Commandes en cours lors de la suspension (client)**
- Le système annule automatiquement les commandes EN_ATTENTE
- Le système envoie des notifications aux restaurants concernés
- Suite à l'étape 10

**4a. Confirmation de suppression incorrecte**
- L'administrateur n'a pas saisi exactement "SUPPRIMER"
- Le système affiche : "Veuillez saisir SUPPRIMER pour confirmer"
- Retour à l'étape 4

### Règles Métier
- **RG-075** : Seuls les utilisateurs ACTIVE peuvent être suspendus
- **RG-076** : La raison de suspension est obligatoire et enregistrée
- **RG-077** : La suspension annule automatiquement les commandes EN_ATTENTE
- **RG-078** : La suppression respecte le RGPD (droit à l'effacement)
- **RG-079** : Les données anonymisées sont conservées pour statistiques
- **RG-080** : Les suspensions temporaires se lèvent automatiquement

### Exigences Non Fonctionnelles
- **Performance** : Export < 10 secondes pour 1000 utilisateurs
- **Sécurité** :
  - Confirmation obligatoire pour suppression
  - Audit trail de toutes les actions admin
  - Respect RGPD strict
- **UX** : Recherche et filtres performants

---

## UC-204 : Consulter le tableau de bord global

### Informations Générales

| Propriété | Valeur |
|-----------|--------|
| **ID** | UC-204 |
| **Acteur principal** | Administrateur (authentifié) |
| **Type** | Primaire |
| **Priorité** | Haute |
| **Complexité** | Haute |

### Description
L'administrateur consulte une vue d'ensemble des activités de la plateforme avec métriques clés et alertes.

### Préconditions
- L'administrateur est connecté
- La plateforme a des données d'activité

### Postconditions (succès)
- L'administrateur a une vision claire de la santé de la plateforme
- L'administrateur identifie les points nécessitant attention
- L'administrateur peut prendre des décisions stratégiques

### Flux Principal

1. L'administrateur se connecte
2. Le système affiche automatiquement le dashboard global
3. Le système affiche les **cartes métriques principales** (période : aujourd'hui) :
   - 📦 **Commandes du jour** (total, en cours, terminées, annulées)
   - 💰 **Chiffre d'affaires du jour** (TTC)
   - 🏪 **Restaurants actifs** (ouverts / total actifs)
   - 👥 **Utilisateurs actifs** (connectés dans les 24h)
   - 📊 **Taux de conversion** (commandes / visites)
   - ⚠️ **Alertes** (nombre de problèmes nécessitant attention)
4. Le système affiche les **graphiques** :
   - **Évolution des commandes** (7 derniers jours) - Courbe
   - **CA par jour** (7 derniers jours) - Histogramme
   - **Répartition des commandes par statut** - Diagramme circulaire
   - **Restaurants les plus actifs** (top 10) - Histogramme horizontal
5. Le système affiche le **bloc Alertes** :
   - 🔴 **Critiques** :
     - Restaurants en attente de validation (> 3 jours)
     - Taux d'annulation anormal (> 30%)
     - Commandes bloquées en EN_ATTENTE (> 30 min)
   - 🟡 **Importantes** :
     - Restaurants inactifs depuis > 7 jours
     - Utilisateurs suspendus à réactiver
     - Problèmes techniques signalés
6. Le système affiche le **flux d'activité temps réel** :
   - Nouvelles commandes (avec restaurant et montant)
   - Nouveaux restaurants inscrits
   - Nouveaux utilisateurs
   - Commandes terminées
7. L'administrateur peut filtrer par période :
   - Aujourd'hui / Semaine / Mois / Année / Personnalisée
8. Le système recalcule toutes les métriques selon la période
9. L'administrateur peut cliquer sur chaque métrique pour voir le détail

### Flux Alternatifs

**3a. Aucune activité aujourd'hui**
- Le système détecte qu'il n'y a eu aucune commande aujourd'hui
- Le système affiche : "Aucune activité aujourd'hui"
- Le système suggère d'élargir la période
- Retour à l'étape 7

**5a. Aucune alerte**
- Le système ne détecte aucun problème
- Le système affiche : "✅ Aucune alerte. Tout fonctionne bien."
- Suite à l'étape 6

**9a. Clic sur métrique**
- L'administrateur clique sur "Commandes du jour"
- Le système redirige vers la page "Suivi des commandes" avec filtre "Aujourd'hui"
- L'administrateur voit le détail de toutes les commandes

**9b. Clic sur alerte**
- L'administrateur clique sur "Restaurants en attente de validation"
- Le système redirige vers la page "Restaurants" avec filtre "En attente"
- L'administrateur peut traiter les demandes (UC-201)

### Règles Métier
- **RG-081** : Toutes les métriques sont calculées en temps réel
- **RG-082** : Les alertes sont triées par priorité (critiques en premier)
- **RG-083** : Le flux d'activité affiche les 20 dernières actions
- **RG-084** : Le dashboard se rafraîchit automatiquement toutes les 30 secondes
- **RG-085** : Seuls les restaurants ACTIVE comptent dans "Restaurants actifs"

### Exigences Non Fonctionnelles
- **Performance** :
  - Chargement complet < 3 secondes
  - Rafraîchissement < 1 seconde
  - Temps réel via WebSocket ou polling (5s)
- **UX** :
  - Design clair et épuré
  - Cartes cliquables pour navigation rapide
  - Graphiques interactifs (hover pour détails)
  - Indicateurs visuels forts pour alertes
- **Responsive** : Adapté desktop uniquement (≥ 1280px)

---

## UC-205 : Exporter les statistiques

### Informations Générales

| Propriété | Valeur |
|-----------|--------|
| **ID** | UC-205 |
| **Acteur principal** | Administrateur (authentifié) |
| **Type** | Secondaire |
| **Priorité** | Basse |
| **Complexité** | Moyenne |

### Description
L'administrateur exporte les données statistiques de la plateforme pour analyse externe ou reporting.

### Préconditions
- L'administrateur est connecté
- Des données existent dans le système

### Postconditions (succès)
- Un fichier est généré avec les données demandées
- Le fichier est téléchargé sur l'ordinateur de l'administrateur
- Les données exportées sont conformes au format choisi

### Flux Principal

1. L'administrateur accède à la page "Statistiques" ou "Dashboard"
2. L'administrateur clique sur "Exporter les données"
3. Le système affiche une modale de configuration :
   - **Période** :
     - Aujourd'hui / Semaine / Mois / Année
     - Personnalisée (sélecteur de dates)
   - **Type de données** :
     - ☑ Commandes (détails complets)
     - ☑ Restaurants (performances)
     - ☑ Utilisateurs (statistiques anonymisées)
     - ☑ Chiffre d'affaires (agrégé)
   - **Format** :
     - 📄 CSV (Excel compatible)
     - 📊 Excel (.xlsx)
     - 📑 PDF (rapport visuel)
     - 📈 JSON (données brutes)
   - **Niveau de détail** :
     - Résumé (métriques agrégées)
     - Détaillé (toutes les lignes)
4. L'administrateur sélectionne les options
5. L'administrateur clique sur "Générer l'export"
6. Le système valide les paramètres :
   - Période valide (max 1 an)
   - Au moins un type de données sélectionné
7. Le système génère le fichier selon le format :
   - **CSV** : Tableau avec en-têtes
   - **Excel** : Feuilles multiples (une par type de données) + graphiques
   - **PDF** : Rapport formaté avec logo, graphiques et tableaux
   - **JSON** : Structure de données complète
8. Le système affiche une barre de progression
9. Le système télécharge automatiquement le fichier
10. Le système affiche : "Export réussi : [nom_fichier]"
11. Le système enregistre l'action dans les logs (audit trail)

### Flux Alternatifs

**6a. Période trop longue**
- Le système détecte une période > 1 an
- Le système affiche : "La période ne peut pas dépasser 1 an"
- Retour à l'étape 4

**6b. Aucun type de données sélectionné**
- Le système détecte qu'aucune case n'est cochée
- Le système affiche : "Veuillez sélectionner au moins un type de données"
- Retour à l'étape 4

**7a. Aucune donnée pour la période**
- Le système détecte qu'il n'y a aucune donnée
- Le système affiche : "Aucune donnée disponible pour cette période"
- Le système propose de modifier les critères
- Retour à l'étape 4

**8a. Export trop volumineux**
- Le système détecte > 100 000 lignes
- Le système affiche : "L'export est très volumineux (X lignes). Cela peut prendre quelques minutes."
- Le système propose de continuer ou réduire la période
- Si continuation : suite à l'étape 9
- Si annulation : retour à l'étape 4

**9a. Erreur de génération**
- Le système ne peut pas générer le fichier (erreur serveur)
- Le système affiche : "Une erreur est survenue lors de la génération. Veuillez réessayer."
- Retour à l'étape 5

**9b. Export en arrière-plan (gros volumes)**
- Le système détecte que l'export prendra > 30 secondes
- Le système affiche : "L'export est en cours de génération. Vous recevrez un email quand il sera prêt."
- Le système génère le fichier en arrière-plan
- L'administrateur peut continuer à utiliser le dashboard
- Quand prêt : email avec lien de téléchargement (valide 24h)

### Règles Métier
- **RG-086** : L'export est limité à 1 an de données maximum
- **RG-087** : Les données personnelles des utilisateurs sont anonymisées dans les exports (RGPD)
- **RG-088** : Tous les exports sont loggés avec horodatage et admin responsable
- **RG-089** : Les exports > 100 000 lignes sont générés en arrière-plan
- **RG-090** : Les liens de téléchargement expirent après 24 heures

### Exigences Non Fonctionnelles
- **Performance** :
  - Export < 10 000 lignes : < 10 secondes
  - Export > 10 000 lignes : arrière-plan avec email
- **Sécurité** :
  - Anonymisation stricte des données personnelles
  - Fichiers stockés temporairement (24h max)
  - Accès au téléchargement authentifié
- **Format** :
  - CSV : UTF-8, séparateur `;`, décimales avec `,`
  - Excel : Formatage professionnel, colonnes auto-ajustées
  - PDF : Logo plateforme, en-tête, pagination
  - JSON : Structure cohérente et documentée
- **UX** :
  - Barre de progression pour fichiers volumineux
  - Noms de fichiers explicites : `oneeats_export_commandes_2025-01-01_2025-01-31.csv`

---

# 📊 Matrice de Traçabilité

## Use Cases par Priorité

| Priorité | Mobile Client | Dashboard Restaurateur | Dashboard Admin |
|----------|---------------|------------------------|-----------------|
| **Critique** | UC-004 | UC-101, UC-102, UC-103 | - |
| **Haute** | UC-001, UC-002, UC-003, UC-005 | UC-104, UC-105 | UC-201, UC-202, UC-204 |
| **Moyenne** | UC-006, UC-007 | UC-106 | UC-203 |
| **Basse** | UC-008 | - | UC-205 |

## Use Cases par Complexité

| Complexité | Use Cases |
|------------|-----------|
| **Haute** | UC-004, UC-101, UC-104, UC-204 |
| **Moyenne** | UC-001, UC-003, UC-005, UC-006, UC-102, UC-103, UC-105, UC-106, UC-201, UC-202, UC-203, UC-205 |
| **Faible** | UC-002, UC-007, UC-008 |

## Dépendances entre Use Cases

```
UC-001 (Créer compte)
  └─> UC-002 (Se connecter)
       └─> UC-003 (Rechercher restaurant)
            └─> UC-004 (Commander)
                 ├─> UC-005 (Suivre commande)
                 └─> UC-006 (Annuler commande)
       └─> UC-007 (Historique)
       └─> UC-008 (Profil)

UC-101 (Recevoir commandes)
  └─> UC-102 (Accepter/Refuser)
       └─> UC-103 (Gérer cycle de vie)

UC-201 (Valider restaurant)
  └─> UC-202 (Bloquer/Activer)
```

## Couverture des Règles Métier

| Règle Métier | Use Cases Concernés |
|--------------|---------------------|
| RG-001 à RG-005 | UC-001 (Création compte) |
| RG-006 à RG-008 | UC-002 (Connexion) |
| RG-009 à RG-012 | UC-003 (Recherche) |
| RG-013 à RG-019 | UC-004 (Commander) |
| RG-020 à RG-023 | UC-005 (Suivi) |
| RG-024 à RG-026 | UC-006 (Annulation) |
| RG-027 à RG-029 | UC-007 (Historique) |
| RG-030 à RG-033 | UC-008 (Profil) |
| RG-034 à RG-037 | UC-101 (Recevoir commandes) |
| RG-038 à RG-042 | UC-102 (Accepter/Refuser) |
| RG-043 à RG-047 | UC-103 (Cycle de vie) |
| RG-048 à RG-054 | UC-104 (Gérer menu) |
| RG-055 à RG-059 | UC-105 (Statut restaurant) |
| RG-060 à RG-064 | UC-106 (Stats restaurant) |
| RG-065 à RG-069 | UC-201 (Valider restaurant) |
| RG-070 à RG-074 | UC-202 (Bloquer/Activer) |
| RG-075 à RG-080 | UC-203 (Gérer utilisateurs) |
| RG-081 à RG-085 | UC-204 (Dashboard global) |
| RG-086 à RG-090 | UC-205 (Export stats) |

---

# 🎯 Diagrammes de Flux

## Flux Principal Client (Happy Path)

```
[Inscription] → [Connexion] → [Recherche Restaurant]
    → [Sélection Restaurant] → [Ajout au Panier]
    → [Validation Commande] → [Suivi Temps Réel]
    → [Récupération] → [Historique]
```

## Flux Principal Restaurateur (Happy Path)

```
[Connexion] → [Réception Commande] → [Acceptation]
    → [Préparation] → [Prête] → [Récupérée]

[Gestion Menu] → [Ajout/Modification Articles]
    → [Gestion Disponibilité]
```

## Flux Principal Admin (Happy Path)

```
[Connexion] → [Dashboard Global] → [Alertes]
    → [Validation Restaurants] → [Supervision Activité]
    → [Statistiques] → [Export Données]
```

---

# 📝 Notes de Version

**Version 1.0** (2025-12-12)
- Création initiale du document
- 19 use cases détaillés (8 mobile + 6 restaurateur + 5 admin)
- 90 règles métier référencées
- Matrice de traçabilité complète

---

**Fin du document USE_CASES.md**
