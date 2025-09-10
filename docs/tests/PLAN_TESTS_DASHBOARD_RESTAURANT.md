# Plan de Tests Utilisateur - Dashboard Restaurant 🏪

## 📋 Objectif des Tests

Ce document guide les testeurs pour valider le fonctionnement complet du dashboard restaurant OneEats, permettant aux restaurateurs de gérer leurs menus, commandes et paramètres via l'interface web intégrée.

---

## 🎯 Périmètre de Test - Dashboard Restaurant

### **🍽️ Gestion des Menus**
- ✅ Création, modification, suppression des plats
- ✅ Organisation par catégories (entrées, plats, desserts)
- ✅ Gestion des prix et descriptions
- ✅ Activation/désactivation des plats
- ✅ Recherche et filtres

### **📋 Gestion des Commandes**  
- ✅ Réception des nouvelles commandes
- ✅ Mise à jour des statuts (En attente → En préparation → Prête → Récupérée)
- ✅ Affichage temps réel des commandes
- ✅ Différents designs de dashboard (KitchenBoard, SwipeCards, etc.)

### **⚙️ Paramètres Restaurant**
- ✅ Modification du profil restaurant
- ✅ Configuration des horaires d'ouverture
- ✅ Gestion des informations de contact

### **📊 Analytics et Métriques**
- ✅ Tableau de bord avec métriques
- ✅ Statistiques des commandes
- ✅ Visualisation des performances

---

## ⚡ Prérequis Techniques

### **🖥️ Architecture Spécifique**
- **Backend** : Quarkus lancé depuis IntelliJ IDEA
- **Frontend** : React intégré via Quinoa dans Quarkus
- **URL unique** : `http://localhost:8080` (backend + dashboard)
- **Base de données** : PostgreSQL Docker sur port 5432

### **✅ Services à vérifier avant tests**
```bash
# 1. Base de données démarrée
docker-compose -f docker-compose.dev.yml up -d

# 2. Vérifier Quarkus en mode dev (depuis IntelliJ)
http://localhost:8080/q/health

# 3. Vérifier dashboard restaurant accessible
http://localhost:8080/restaurant
```

### **🗄️ Données de test**
- **Restaurant** : Pizza Palace (id: 1) chargé via `import-dev.sql`
- **Utilisateur Restaurant** : `restaurant@pizzapalace.com` / `password123`
- **Plats existants** : Plusieurs pizzas et desserts pré-chargés

---

## 🧪 Plan de Tests Détaillé

### **🔐 Test 0 : Connexion Dashboard Restaurant**

**Objectif** : Vérifier l'accès au dashboard restaurant

**Étapes** :
1. 🌐 Accéder à `http://localhost:8080/login`
2. 📝 Saisir les identifiants : `restaurant@pizzapalace.com` / `password123`
3. 🔑 Cliquer sur "Se connecter"
4. ↩️ Vérifier la redirection vers `/restaurant`

**Vérifications** :
- ✅ Connexion réussie sans erreur
- ✅ Interface restaurant visible avec menu de navigation
- ✅ Nom du restaurant "Pizza Palace" affiché en header
- ✅ Menu latéral avec toutes les sections accessibles

---

### **📋 Test 1 : Gestion des Commandes**

#### **Test 1.1 : Affichage des Commandes Existantes**
**Objectif** : Vérifier l'affichage des commandes en temps réel

**Étapes** :
1. 🌐 Depuis le dashboard, aller sur `/restaurant/orders`
2. 👀 Observer la liste des commandes actuelles
3. 🎛️ Tester les différents designs de dashboard via "Designs"

**Vérifications** :
- ✅ Les commandes s'affichent avec statuts corrects
- ✅ Les informations client et détails commande sont visibles
- ✅ Les boutons de changement de statut fonctionnent
- ✅ Les designs alternatifs (KitchenBoard, SwipeCards) se chargent

#### **Test 1.2 : Système de Filtres par Statut**
**Objectif** : Tester les onglets de filtrage des commandes

**Étapes** :
1. 📋 **Tester tous les onglets de statut** :
   - "En attente" (en_attente) 
   - "En cours" (en_preparation)
   - "Prêtes" (prete)
   - "Récupérées" (recuperee)
   - "Annulées" (annulee)
