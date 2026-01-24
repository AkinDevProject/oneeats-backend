# Guide de Test Utilisateur - Application Mobile OneEats

## Pour qui est ce guide ?

Ce guide est destiné aux **utilisateurs clients** testant l'application mobile OneEats pour commander de la nourriture à emporter.

---

## Avant de commencer

**Ce dont vous avez besoin :**
- Un smartphone (iPhone ou Android) avec l'application installée
- OU un ordinateur avec l'émulateur mobile configuré par l'équipe
- Une connexion internet (Wi-Fi ou données mobiles)

**Identifiants de test :**
- Email : `user@test.com`
- Mot de passe : `password123`

---

## Comment utiliser ce guide

1. Suivez les scénarios dans l'ordre
2. Pour chaque test, cochez les cases au fur et à mesure
3. Notez tout comportement inattendu dans la section "Observations"
4. Prenez des captures d'écran si vous rencontrez un problème

---

# Scénarios de Test

---

## Scénario 1 : Lancement de l'application

**Objectif :** Vérifier que l'application démarre correctement

### Étapes à suivre :
1. Appuyez sur l'icône de l'application OneEats
2. Attendez le chargement de l'écran d'accueil
3. Observez les 3 onglets en bas de l'écran

### Résultat attendu :
- [ ] L'application s'ouvre sans erreur
- [ ] L'écran d'accueil s'affiche rapidement (moins de 3 secondes)
- [ ] 3 onglets sont visibles en bas : Restaurants, Mes Commandes, Mon Compte
- [ ] L'interface est claire et lisible

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 2 : Créer un compte (Inscription)

**Objectif :** Vérifier le processus d'inscription d'un nouvel utilisateur

### Étapes à suivre :
1. Sur l'écran de connexion, appuyez sur "Créer un compte" ou "S'inscrire"
2. Remplissez le formulaire :
   - Nom complet : `Test Utilisateur`
   - Email : `nouveau@test.com`
   - Mot de passe : `Password123`
   - Confirmation : `Password123`
3. Acceptez les Conditions Générales d'Utilisation (CGU)
4. Appuyez sur "S'inscrire" ou "Créer mon compte"

### Résultat attendu :
- [ ] Le formulaire d'inscription est accessible et clair
- [ ] Validation en temps réel des champs (email format, mot de passe 8 caractères min)
- [ ] La case CGU est obligatoire pour valider
- [ ] Message de confirmation affiché après inscription
- [ ] Redirection automatique vers la page d'accueil

### Tests d'erreur à vérifier :
- [ ] Email invalide → message "Format d'email invalide"
- [ ] Mot de passe trop court → message "8 caractères minimum"
- [ ] Mots de passe différents → message "Les mots de passe ne correspondent pas"
- [ ] Email déjà utilisé → message "Cet email est déjà utilisé"

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 3 : Se connecter à l'application

**Objectif :** Vérifier le processus de connexion utilisateur

### Étapes à suivre :
1. Sur l'écran d'accueil, appuyez sur "Se connecter"
2. Saisissez l'email : `user@test.com`
3. Saisissez le mot de passe : `password123`
4. Appuyez sur le bouton "Connexion"

### Résultat attendu :
- [ ] Le formulaire de connexion est clair et accessible
- [ ] La connexion s'effectue en moins de 3 secondes
- [ ] Redirection vers la page d'accueil après connexion
- [ ] Le nom ou email de l'utilisateur est visible dans "Mon Compte"
- [ ] L'application reste connectée après fermeture/réouverture

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 4 : Connexion avec erreur

**Objectif :** Vérifier la gestion des erreurs de connexion

### Étapes à suivre :
1. Sur l'écran de connexion, saisissez un email incorrect
2. Saisissez un mot de passe quelconque
3. Appuyez sur "Connexion"
4. Recommencez avec le bon email mais un mauvais mot de passe

### Résultat attendu :
- [ ] Message d'erreur clair : "Email ou mot de passe incorrect"
- [ ] L'application ne bloque pas après plusieurs tentatives
- [ ] Un lien "Mot de passe oublié ?" est visible
- [ ] Possibilité de réessayer sans relancer l'application

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 5 : Découvrir les restaurants

**Objectif :** Parcourir la liste des restaurants disponibles

