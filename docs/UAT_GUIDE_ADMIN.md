# Guide de Test Utilisateur - Dashboard Administrateur

## Pour qui est ce guide ?

Ce guide est destiné aux **administrateurs** de la plateforme OneEats qui supervisent l'ensemble des restaurants, utilisateurs et commandes.

---

## Avant de commencer

**Ce dont vous avez besoin :**
- Un ordinateur avec un navigateur web (Chrome recommandé)
- L'application doit vous avoir été installée et lancée par l'équipe technique
- Vos identifiants administrateur

**Identifiants de test :**
- Email : `admin@oneeats.com`
- Mot de passe : `adminpass123`

---

## Comment utiliser ce guide

1. Suivez les scénarios dans l'ordre
2. Pour chaque test, cochez les cases au fur et à mesure
3. Notez tout comportement inattendu dans la section "Observations"
4. Prenez des captures d'écran si vous rencontrez un problème

---

# Scénarios de Test

## Scénario 1 : Connexion administrateur

**Objectif :** Accéder à l'espace d'administration de la plateforme

### Étapes à suivre :
1. Ouvrez votre navigateur web
2. Accédez à l'adresse fournie par l'équipe technique
3. Entrez vos identifiants administrateur
4. Cliquez sur "Se connecter"

### Résultat attendu :
- [ ] La page de connexion s'affiche correctement
- [ ] Après connexion, vous êtes redirigé vers le tableau de bord admin
- [ ] Votre nom et rôle "Administrateur" sont affichés
- [ ] Toutes les sections admin sont accessibles dans le menu

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 2 : Tableau de bord principal

**Objectif :** Consulter les indicateurs clés de la plateforme

### Étapes à suivre :
1. Observez le tableau de bord principal après connexion
2. Identifiez les chiffres clés affichés (restaurants, utilisateurs, commandes)
3. Consultez les graphiques de performance
4. Changez la période d'affichage (aujourd'hui, semaine, mois)

### Résultat attendu :
- [ ] Les indicateurs clés sont visibles : nombre de restaurants, utilisateurs, commandes du jour
- [ ] Les chiffres de revenus sont affichés
- [ ] Les graphiques s'affichent correctement
- [ ] Les données changent quand vous modifiez la période

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 3 : Consulter la liste des restaurants

**Objectif :** Voir tous les restaurants partenaires de la plateforme

### Étapes à suivre :
1. Cliquez sur "Restaurants" dans le menu
2. Parcourez la liste des restaurants
3. Utilisez la recherche pour trouver un restaurant
4. Filtrez par statut (actif, inactif)

### Résultat attendu :
- [ ] Tous les restaurants sont listés avec leurs informations clés
- [ ] Le statut de chaque restaurant est visible (actif, fermé, en attente)
- [ ] La recherche par nom fonctionne
- [ ] Les filtres s'appliquent correctement

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 4 : Consulter les détails d'un restaurant

**Objectif :** Voir les informations complètes d'un restaurant

### Étapes à suivre :
1. Cliquez sur "Détails" sur un restaurant (ex: Pizza Palace)
2. Consultez les informations du profil
3. Vérifiez le menu du restaurant
4. Consultez les statistiques spécifiques

### Résultat attendu :
- [ ] Les informations complètes du restaurant sont affichées
- [ ] Vous pouvez voir le menu du restaurant
- [ ] Les statistiques de commandes sont visibles
- [ ] L'historique des commandes est accessible

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 5 : Suspendre et réactiver un restaurant

**Objectif :** Gérer le statut d'un restaurant

### Étapes à suivre :
1. Trouvez un restaurant de test dans la liste
2. Cliquez sur "Suspendre"
3. Confirmez la suspension
4. Vérifiez le changement de statut
5. Cliquez sur "Réactiver" pour remettre le restaurant en ligne

### Résultat attendu :
- [ ] Le bouton "Suspendre" est disponible
- [ ] Une confirmation est demandée avant la suspension
- [ ] Le restaurant apparaît comme "Inactif" après suspension
- [ ] Le bouton "Réactiver" permet de remettre le restaurant actif

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 6 : Consulter la liste des utilisateurs

**Objectif :** Voir tous les utilisateurs clients de la plateforme

### Étapes à suivre :
1. Cliquez sur "Utilisateurs" dans le menu
2. Parcourez la liste des utilisateurs
3. Utilisez la recherche pour trouver un utilisateur
4. Filtrez par statut si disponible