2. 👀 Observer les commandes filtrées dans chaque onglet
3. 🔍 Utiliser la recherche dans chaque onglet
4. 🔄 Changer d'onglet rapidement pour tester la performance

**Vérifications** :
- ✅ Chaque onglet affiche uniquement les commandes du bon statut
- ✅ Navigation fluide entre les onglets
- ✅ Recherche fonctionne dans chaque onglet
- ✅ Compteurs de commandes corrects par onglet
- ✅ Interface responsive sur tous les onglets

#### **Test 1.3 : Actions sur les Commandes**
**Objectif** : Tester toutes les actions disponibles sur les commandes

**Étapes** :
1. 📋 **Commande "En attente"** :
   - Cliquer sur "Accepter" (→ EN_PREPARATION)
   - OU Cliquer sur "Refuser" (→ ANNULEE)
2. 📋 **Commande "En préparation"** :
   - Cliquer sur "Marquer prête" (→ PRETE)
   - OU Cliquer sur "Annuler" (→ ANNULEE)
3. 📋 **Commande "Prête"** :
   - Cliquer sur "Marquer récupérée" (→ RECUPEREE)
4. 👁️ **Détails commande** :
   - Cliquer sur "Voir détails" 
   - Vérifier l'ouverture du modal avec informations complètes
5. 📞 **Actions depuis le modal** :
   - Tester les actions rapides depuis le modal de détail

**Vérifications** :
- ✅ Action "Accepter" change statut vers EN_PREPARATION
- ✅ Action "Refuser" change statut vers ANNULEE 
- ✅ Action "Marquer prête" change statut vers PRETE
- ✅ Action "Marquer récupérée" change statut vers RECUPEREE
- ✅ Modal détail s'ouvre avec infos complètes
- ✅ Actions depuis modal fonctionnent
- ✅ Changements persistants en base de données

#### **Test 1.4 : Recherche dans les Commandes**
**Objectif** : Tester le système de recherche

**Étapes** :
1. 🔍 **Recherche par nom client** :
   - Saisir le nom d'un client existant
   - Vérifier les résultats filtrés
2. 🔍 **Recherche par ID commande** :
   - Saisir l'ID d'une commande
   - Vérifier la commande trouvée
3. 🔍 **Recherche par numéro de commande** :
   - Utiliser le orderNumber si disponible
4. 🔍 **Recherche sans résultat** :
   - Saisir un terme inexistant
   - Vérifier le message d'absence de résultat