### Étapes à suivre :
1. Assurez-vous d'être sur l'onglet "Restaurants"
2. Faites défiler la liste des restaurants
3. Observez les informations affichées pour chaque restaurant
4. Identifiez les restaurants ouverts et fermés

### Résultat attendu :
- [ ] Une liste de restaurants s'affiche
- [ ] Chaque restaurant montre : image, nom, type de cuisine
- [ ] Les restaurants ouverts sont distingués des fermés (badge, couleur, icône)
- [ ] Le défilement est fluide et sans saccade

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 6 : Rechercher un restaurant

**Objectif :** Trouver un restaurant spécifique

### Étapes à suivre :
1. Trouvez la barre de recherche en haut de l'écran
2. Tapez "Pizza" dans la recherche
3. Observez les résultats qui s'affichent
4. Effacez la recherche pour revenir à la liste complète

### Résultat attendu :
- [ ] La barre de recherche est facile à trouver
- [ ] Les résultats s'affichent pendant la saisie
- [ ] Seuls les restaurants correspondants apparaissent
- [ ] On peut facilement effacer la recherche

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 7 : Consulter un restaurant ouvert

**Objectif :** Voir les détails d'un restaurant

### Étapes à suivre :
1. Appuyez sur un restaurant OUVERT (ex: Pizza Palace)
2. Consultez les informations affichées
3. Trouvez les horaires d'ouverture
4. Cherchez le bouton pour voir le menu

### Résultat attendu :
- [ ] La page du restaurant s'ouvre
- [ ] Le nom, la description et l'adresse sont visibles
- [ ] Les horaires d'ouverture sont affichés
- [ ] Un bouton "Voir le menu" ou accès direct au menu est disponible
- [ ] Possibilité d'ajouter aux favoris (icône cœur)

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 8 : Tenter de commander sur un restaurant fermé

**Objectif :** Vérifier le comportement quand un restaurant est fermé

### Étapes à suivre :
1. Identifiez un restaurant marqué "Fermé" dans la liste
2. Appuyez sur ce restaurant pour voir sa fiche
3. Essayez d'accéder au menu
4. Essayez d'ajouter un article au panier (si possible)

### Résultat attendu :
- [ ] Le restaurant fermé est clairement identifiable (badge, couleur grisée)
- [ ] La fiche du restaurant affiche les horaires d'ouverture
- [ ] Message explicatif : "Ce restaurant est actuellement fermé"
- [ ] Impossible d'ajouter des articles au panier OU message d'avertissement
- [ ] Suggestion des horaires de réouverture

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 9 : Consulter le menu

**Objectif :** Parcourir les plats disponibles

### Étapes à suivre :
1. Depuis un restaurant ouvert, accédez au menu
2. Parcourez les différentes catégories (entrées, plats, desserts)
3. Observez les informations de chaque plat
4. Utilisez les filtres par catégorie si disponibles

### Résultat attendu :
- [ ] Le menu s'affiche correctement
- [ ] Les plats sont organisés par catégorie
- [ ] Chaque plat montre : nom, description, prix, image
- [ ] Les plats indisponibles sont clairement indiqués (grisés, badge "Indisponible")

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 10 : Voir les détails d'un plat

**Objectif :** Consulter les informations complètes d'un plat

### Étapes à suivre :
1. Appuyez sur un plat disponible (ex: Pizza Margherita)
2. Consultez la description complète
3. Vérifiez le prix
4. Observez les informations diététiques (végétarien, sans gluten, etc.)

### Résultat attendu :
- [ ] Une fenêtre ou page de détails s'ouvre
- [ ] La description complète est visible
- [ ] Le prix est affiché clairement
- [ ] Les informations diététiques sont présentes si applicables (icônes végétarien, vegan)
- [ ] Les allergènes sont listés si présents

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 11 : Gérer ses favoris

**Objectif :** Ajouter et retirer des restaurants de ses favoris

### Étapes à suivre :
1. Depuis la fiche d'un restaurant, trouvez l'icône "cœur" (favoris)
2. Appuyez sur l'icône pour ajouter aux favoris
3. Allez dans "Mon Compte" > "Mes Favoris" ou section équivalente
4. Vérifiez que le restaurant apparaît dans la liste
5. Retirez le restaurant des favoris