### Résultat attendu :
- [ ] La liste des utilisateurs s'affiche
- [ ] Chaque utilisateur montre : nom/email, statut, date d'inscription
- [ ] La recherche par nom ou email fonctionne
- [ ] Les informations sensibles sont masquées de façon appropriée

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 7 : Consulter le profil d'un utilisateur

**Objectif :** Voir les informations détaillées d'un utilisateur

### Étapes à suivre :
1. Cliquez sur "Voir profil" sur un utilisateur
2. Consultez ses informations de base
3. Vérifiez son historique de commandes
4. Observez ses statistiques (nombre de commandes, montant total)

### Résultat attendu :
- [ ] Le profil complet est accessible
- [ ] L'historique des commandes est visible
- [ ] Les statistiques utilisateur sont affichées
- [ ] Aucune donnée sensible n'est exposée de manière inappropriée

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 8 : Supervision des commandes

**Objectif :** Voir toutes les commandes de la plateforme

### Étapes à suivre :
1. Cliquez sur "Commandes" dans le menu
2. Consultez la liste globale des commandes
3. Filtrez par statut (en attente, en cours, terminées)
4. Filtrez par restaurant
5. Cliquez sur une commande pour voir ses détails

### Résultat attendu :
- [ ] Toutes les commandes de tous les restaurants sont visibles
- [ ] Chaque commande montre : client, restaurant, statut, montant
- [ ] Les filtres fonctionnent correctement
- [ ] Les détails complets sont accessibles

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 9 : Intervenir sur une commande problématique

**Objectif :** Gérer une situation exceptionnelle sur une commande

### Étapes à suivre :
1. Trouvez une commande avec un problème potentiel
2. Consultez ses détails complets
3. Ajoutez une note administrative (si disponible)
4. Vérifiez les options d'intervention disponibles

### Résultat attendu :
- [ ] Les détails complets de la commande sont accessibles
- [ ] Les informations du client et du restaurant sont visibles
- [ ] Vous pouvez ajouter des notes administratives
- [ ] Des options d'intervention d'urgence sont disponibles si nécessaire

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 10 : Consulter les statistiques et analytics

**Objectif :** Analyser les performances de la plateforme

### Étapes à suivre :
1. Cliquez sur "Statistiques" ou "Analytics" dans le menu
2. Consultez les graphiques de performance
3. Changez la période d'analyse (semaine, mois, année)
4. Identifiez les restaurants les plus performants

### Résultat attendu :
- [ ] La page de statistiques s'affiche correctement
- [ ] Les graphiques sont interactifs
- [ ] Les données changent selon la période sélectionnée
- [ ] Les indicateurs business importants sont visibles

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 11 : Exporter des données (si disponible)

**Objectif :** Générer un rapport ou exporter des données

### Étapes à suivre :
1. Dans la section statistiques, cherchez un bouton "Exporter"
2. Sélectionnez le type de données à exporter
3. Choisissez le format (CSV, PDF si disponible)
4. Téléchargez le fichier

### Résultat attendu :
- [ ] Un bouton d'export est disponible
- [ ] Vous pouvez choisir les données à exporter
- [ ] Le fichier se télécharge correctement
- [ ] Les données exportées sont complètes et correctes

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 12 : Vérifier les alertes et notifications

**Objectif :** Consulter les alertes système

### Étapes à suivre :
1. Sur le tableau de bord, identifiez les alertes actives
2. Cliquez sur une alerte pour plus de détails
3. Marquez une alerte comme traitée (si disponible)
4. Vérifiez le système de notifications

### Résultat attendu :
- [ ] Les alertes importantes sont visibles (ex: commandes en attente longue)
- [ ] Vous pouvez consulter les détails d'une alerte
- [ ] Les alertes traitées peuvent être archivées
- [ ] Les compteurs d'alertes se mettent à jour

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 13 : Test de sécurité des accès

**Objectif :** Vérifier que les restrictions d'accès fonctionnent

### Étapes à suivre :
1. Vérifiez que seuls les administrateurs voient le menu admin
2. Essayez d'accéder à des actions sensibles
3. Vérifiez que les actions critiques demandent confirmation
4. Déconnectez-vous et vérifiez que l'accès est bien bloqué

### Résultat attendu :
- [ ] Le menu admin n'est visible que pour les administrateurs
- [ ] Les actions critiques (suspension, suppression) demandent confirmation
- [ ] Après déconnexion, impossible d'accéder aux pages admin
- [ ] Les données sensibles sont protégées

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 14 : Valider un nouveau restaurant

**Objectif :** Approuver un restaurant en attente de validation