**Vérifications** :
- ✅ Recherche par nom client fonctionne
- ✅ Recherche par ID commande fonctionne  
- ✅ Recherche par orderNumber fonctionne
- ✅ Recherche en temps réel (pas besoin d'Enter)
- ✅ Message approprié si aucun résultat
- ✅ Recherche combinable avec filtres de statut

#### **Test 1.5 : Design Selector des Commandes**
**Objectif** : Tester les différents styles d'affichage des commandes

**Étapes** :
1. 🎨 **Accéder aux designs** :
   - Naviguer vers `/restaurant/dashboard-designs`
   - Observer les 4 styles disponibles
2. 🍳 **Tester "Vue Tableau Cuisine"** :
   - Sélectionner le style Kanban/Trello
   - Vérifier l'affichage en colonnes par statut
   - Tester le drag & drop si disponible
3. 📱 **Tester "Vue Cartes (Swipe)"** :
   - Sélectionner le style Tinder-like
   - Vérifier l'affichage une commande à la fois
   - Tester les gestes de swipe si implémentés
4. 📋 **Tester "Liste Compacte"** :
   - Sélectionner le style liste dense
   - Vérifier l'affichage compact avec actions rapides
5. 🎫 **Tester "Système Tickets POS"** :
   - Sélectionner le style tickets de caisse
   - Vérifier l'affichage style POS/impression

**Vérifications** :
- ✅ Les 4 styles de design sont accessibles
- ✅ Navigation fluide entre les styles
- ✅ Chaque style affiche les commandes correctement
- ✅ Actions de commandes fonctionnent dans tous les styles
- ✅ Interface adaptée à chaque style
- ✅ Bouton "Retour aux styles" fonctionne

---

### **🍽️ Test 2 : Gestion des Menus**

#### **Test 2.1 : Consultation du Menu Existant**
**Objectif** : Vérifier l'affichage du menu du restaurant

**Étapes** :
1. 🌐 Naviguer vers `/restaurant/menu`
2. 👀 Observer la liste des plats existants
3. 🔍 Tester la recherche avec "Pizza"
4. 🏷️ Tester les filtres par catégorie

**Vérifications** :
- ✅ Tous les plats de Pizza Palace sont affichés
- ✅ Images, noms, prix et descriptions visibles
- ✅ Recherche fonctionne sur noms et descriptions
- ✅ Filtres par catégorie fonctionnent correctement
- ✅ Compteur de plats par catégorie est exact

#### **Test 2.2 : Création d'un Nouveau Plat Simple**
**Objectif** : Créer un plat complet avec les informations de base

**Étapes** :
1. ➕ Cliquer sur "Ajouter un plat"
2. 📝 Remplir le formulaire de base :
   - **Nom** : "Pizza Végétarienne Deluxe"
   - **Catégorie** : "plats"
   - **Prix** : 15.90
   - **Description** : "Tomates, mozzarella, légumes grillés, basilic frais"
   - **Disponible** : ✅ Coché
3. 💾 Cliquer sur "Ajouter"

**Vérifications** :
- ✅ Plat créé et visible immédiatement dans la liste
- ✅ Toutes les informations correctement affichées
- ✅ Compteur de plats mis à jour
- ✅ Plat trouvable via recherche
- ✅ Prix formaté correctement (15.90 €)

#### **Test 2.3 : Création d'un Plat avec Options Complètes**
**Objectif** : Tester le système d'options avancées des plats

**Étapes** :
1. ➕ Cliquer sur "Ajouter un plat"
2. 📝 Remplir les informations de base :
   - **Nom** : "Pizza Personnalisable"
   - **Catégorie** : "plats" 
   - **Prix** : 12.90
   - **Description** : "Pizza de base avec options personnalisables"
3. 🔧 **Ajouter Option 1 - Choix obligatoire** :
   - **Nom de l'option** : "Choix de sauce"
   - **Type d'option** : "🔘 Choix unique/multiple"
   - **Nombre de choix maximum** : 1
   - **Option obligatoire** : ✅ Coché
   - **Choix disponibles** :
     - Sauce tomate (0.00 €)
     - Sauce crème (0.50 €)
     - Sauce pesto (1.00 €)
4. 🔧 **Ajouter Option 2 - Suppléments payants** :
   - **Nom de l'option** : "Suppléments"
   - **Type d'option** : "➕ Suppléments payants"
   - **Option obligatoire** : ❌ Non coché
   - **Choix disponibles** :
     - Extra fromage (2.00 €)
     - Champignons (1.50 €)
     - Olives (1.00 €)
5. 🔧 **Ajouter Option 3 - Retirer ingrédients** :
   - **Nom de l'option** : "Ingrédients à retirer"
   - **Type d'option** : "➖ Retirer des ingrédients"
   - **Option obligatoire** : ❌ Non coché
   - **Choix disponibles** :
     - Retirer oignons (0.00 €)
     - Retirer tomates (0.00 €)
6. 💾 Cliquer sur "Ajouter"

**Vérifications** :
- ✅ Plat créé avec toutes les options configurées
- ✅ 3 options distinctes sauvegardées
- ✅ Types d'options corrects (choix/extra/remove)
- ✅ Prix des choix sauvegardés correctement
- ✅ Options obligatoires/facultatives respectées
- ✅ Descriptions d'aide affichées pour chaque type

#### **Test 2.4 : Gestion des Options - Cas Complexes**
**Objectif** : Tester les fonctionnalités avancées des options

**Étapes** :
1. ➕ Créer un plat "Burger Deluxe"
2. 🔧 **Option choix multiple illimité** :
   - **Nom** : "Garnitures incluses"
   - **Type** : "Choix unique/multiple"
   - **Maximum** : (laisser vide pour illimité)
   - **Obligatoire** : ✅ Oui
   - **Choix** : Salade, Tomate, Cornichons, Oignons (tous à 0€)
3. 🔧 **Option choix limité** :
   - **Nom** : "Choix de fromage"
   - **Type** : "Choix unique/multiple"
   - **Maximum** : 2
   - **Choix** : Cheddar (0€), Roquefort (1€), Chèvre (1.50€)
4. ✏️ **Modifier une option existante** :
   - Ajouter un nouveau choix dans "Suppléments"
   - Modifier le prix d'un choix existant
   - Supprimer un choix
5. 🗑️ **Supprimer une option complète**

**Vérifications** :
- ✅ Choix multiple illimité fonctionne
- ✅ Limitation du nombre de choix respectée
- ✅ Modification des choix existants
- ✅ Ajout/suppression de choix dans une option
- ✅ Suppression complète d'option

#### **Test 2.5 : Actions Rapides sur les Plats**
**Objectif** : Tester les actions directes depuis la carte de plat

**Étapes** :
1. 🔍 Localiser une carte de plat dans la liste
2. 👁️ **Tester l'action "Masquer/Afficher"** :
   - Cliquer sur "Masquer" pour un plat disponible
   - Vérifier que le plat devient grisé
   - Cliquer sur "Afficher" pour le rendre disponible
3. ✏️ **Tester l'action "Modifier"** :
   - Cliquer sur "Modifier" depuis la carte
   - Vérifier l'ouverture du modal avec données pré-remplies
4. 🗑️ **Tester l'action "Supprimer"** :
   - Cliquer sur "Supprimer" depuis la carte
   - Confirmer la suppression

**Vérifications** :
- ✅ Action "Masquer/Afficher" change le statut immédiatement
- ✅ Plat masqué apparaît grisé avec badge "Indisponible"
- ✅ Action "Modifier" ouvre le modal avec bonnes données
- ✅ Action "Supprimer" supprime le plat après confirmation
- ✅ Badge de statut mis à jour en temps réel

#### **Test 2.6 : Filtres et Recherche Avancés**
**Objectif** : Tester tous les systèmes de filtrage

**Étapes** :
1. 🔍 **Test recherche** :
   - Rechercher par nom de plat
   - Rechercher par mots-clés de description
   - Tester recherche vide/sans résultat
2. 📋 **Test filtres de disponibilité** :
   - Filtrer "Tous" (par défaut)
   - Filtrer "Disponibles" uniquement
   - Filtrer "Non disponibles" uniquement
3. 🏷️ **Test filtres de catégorie** :
   - Sélectionner "Toutes"
   - Sélectionner une catégorie spécifique (ex: "plats")
   - Changer de catégorie dynamiquement
4. 🔄 **Test combinaisons de filtres** :
   - Recherche + filtre catégorie
   - Recherche + filtre disponibilité
   - Tous les filtres combinés

**Vérifications** :
- ✅ Recherche fonctionne en temps réel (saisie)
- ✅ Recherche trouve les plats par nom et description
- ✅ Filtres disponibilité appliquent correctement
- ✅ Filtres catégorie affichent les bons plats
- ✅ Compteurs de plats mis à jour selon filtres
- ✅ Message "Aucun plat trouvé" si filtres sans résultat
- ✅ Combinaisons de filtres fonctionnent ensemble

#### **Test 2.7 : Interface Responsive et Adaptative**
**Objectif** : Tester l'adaptation à différentes tailles d'écran

**Étapes** :
1. 📱 **Test vue Mobile** :
   - Réduire la fenêtre à taille mobile
   - Vérifier l'interface mobile simplifiée
   - Tester les boutons et actions tactiles
2. 💻 **Test vue Tablette** :
   - Taille intermédiaire (768px-1024px)
   - Vérifier la grille adaptive des catégories
3. 🖥️ **Test vue Desktop** :
   - Grande taille d'écran
   - Vérifier les effets visuels avancés
   - Tester les animations et gradients

**Vérifications** :
- ✅ Interface s'adapte parfaitement sur mobile
- ✅ Boutons tactiles accessibles et bien dimensionnés
- ✅ Grilles adaptatives selon la taille d'écran
- ✅ Typographie responsive (textes plus petits sur mobile)
- ✅ Effets visuels appropriés par taille d'écran
- ✅ Navigation fluide sur tous les devices

#### **Test 2.8 : Modification d'un Plat Existant**
**Objectif** : Modifier les informations d'un plat

**Étapes** :
1. 🖊️ Cliquer sur "Modifier" d'un plat existant (ex: Pizza Margherita)
2. ✏️ Modifier le prix : 13.90 → 14.90
3. ✏️ Ajouter à la description : " - Pâte artisanale"
4. 🔄 Décocher "Disponible"
5. 💾 Sauvegarder les modifications

**Vérifications** :
- ✅ Prix mis à jour dans la liste
- ✅ Description modifiée visible
- ✅ Plat marqué comme "Non disponible" (grisé)
- ✅ Modifications persistantes après rechargement de page

#### **Test 2.4 : Suppression d'un Plat**
**Objectif** : Supprimer un plat du menu

**Étapes** :
1. 🗑️ Cliquer sur "Supprimer" d'un plat de test
2. ✅ Confirmer la suppression dans la popup
3. 🔄 Vérifier que le plat disparaît de la liste

**Vérifications** :
- ✅ Plat supprimé de l'interface immédiatement
- ✅ Compteur de plats mis à jour
- ✅ Suppression confirmée en base de données
- ✅ Plat introuvable via recherche

---

### **⚙️ Test 3 : Paramètres Restaurant**

#### **Test 3.1 : Modification du Profil Restaurant**
**Objectif** : Modifier les informations du restaurant

**Étapes** :
1. 🌐 Naviguer vers `/restaurant/settings`
2. ✏️ Modifier les informations :
   - **Description** : Ajouter " - Spécialité italienne authentique"
   - **Téléphone** : Changer le numéro
   - **Email** : Vérifier l'email de contact
3. 💾 Sauvegarder les modifications

**Vérifications** :
- ✅ Modifications sauvegardées avec succès
- ✅ Message de confirmation affiché
- ✅ Nouvelles informations visibles dans le header
- ✅ Persistance après déconnexion/reconnexion

#### **Test 3.2 : Configuration Horaires d'Ouverture**
**Objectif** : Configurer les horaires du restaurant

**Étapes** :
1. 📅 Accéder à la section "Horaires d'ouverture"
2. ⏰ **Configurer les horaires jour par jour** :
   - **Lundi** : 09:00-18:00
   - **Mardi** : 09:00-18:00  
   - **Mercredi** : 09:00-18:00
   - **Jeudi** : 09:00-18:00
   - **Vendredi** : 09:00-18:00
   - **Samedi** : 10:00-17:00
   - **Dimanche** : Fermé (null)
3. 🔄 **Tester les plages horaires** :
   - Configurer des créneaux doubles (midi + soir)
   - Tester la fermeture complète d'un jour
4. 💾 Sauvegarder la configuration

**Vérifications** :
- ✅ Horaires sauvegardés correctement pour chaque jour
- ✅ Possibilité de fermer complètement un jour
- ✅ Interface intuitive pour saisie horaires
- ✅ Status "Ouvert/Fermé" calculé selon horaires actuels
- ✅ Affichage cohérent des plages horaires

#### **Test 3.3 : Toggle Ouverture/Fermeture Immédiat**
**Objectif** : Tester le système d'ouverture/fermeture immédiate

**Étapes** :
1. 🔴 **Fermeture immédiate** :
   - Cliquer sur le toggle "Ouvert/Fermé"
   - Passer de "Ouvert" à "Fermé"
   - Vérifier l'impact immédiat
2. 🟢 **Réouverture** :
   - Cliquer à nouveau le toggle
   - Repasser à "Ouvert"
   - Vérifier le retour à la normale
3. 📊 **Vérifier l'impact** :
   - Observer si cela affecte l'affichage côté client
   - Vérifier la persistance du statut

**Vérifications** :
- ✅ Toggle fonctionne immédiatement
- ✅ Changement de statut visible dans l'interface
- ✅ Statut persistant après rechargement
- ✅ Impact sur la visibilité côté client (si implémenté)
- ✅ Indications visuelles claires du statut

#### **Test 3.4 : Chargement et Gestion des Erreurs**
**Objectif** : Tester la robustesse de la page paramètres

**Étapes** :
1. 🔄 **Test état de chargement** :
   - Accéder à la page pendant le chargement API
   - Vérifier l'affichage du spinner/loader
2. ❌ **Test gestion d'erreurs** :
   - Simuler une erreur API (déconnecter le backend)
   - Vérifier l'affichage d'erreur
   - Tester le bouton "Réessayer"
3. 🔄 **Test rechargement des données** :
   - Recharger les données après erreur
   - Vérifier le retour à la normale

**Vérifications** :
- ✅ Écran de chargement professionnel affiché
- ✅ Message d'erreur clair en cas de problème
- ✅ Bouton "Réessayer" fonctionnel  
- ✅ Récupération gracieuse après erreur
- ✅ Aucun crash de l'interface

#### **Test 3.5 : Mapping et Transformation des Données**
**Objectif** : Vérifier la cohérence des données entre API et interface

**Étapes** :
1. 📋 **Vérifier le mapping des champs** :
   - Cuisinetype → category
   - isOpen → statut d'ouverture
   - Autres transformations automatiques
2. 🔄 **Tester la synchronisation** :
   - Modifier des données
   - Vérifier la sauvegarde en base
   - Recharger et vérifier la persistance
3. 📊 **Vérifier les données par défaut** :
   - Schedule généré automatiquement si absent
   - Valeurs par défaut appropriées

**Vérifications** :
- ✅ Mapping cuisineType ↔ category correct
- ✅ Données transformées correctement affichées
- ✅ Schedule par défaut généré si manquant
- ✅ Synchronisation bidirectionnelle fonctionnelle
- ✅ Aucune perte de données lors des transformations

---

### **🔄 Test 4 : Intégration et Temps Réel**

#### **Test 4.1 : Synchronisation Temps Réel**
**Objectif** : Vérifier la synchronisation avec l'app mobile (simulation)

**Étapes** :
1. 🖥️ Garder le dashboard restaurant ouvert
2. 📱 Simuler une commande mobile (via API ou BDD)
3. 👀 Observer l'arrivée de la nouvelle commande
4. 🔔 Vérifier les notifications

**Vérifications** :
- ✅ Nouvelle commande apparaît automatiquement
- ✅ Notification sonore/visuelle (si implémentée)
- ✅ Compteurs mis à jour en temps réel
- ✅ Aucune nécessité de rafraîchir la page

---

### **🛠️ Test 5 : Validations et Cas d'Erreur**

#### **Test 5.1 : Validation des Formulaires de Plats**
**Objectif** : Tester toutes les validations de saisie

**Étapes** :
1. 📝 **Champs obligatoires** :
   - Essayer de créer un plat sans nom
   - Essayer de créer un plat sans prix
   - Essayer de créer un plat sans catégorie
   - Essayer de créer un plat sans description
2. 💰 **Validation du prix** :
   - Saisir un prix négatif
   - Saisir un prix avec trop de décimales
   - Saisir des caractères non-numériques
3. 🔧 **Validation des options** :
   - Créer une option sans nom
   - Créer un choix sans nom
   - Saisir des prix invalides pour les choix
4. 📊 **Cas limites** :
   - Nom de plat très long (>100 caractères)
   - Description très longue (>500 caractères)
   - Prix très élevé (>1000€)

**Vérifications** :
- ✅ Messages d'erreur clairs pour champs obligatoires
- ✅ Validation des prix en temps réel
- ✅ Impossible de sauvegarder avec données invalides
- ✅ Gestion gracieuse des cas limites
- ✅ Focus automatique sur le champ en erreur

#### **Test 5.2 : Gestion des Erreurs API**
**Objectif** : Comportement en cas d'erreur backend

**Étapes** :
1. 🔌 **Déconnexion backend** :
   - Arrêter le backend Quarkus
   - Essayer de créer/modifier un plat
   - Essayer de changer un statut de commande
2. ⚠️ **Erreurs serveur** :
   - Simuler une erreur 500
   - Simuler une erreur 404
   - Simuler un timeout
3. 🔄 **Récupération après erreur** :
   - Redémarrer le backend
   - Vérifier la reconnexion automatique
   - Retenter les opérations échouées

**Vérifications** :
- ✅ Messages d'erreur utilisateur-friendly
- ✅ Aucun crash de l'interface
- ✅ Console log des erreurs techniques
- ✅ Retry automatique ou manuel
- ✅ État cohérent après récupération

#### **Test 5.3 : Performance et Stress**
**Objectif** : Tester les limites de l'interface

**Étapes** :
1. 📋 **Volume important** :
   - Tester avec 100+ plats au menu
   - Tester avec 50+ commandes actives
   - Vérifier la performance des filtres/recherche
2. 🔄 **Actions répétées** :
   - Créer/supprimer des plats rapidement
   - Changer les statuts de commandes en masse
   - Naviguer entre les sections rapidement
3. 💾 **Mémoire et ressources** :
   - Laisser l'interface ouverte longtemps
   - Vérifier les fuites mémoire
   - Tester sur appareil moins puissant

**Vérifications** :
- ✅ Performance acceptable avec gros volumes
- ✅ Pas de ralentissement majeur
- ✅ Pagination/virtualisation si nécessaire
- ✅ Utilisation mémoire raisonnable
- ✅ Interface reste responsive

#### **Test 5.4 : Cas d'Usage Réels**
**Objectif** : Simuler un service de restaurant réel

**Étapes** :
1. 🏃‍♂️ **Rush du midi** :
   - Créer 20 commandes en 5 minutes
   - Traiter les commandes par ordre d'urgence
   - Vérifier la gestion du stress
2. 🍽️ **Changement de menu** :
   - Modifier 10 plats rapidement
   - Changer les disponibilités en masse
   - Ajouter une nouvelle catégorie complète
3. 📱 **Multi-dispositifs** :
   - Utiliser sur tablette pendant le service
   - Alterner entre mobile et desktop
   - Vérifier la synchronisation

**Vérifications** :
- ✅ Gestion fluide des pics d'activité
- ✅ Actions rapides possibles
- ✅ Interface utilisable sous pression
- ✅ Synchronisation multi-appareils
- ✅ Temps de réponse acceptable

---

## 🚨 Tests de Régression

### **🔍 Test R1 : Persistance des Données**
- ✅ Fermer et rouvrir le navigateur
- ✅ Vérifier que toutes les modifications sont conservées
- ✅ Reconnexion automatique ou manuelle
- ✅ Données cohérentes après fermeture inopinée

### **🔍 Test R2 : Performance Interface**
- ✅ Navigation fluide entre les sections
- ✅ Chargement rapide des listes de plats/commandes  
- ✅ Réactivité des formulaires et actions
- ✅ Transitions animations sans lag

### **🔍 Test R3 : Gestion d'Erreurs**
- ✅ Connexion avec identifiants incorrects
- ✅ Création plat avec champs manquants
- ✅ Comportement si backend indisponible
- ✅ Recovery automatique après reconnexion

### **🔍 Test R4 : Intégrations Spécifiques**
- ✅ Quinoa + Quarkus fonctionnent ensemble
- ✅ Hot reload préserve l'état de l'interface
- ✅ URLs correctes pour architecture intégrée
- ✅ Pas de conflit entre ports backend/frontend

---

## 📝 Critères de Validation

### **✅ Critères de Succès**
- Toutes les fonctionnalités CRUD des menus fonctionnent
- Gestion des commandes fluide avec tous les statuts
- Paramètres restaurant modifiables et persistants
- Interface responsive et intuitive
- Aucune erreur bloquante

### **❌ Critères d'Échec**
- Impossibilité de créer/modifier des plats
- Erreurs lors des changements de statut de commandes
- Perte de données après déconnexion
- Interface cassée ou inutilisable
- Erreurs 500 récurrentes

---

## 🔧 Environnement de Test

### **Configuration Requise**
- ✅ Quarkus en mode dev depuis IntelliJ IDEA
- ✅ PostgreSQL Docker actif (`docker-compose.dev.yml`)
- ✅ Données de test chargées (`import-dev.sql`)
- ✅ URL unique : `http://localhost:8080`

### **Navigateurs Supportés**
- 🌐 Chrome/Chromium (recommandé)
- 🦊 Firefox
- 🧭 Safari
- 📱 Mobile responsive (optionnel)

---

**🎯 Ce plan de tests couvre tous les aspects critiques du dashboard restaurant OneEats, depuis la connexion jusqu'aux fonctionnalités avancées, en tenant compte de l'architecture spécifique Quarkus + Quinoa.**