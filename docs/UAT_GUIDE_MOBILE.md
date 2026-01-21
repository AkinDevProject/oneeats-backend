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

## Scénario 2 : Découvrir les restaurants

**Objectif :** Parcourir la liste des restaurants disponibles

### Étapes à suivre :
1. Assurez-vous d'être sur l'onglet "Restaurants"
2. Faites défiler la liste des restaurants
3. Observez les informations affichées pour chaque restaurant
4. Identifiez les restaurants ouverts et fermés

### Résultat attendu :
- [ ] Une liste de restaurants s'affiche
- [ ] Chaque restaurant montre : image, nom, type de cuisine
- [ ] Les restaurants ouverts sont distingués des fermés
- [ ] Le défilement est fluide et sans saccade

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 3 : Rechercher un restaurant

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

## Scénario 4 : Consulter un restaurant

**Objectif :** Voir les détails d'un restaurant

### Étapes à suivre :
1. Appuyez sur un restaurant (ex: Pizza Palace)
2. Consultez les informations affichées
3. Trouvez les horaires d'ouverture
4. Cherchez le bouton pour voir le menu

### Résultat attendu :
- [ ] La page du restaurant s'ouvre
- [ ] Le nom, la description et l'adresse sont visibles
- [ ] Les horaires d'ouverture sont affichés
- [ ] Un bouton "Voir le menu" est disponible

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 5 : Consulter le menu

**Objectif :** Parcourir les plats disponibles

### Étapes à suivre :
1. Depuis un restaurant, accédez au menu
2. Parcourez les différentes catégories (entrées, plats, desserts)
3. Observez les informations de chaque plat
4. Utilisez les filtres par catégorie si disponibles

### Résultat attendu :
- [ ] Le menu s'affiche correctement
- [ ] Les plats sont organisés par catégorie
- [ ] Chaque plat montre : nom, description, prix, image
- [ ] Les plats indisponibles sont clairement indiqués

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 6 : Voir les détails d'un plat

**Objectif :** Consulter les informations complètes d'un plat

### Étapes à suivre :
1. Appuyez sur un plat (ex: Pizza Margherita)
2. Consultez la description complète
3. Vérifiez le prix
4. Observez les informations diététiques (végétarien, sans gluten, etc.)

### Résultat attendu :
- [ ] Une fenêtre de détails s'ouvre
- [ ] La description complète est visible
- [ ] Le prix est affiché clairement
- [ ] Les informations diététiques sont présentes si applicables

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 7 : Ajouter des articles au panier

**Objectif :** Construire une commande

### Étapes à suivre :
1. Depuis un plat, appuyez sur "Ajouter au panier"
2. Ajoutez un deuxième plat différent
3. Essayez d'ajouter le même plat une deuxième fois
4. Vérifiez le badge sur l'onglet "Mes Commandes"

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

## Scénario 8 : Consulter et modifier le panier

**Objectif :** Gérer le contenu de sa commande

### Étapes à suivre :
1. Allez sur l'onglet "Mes Commandes"
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

## Scénario 9 : Passer une commande

**Objectif :** Finaliser et envoyer une commande

### Étapes à suivre :
1. Avec un panier rempli, appuyez sur "Commander"
2. Ajoutez des instructions spéciales si souhaité (ex: "Sans oignons")
3. Vérifiez le récapitulatif de la commande
4. Confirmez la commande

### Résultat attendu :
- [ ] Un écran de confirmation s'affiche
- [ ] Vous pouvez ajouter des instructions spéciales
- [ ] Le récapitulatif montre tous les articles et le total
- [ ] Un message de confirmation apparaît après la commande

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 10 : Suivre une commande

**Objectif :** Voir l'évolution du statut de sa commande

### Étapes à suivre :
1. Après avoir passé une commande, observez l'écran de suivi
2. Identifiez le statut actuel (En attente, En préparation, Prête)
3. Consultez les détails de la commande
4. Vérifiez le temps estimé si affiché

### Résultat attendu :
- [ ] Le statut de la commande est clairement affiché
- [ ] Une progression visuelle montre les étapes
- [ ] Les détails de la commande restent accessibles
- [ ] Le statut se met à jour quand le restaurant change l'état

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 11 : Consulter l'historique des commandes

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

## Scénario 12 : Gérer son compte

**Objectif :** Accéder aux paramètres de son profil

### Étapes à suivre :
1. Allez sur l'onglet "Mon Compte"
2. Si non connecté, connectez-vous avec les identifiants de test
3. Consultez vos informations de profil
4. Accédez aux paramètres

### Résultat attendu :
- [ ] La page "Mon Compte" affiche votre profil
- [ ] Si non connecté, un bouton de connexion est visible
- [ ] Après connexion, vos informations sont affichées
- [ ] Un accès aux paramètres est disponible

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 13 : Modifier les paramètres

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

## Scénario 14 : Test du thème sombre

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

## Scénario 15 : Tester les notifications (si disponible)

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

## Scénario 16 : Test hors connexion

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

## Scénario 17 : Déconnexion

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

| Scénario | Réussi | Échec | Non testé |
|----------|--------|-------|-----------|
| 1. Lancement app | [ ] | [ ] | [ ] |
| 2. Liste restaurants | [ ] | [ ] | [ ] |
| 3. Recherche | [ ] | [ ] | [ ] |
| 4. Détails restaurant | [ ] | [ ] | [ ] |
| 5. Consultation menu | [ ] | [ ] | [ ] |
| 6. Détails plat | [ ] | [ ] | [ ] |
| 7. Ajout au panier | [ ] | [ ] | [ ] |
| 8. Gestion panier | [ ] | [ ] | [ ] |
| 9. Passer commande | [ ] | [ ] | [ ] |
| 10. Suivi commande | [ ] | [ ] | [ ] |
| 11. Historique | [ ] | [ ] | [ ] |
| 12. Mon compte | [ ] | [ ] | [ ] |
| 13. Paramètres | [ ] | [ ] | [ ] |
| 14. Thème sombre | [ ] | [ ] | [ ] |
| 15. Notifications | [ ] | [ ] | [ ] |
| 16. Hors connexion | [ ] | [ ] | [ ] |
| 17. Déconnexion | [ ] | [ ] | [ ] |

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

*Merci pour votre participation aux tests !*
*Vos retours sont précieux pour améliorer l'application.*