### Résultat attendu :
- [ ] L'icône cœur est visible sur la fiche restaurant
- [ ] L'icône change d'état au clic (vide → plein ou changement de couleur)
- [ ] Une confirmation visuelle s'affiche ("Ajouté aux favoris")
- [ ] Le restaurant apparaît dans la liste des favoris
- [ ] Le retrait des favoris fonctionne correctement

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 12 : Ajouter des articles au panier

**Objectif :** Construire une commande

### Étapes à suivre :
1. Depuis un plat disponible, appuyez sur "Ajouter au panier"
2. Ajoutez un deuxième plat différent
3. Essayez d'ajouter le même plat une deuxième fois
4. Vérifiez le badge sur l'onglet panier ou "Mes Commandes"

### Résultat attendu :
- [ ] Le plat s'ajoute au panier avec une confirmation visuelle
- [ ] Plusieurs plats peuvent être ajoutés
- [ ] La quantité augmente si on ajoute le même plat
- [ ] Un badge avec le nombre d'articles apparaît sur l'onglet

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 13 : Tenter d'ajouter un article indisponible

**Objectif :** Vérifier qu'on ne peut pas commander un article indisponible

### Étapes à suivre :
1. Dans le menu d'un restaurant, identifiez un article marqué "Indisponible"
2. Appuyez sur cet article
3. Essayez de l'ajouter au panier

### Résultat attendu :
- [ ] L'article indisponible est visuellement distinct (grisé, barré, badge)
- [ ] Le bouton "Ajouter au panier" est désactivé OU
- [ ] Un message explique que l'article n'est pas disponible
- [ ] Impossible d'ajouter l'article au panier

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 14 : Consulter et modifier le panier

**Objectif :** Gérer le contenu de sa commande

### Étapes à suivre :
1. Allez sur l'onglet panier ou "Mes Commandes"
2. Consultez la liste des articles dans le panier
3. Modifiez la quantité d'un article (+ ou -)
4. Supprimez un article du panier
5. Vérifiez le total qui se met à jour

### Résultat attendu :
- [ ] Le panier affiche tous les articles ajoutés
- [ ] Chaque article montre : nom, quantité, prix
- [ ] Les boutons + et - modifient la quantité
- [ ] On peut supprimer un article
- [ ] Le total se recalcule automatiquement

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 15 : Passer une commande

**Objectif :** Finaliser et envoyer une commande

### Étapes à suivre :
1. Avec un panier rempli, appuyez sur "Commander"
2. Ajoutez des instructions spéciales si souhaité (ex: "Sans oignons")
3. Vérifiez le récapitulatif de la commande
4. Confirmez la commande

### Résultat attendu :
- [ ] Un écran de confirmation/récapitulatif s'affiche
- [ ] Vous pouvez ajouter des instructions spéciales
- [ ] Le récapitulatif montre tous les articles et le total
- [ ] Un message de confirmation apparaît après validation
- [ ] Un numéro de commande est attribué

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 16 : Suivre une commande

**Objectif :** Voir l'évolution du statut de sa commande

### Étapes à suivre :
1. Après avoir passé une commande, observez l'écran de suivi
2. Identifiez le statut actuel (En attente, En préparation, Prête)
3. Consultez les détails de la commande
4. Vérifiez le temps estimé si affiché

### Résultat attendu :
- [ ] Le statut de la commande est clairement affiché
- [ ] Une progression visuelle montre les étapes (timeline, badges)
- [ ] Les détails de la commande restent accessibles
- [ ] Le statut se met à jour quand le restaurant change l'état

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 17 : Annuler une commande

**Objectif :** Vérifier qu'on peut annuler une commande en attente

### Étapes à suivre :
1. Allez dans "Mes Commandes" ou l'historique
2. Sélectionnez une commande avec le statut "En attente"
3. Cherchez le bouton "Annuler la commande"
4. Confirmez l'annulation
5. Vérifiez le nouveau statut de la commande

### Résultat attendu :
- [ ] Le bouton "Annuler" est visible pour les commandes "En attente"
- [ ] Le bouton "Annuler" est ABSENT ou désactivé pour les commandes "En préparation" ou après
- [ ] Une confirmation est demandée avant l'annulation
- [ ] Le statut passe à "Annulée" après confirmation
- [ ] Un message de confirmation s'affiche

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 18 : Consulter l'historique des commandes

