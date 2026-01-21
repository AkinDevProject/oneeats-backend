# Guide de Test Utilisateur - Dashboard Restaurant

## Pour qui est ce guide ?

Ce guide est destiné aux **restaurateurs** ou personnes testant le tableau de bord de gestion d'un restaurant sur la plateforme OneEats.

---

## Avant de commencer

**Ce dont vous avez besoin :**
- Un ordinateur avec un navigateur web (Chrome, Firefox, Safari)
- L'application doit vous avoir été installée et lancée par l'équipe technique
- Vos identifiants de connexion (fournis par l'équipe)

**Identifiants de test :**
- Email : `restaurant@pizzapalace.com`
- Mot de passe : `password123`

---

## Comment utiliser ce guide

1. Suivez les scénarios dans l'ordre
2. Pour chaque test, cochez les cases au fur et à mesure
3. Notez tout comportement inattendu dans la section "Observations"
4. Prenez des captures d'écran si vous rencontrez un problème

---

# Scénarios de Test

## Scénario 1 : Connexion au dashboard

**Objectif :** Vérifier que vous pouvez accéder à votre espace restaurant

### Étapes à suivre :
1. Ouvrez votre navigateur web
2. Accédez à l'adresse fournie par l'équipe technique
3. Entrez votre email et mot de passe
4. Cliquez sur "Se connecter"

### Résultat attendu :
- [ ] La page de connexion s'affiche correctement
- [ ] Après connexion, vous voyez le nom de votre restaurant en haut
- [ ] Le menu de navigation est visible à gauche
- [ ] Aucun message d'erreur n'apparaît

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 2 : Consulter les commandes en cours

**Objectif :** Voir et gérer les commandes de vos clients

### Étapes à suivre :
1. Depuis le menu, cliquez sur "Commandes"
2. Observez la liste des commandes affichées
3. Cliquez sur les différents onglets : "En attente", "En cours", "Prêtes"
4. Utilisez la barre de recherche pour trouver une commande

### Résultat attendu :
- [ ] La liste des commandes s'affiche
- [ ] Chaque commande montre : nom du client, articles commandés, heure, statut
- [ ] Les onglets filtrent correctement les commandes
- [ ] La recherche trouve les commandes par nom de client

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 3 : Changer le statut d'une commande

**Objectif :** Faire avancer une commande dans son cycle de vie

### Étapes à suivre :
1. Trouvez une commande "En attente"
2. Cliquez sur "Accepter" pour commencer la préparation
3. Une fois la commande prête, cliquez sur "Marquer prête"
4. Quand le client récupère sa commande, cliquez sur "Marquer récupérée"

### Résultat attendu :
- [ ] Le bouton "Accepter" change le statut vers "En préparation"
- [ ] Le bouton "Marquer prête" change le statut vers "Prête"
- [ ] Le bouton "Marquer récupérée" change le statut vers "Récupérée"
- [ ] La commande se déplace dans l'onglet correspondant

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 4 : Voir les détails d'une commande

**Objectif :** Consulter toutes les informations d'une commande

### Étapes à suivre :
1. Cliquez sur "Voir détails" sur n'importe quelle commande
2. Lisez les informations affichées
3. Fermez la fenêtre de détails

### Résultat attendu :
- [ ] Une fenêtre s'ouvre avec les détails complets
- [ ] Vous voyez : nom du client, liste des articles avec quantités, prix total
- [ ] Les instructions spéciales du client sont visibles (si présentes)
- [ ] Vous pouvez fermer la fenêtre facilement

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 5 : Consulter le menu de votre restaurant

**Objectif :** Voir tous vos plats disponibles

### Étapes à suivre :
1. Depuis le menu, cliquez sur "Menu"
2. Parcourez la liste de vos plats
3. Utilisez les filtres par catégorie (entrées, plats, desserts)
4. Utilisez la recherche pour trouver un plat spécifique

### Résultat attendu :
- [ ] Tous vos plats sont affichés avec leurs images
- [ ] Chaque plat montre : nom, description, prix, disponibilité
- [ ] Les filtres par catégorie fonctionnent
- [ ] La recherche trouve les plats par nom

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 6 : Ajouter un nouveau plat

**Objectif :** Créer un nouveau plat dans votre menu

### Étapes à suivre :
1. Dans la section Menu, cliquez sur "Ajouter un plat"
2. Remplissez le formulaire :
   - Nom : "Nouvelle Pizza Test"
   - Prix : 12.90
   - Catégorie : "plats"
   - Description : "Une délicieuse pizza pour tester"
3. Cochez "Disponible"
4. Cliquez sur "Ajouter"

### Résultat attendu :
- [ ] Le formulaire s'affiche correctement
- [ ] Tous les champs sont faciles à remplir
- [ ] Un message de confirmation apparaît après l'ajout
- [ ] Le nouveau plat apparaît dans la liste du menu

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 7 : Modifier un plat existant

**Objectif :** Changer les informations d'un plat

### Étapes à suivre :
1. Trouvez un plat dans votre menu
2. Cliquez sur "Modifier"
3. Changez le prix ou la description
4. Sauvegardez les modifications

### Résultat attendu :
- [ ] Le formulaire s'ouvre avec les informations actuelles du plat
- [ ] Vous pouvez modifier facilement les champs
- [ ] Un message de confirmation apparaît après la sauvegarde
- [ ] Les modifications sont visibles immédiatement

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 8 : Masquer un plat temporairement

**Objectif :** Rendre un plat indisponible sans le supprimer

### Étapes à suivre :
1. Trouvez un plat disponible dans votre menu
2. Cliquez sur "Masquer" (ou décochez "Disponible")
3. Vérifiez que le plat apparaît comme indisponible
4. Remettez le plat disponible en cliquant sur "Afficher"

### Résultat attendu :
- [ ] Le plat masqué apparaît grisé ou avec un badge "Indisponible"
- [ ] Le plat masqué n'est plus proposé aux clients
- [ ] Vous pouvez facilement le remettre disponible

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 9 : Modifier les paramètres du restaurant

**Objectif :** Changer les informations de votre restaurant

### Étapes à suivre :
1. Depuis le menu, cliquez sur "Paramètres"
2. Modifiez la description de votre restaurant
3. Vérifiez vos horaires d'ouverture
4. Sauvegardez les modifications

### Résultat attendu :
- [ ] Vos informations actuelles sont affichées
- [ ] Vous pouvez modifier la description, téléphone, email
- [ ] Les horaires d'ouverture sont configurables par jour
- [ ] Un message confirme la sauvegarde

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 10 : Ouvrir/Fermer le restaurant

**Objectif :** Changer rapidement le statut d'ouverture

### Étapes à suivre :
1. Dans les paramètres, trouvez le bouton "Ouvert/Fermé"
2. Cliquez pour fermer le restaurant
3. Observez le changement de statut
4. Cliquez à nouveau pour rouvrir

### Résultat attendu :
- [ ] Un bouton toggle (on/off) est visible
- [ ] Le statut change immédiatement quand vous cliquez
- [ ] L'interface indique clairement si vous êtes ouvert ou fermé

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 11 : Tester différentes vues de commandes

**Objectif :** Utiliser les différents styles d'affichage des commandes

### Étapes à suivre :
1. Dans les commandes, cherchez un bouton "Designs" ou "Styles"
2. Testez la vue "Tableau Cuisine" (colonnes par statut)
3. Testez la vue "Cartes" (une commande à la fois)
4. Testez la vue "Liste compacte"

### Résultat attendu :
- [ ] Plusieurs styles de vue sont disponibles
- [ ] Chaque vue affiche les mêmes commandes différemment
- [ ] Vous pouvez revenir à la vue par défaut facilement
- [ ] Les actions sur les commandes fonctionnent dans tous les styles

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 12 : Test sur mobile/tablette (optionnel)

**Objectif :** Vérifier que l'interface s'adapte aux écrans plus petits

### Étapes à suivre :
1. Réduisez la taille de votre fenêtre de navigateur
2. Ou ouvrez le dashboard sur une tablette
3. Naviguez dans les différentes sections
4. Essayez d'effectuer les actions principales

### Résultat attendu :
- [ ] L'interface reste utilisable sur petit écran
- [ ] Les boutons sont assez grands pour être cliqués
- [ ] Le texte reste lisible
- [ ] Toutes les fonctions restent accessibles

### Observations :
```
(Notez ici tout problème rencontré)


```

---

# Résumé des Tests

## Récapitulatif

| Scénario | Réussi | Échec | Non testé |
|----------|--------|-------|-----------|
| 1. Connexion | [ ] | [ ] | [ ] |
| 2. Consulter commandes | [ ] | [ ] | [ ] |
| 3. Changer statut | [ ] | [ ] | [ ] |
| 4. Détails commande | [ ] | [ ] | [ ] |
| 5. Consulter menu | [ ] | [ ] | [ ] |
| 6. Ajouter plat | [ ] | [ ] | [ ] |
| 7. Modifier plat | [ ] | [ ] | [ ] |
| 8. Masquer plat | [ ] | [ ] | [ ] |
| 9. Paramètres restaurant | [ ] | [ ] | [ ] |
| 10. Ouvrir/Fermer | [ ] | [ ] | [ ] |
| 11. Vues commandes | [ ] | [ ] | [ ] |
| 12. Mobile/Tablette | [ ] | [ ] | [ ] |

## Impression générale

**L'interface était-elle facile à utiliser ?**
- [ ] Très facile
- [ ] Assez facile
- [ ] Difficile
- [ ] Très difficile

**Avez-vous rencontré des problèmes bloquants ?**
- [ ] Non, tout fonctionne
- [ ] Oui, certaines fonctions ne marchent pas

**Commentaires généraux :**
```
(Vos remarques, suggestions, ou problèmes rencontrés)




```

---

## Informations du testeur

**Nom :** _______________

**Date du test :** _______________

**Navigateur utilisé :** _______________

**Appareil :** [ ] Ordinateur  [ ] Tablette  [ ] Téléphone

---

*Merci pour votre participation aux tests !*
*Vos retours sont précieux pour améliorer l'application.*