### Étapes à suivre :
1. Cliquez sur "Restaurants" dans le menu
2. Filtrez par statut "En attente"
3. Identifiez un restaurant avec le badge "En attente de validation"
4. Cliquez sur ce restaurant pour voir ses détails
5. Vérifiez les informations complètes :
   - Nom, description, catégorie
   - Adresse, téléphone, email
   - Horaires d'ouverture
   - Informations du propriétaire
6. Cliquez sur "Valider le restaurant"
7. Confirmez la validation

### Résultat attendu :
- [ ] Le filtre "En attente" affiche uniquement les restaurants PENDING
- [ ] Le badge "En attente de validation" est visible
- [ ] Toutes les informations du restaurant sont affichées
- [ ] Une confirmation est demandée avant validation
- [ ] Le restaurant passe au statut "Actif" après validation
- [ ] Le restaurant disparaît de la liste "En attente"

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 15 : Rejeter un restaurant

**Objectif :** Refuser un restaurant non conforme aux critères

### Étapes à suivre :
1. Filtrez les restaurants par "En attente"
2. Cliquez sur un restaurant à rejeter (informations incomplètes ou non conformes)
3. Cliquez sur "Rejeter le restaurant"
4. Dans la modale, saisissez une raison de rejet claire
5. Confirmez le rejet

### Résultat attendu :
- [ ] Le bouton "Rejeter" est disponible pour les restaurants en attente
- [ ] La raison de rejet est obligatoire (impossible de confirmer sans)
- [ ] Une confirmation est demandée avant rejet
- [ ] Le restaurant passe au statut "Rejeté"
- [ ] Le restaurant apparaît dans la liste "Rejetés"

### Observations :
```
(Notez ici tout problème rencontré)


```

---

## Scénario 16 : Suspendre et réactiver un utilisateur

**Objectif :** Gérer un utilisateur problématique (suspension temporaire)

### Étapes à suivre :
1. Cliquez sur "Utilisateurs" dans le menu
2. Trouvez un utilisateur de test dans la liste
3. Cliquez sur "Voir profil"
4. Cliquez sur "Suspendre l'utilisateur"
5. Sélectionnez une durée de suspension (ex: 7 jours)
6. Saisissez une raison de suspension
7. Confirmez la suspension
8. Vérifiez que le statut passe à "Suspendu"
9. Cliquez sur "Réactiver l'utilisateur"
10. Confirmez la réactivation

### Résultat attendu :
- [ ] Le bouton "Suspendre" est disponible sur le profil utilisateur
- [ ] La durée de suspension est demandée (1 jour, 7 jours, 30 jours, indéfinie)
- [ ] La raison de suspension est obligatoire
- [ ] L'utilisateur passe au statut "Suspendu"
- [ ] Le bouton "Réactiver" apparaît pour les utilisateurs suspendus
- [ ] La réactivation remet le statut à "Actif"

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
| 2. Tableau de bord | [ ] | [ ] | [ ] |
| 3. Liste restaurants | [ ] | [ ] | [ ] |
| 4. Détails restaurant | [ ] | [ ] | [ ] |
| 5. Suspendre/Réactiver restaurant | [ ] | [ ] | [ ] |
| 6. Liste utilisateurs | [ ] | [ ] | [ ] |
| 7. Profil utilisateur | [ ] | [ ] | [ ] |
| 8. Supervision commandes | [ ] | [ ] | [ ] |
| 9. Intervention commande | [ ] | [ ] | [ ] |
| 10. Statistiques | [ ] | [ ] | [ ] |
| 11. Export données | [ ] | [ ] | [ ] |
| 12. Alertes | [ ] | [ ] | [ ] |
| 13. Sécurité accès | [ ] | [ ] | [ ] |
| 14. Valider restaurant | [ ] | [ ] | [ ] |
| 15. Rejeter restaurant | [ ] | [ ] | [ ] |
| 16. Suspendre/Réactiver utilisateur | [ ] | [ ] | [ ] |

## Impression générale

**L'interface était-elle facile à utiliser ?**
- [ ] Très facile
- [ ] Assez facile
- [ ] Difficile
- [ ] Très difficile

**Les informations étaient-elles claires et complètes ?**
- [ ] Oui, tout était clair
- [ ] Partiellement, certaines infos manquent
- [ ] Non, difficile à comprendre

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

**Résolution d'écran :** _______________

---

*Merci pour votre participation aux tests !*
*Vos retours sont précieux pour améliorer la plateforme.*