**Objectif :** Voir ses commandes passées

### Étapes à suivre :
1. Allez dans "Mes Commandes"
2. Trouvez la section historique ou commandes passées
3. Consultez les détails d'une ancienne commande
4. Vérifiez les informations affichées

### Résultat attendu :
- [ ] L'historique des commandes est accessible
- [ ] Chaque commande passée montre : date, restaurant, montant, statut
- [ ] On peut consulter les détails d'une ancienne commande
- [ ] Les commandes sont triées par date (plus récente en premier)

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 19 : Gérer son compte

**Objectif :** Accéder aux paramètres de son profil

### Étapes à suivre :
1. Allez sur l'onglet "Mon Compte"
2. Si non connecté, connectez-vous avec les identifiants de test
3. Consultez vos informations de profil
4. Accédez aux paramètres

### Résultat attendu :
- [ ] La page "Mon Compte" affiche votre profil
- [ ] Si non connecté, un bouton de connexion est visible
- [ ] Après connexion, vos informations sont affichées (nom, email)
- [ ] Un accès aux paramètres est disponible
- [ ] Accès à vos favoris disponible

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 20 : Modifier les paramètres

**Objectif :** Personnaliser l'application

### Étapes à suivre :
1. Depuis "Mon Compte", accédez aux paramètres
2. Changez le thème (clair/sombre) si disponible
3. Modifiez les préférences de notifications
4. Explorez les préférences alimentaires

### Résultat attendu :
- [ ] La page des paramètres est accessible
- [ ] Le changement de thème fonctionne (l'interface change)
- [ ] On peut activer/désactiver les notifications
- [ ] Les préférences alimentaires peuvent être configurées

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 21 : Test du thème sombre

**Objectif :** Vérifier le mode sombre de l'application

### Étapes à suivre :
1. Dans les paramètres, activez le thème sombre
2. Naviguez dans les différentes sections de l'app
3. Vérifiez la lisibilité du texte
4. Revenez au thème clair

### Résultat attendu :
- [ ] Le thème sombre s'applique à toute l'application
- [ ] Le texte reste lisible sur fond sombre
- [ ] Les images et icônes sont toujours visibles
- [ ] Le retour au thème clair fonctionne

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 22 : Tester les notifications (si disponible)

**Objectif :** Vérifier le système de notifications

### Étapes à suivre :
1. Assurez-vous que les notifications sont activées
2. Passez une commande
3. Attendez une notification de changement de statut
4. Appuyez sur la notification pour ouvrir l'app

### Résultat attendu :
- [ ] L'application demande la permission pour les notifications
- [ ] Des notifications arrivent lors des changements de statut
- [ ] Le contenu de la notification est clair et informatif
- [ ] Appuyer sur la notification ouvre les détails de la commande

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 23 : Test hors connexion

**Objectif :** Vérifier le comportement sans internet

### Étapes à suivre :
1. Désactivez le Wi-Fi et les données mobiles
2. Essayez de naviguer dans l'application
3. Essayez de passer une commande
4. Réactivez la connexion et observez

### Résultat attendu :
- [ ] Un message indique l'absence de connexion
- [ ] Le panier reste accessible avec les articles précédents
- [ ] Impossible de passer commande sans connexion
- [ ] L'app se reconnecte automatiquement quand internet revient

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 24 : Déconnexion

**Objectif :** Se déconnecter de l'application

### Étapes à suivre :
1. Allez dans "Mon Compte"
2. Trouvez le bouton "Déconnexion"
3. Confirmez la déconnexion
4. Vérifiez que vous êtes bien déconnecté

### Résultat attendu :
- [ ] Le bouton de déconnexion est facile à trouver
- [ ] Une confirmation est demandée
- [ ] Après déconnexion, le profil n'est plus affiché
- [ ] Le panier est conservé même après déconnexion (ou vidé, selon le choix)

### Observations :
```
(Notez ici tout problème rencontré)


```

---

# Résumé des Tests

## Récapitulatif

| # | Scénario | Réussi | Échec | Non testé |
|---|----------|--------|-------|-----------|
| 1 | Lancement app | [ ] | [ ] | [ ] |
| 2 | Créer un compte (Inscription) | [ ] | [ ] | [ ] |
| 3 | Se connecter | [ ] | [ ] | [ ] |
| 4 | Connexion avec erreur | [ ] | [ ] | [ ] |
| 5 | Liste restaurants | [ ] | [ ] | [ ] |
| 6 | Recherche restaurant | [ ] | [ ] | [ ] |
| 7 | Consulter restaurant ouvert | [ ] | [ ] | [ ] |
| 8 | Restaurant fermé | [ ] | [ ] | [ ] |
| 9 | Consultation menu | [ ] | [ ] | [ ] |
| 10 | Détails plat | [ ] | [ ] | [ ] |
| 11 | Gérer ses favoris | [ ] | [ ] | [ ] |
| 12 | Ajout au panier | [ ] | [ ] | [ ] |
| 13 | Article indisponible | [ ] | [ ] | [ ] |
| 14 | Gestion panier | [ ] | [ ] | [ ] |
| 15 | Passer commande | [ ] | [ ] | [ ] |
| 16 | Suivi commande | [ ] | [ ] | [ ] |
| 17 | Annuler commande | [ ] | [ ] | [ ] |
| 18 | Historique commandes | [ ] | [ ] | [ ] |
| 19 | Mon compte | [ ] | [ ] | [ ] |
| 20 | Paramètres | [ ] | [ ] | [ ] |
| 21 | Thème sombre | [ ] | [ ] | [ ] |
| 22 | Notifications | [ ] | [ ] | [ ] |
| 23 | Hors connexion | [ ] | [ ] | [ ] |
| 24 | Déconnexion | [ ] | [ ] | [ ] |

## Impression générale

**L'application était-elle facile à utiliser ?**
- [ ] Très facile
- [ ] Assez facile
- [ ] Difficile
- [ ] Très difficile

**L'application était-elle rapide ?**
- [ ] Très rapide
- [ ] Acceptable
- [ ] Un peu lente
- [ ] Très lente

**Utiliseriez-vous cette application pour commander à manger ?**
- [ ] Oui, définitivement
- [ ] Probablement oui
- [ ] Probablement non
- [ ] Non, pas du tout

**Avez-vous rencontré des problèmes bloquants ?**
- [ ] Non, tout fonctionne
- [ ] Oui, certaines fonctions ne marchent pas

**Qu'avez-vous le plus aimé ?**
```
(Votre réponse)


```

**Qu'est-ce qui pourrait être amélioré ?**
```
(Vos suggestions)


```

**Commentaires généraux :**
```
(Vos remarques ou problèmes rencontrés)




```

---

## Informations du testeur

**Nom :** _______________

**Date du test :** _______________

**Type d'appareil :**
- [ ] iPhone
- [ ] Android
- [ ] Émulateur

**Modèle du téléphone :** _______________

**Version du système :** _______________

---

## Traçabilité Use Cases MVP

Ce guide couvre les 8 Use Cases Client de l'application mobile :

| Use Case | Description | Scénarios UAT |
|----------|-------------|---------------|
| UC-001 | Créer un compte client | ✅ Scénario 2 |
| UC-002 | Se connecter à l'application | ✅ Scénarios 3, 4 |
| UC-003 | Rechercher un restaurant | ✅ Scénarios 5, 6 |
| UC-004 | Commander un repas | ✅ Scénarios 7-15 |
| UC-005 | Suivre une commande | ✅ Scénario 16 |
| UC-006 | Annuler une commande | ✅ Scénario 17 |
| UC-007 | Historique des commandes | ✅ Scénario 18 |
| UC-008 | Gérer son profil | ✅ Scénarios 19, 20 |

**Couverture MVP** : 100% des Use Cases Client

**Règles métier testées** :
- ✅ Restaurant fermé → impossible de commander
- ✅ Article indisponible → impossible d'ajouter au panier
- ✅ Annulation → uniquement pour commandes "En attente"
- ✅ Authentification → validation email/mot de passe
- ✅ Favoris → ajout/suppression

---

**Dernière mise à jour** : 2026-01-24
**Version** : 2.0 (24 scénarios)

---

*Merci pour votre participation aux tests !*
*Vos retours sont précieux pour améliorer l'application.*
