# Plan de Tests Utilisateur - OneEats 🧪

## 📋 Objectif des Tests

Ce document guide les testeurs pour valider le fonctionnement complet de l'écosystème OneEats, de la création de menus sur le dashboard restaurant à la commande via l'application mobile, en passant par la persistance des données en base.

---

## 🎯 Périmètre de Test

### **Dashboard Restaurant** (Interface Web)
- ✅ Gestion des menus (CRUD)
- ✅ Gestion des commandes en temps réel
- ✅ Système de notifications
- ✅ Tableau de bord analytique

### **Application Mobile** (React Native)  
- ✅ Navigation et découverte des restaurants
- ✅ Consultation des menus
- ✅ Système de panier et commande
- ✅ Suivi des commandes en temps réel

### **Base de Données** (PostgreSQL)
- ✅ Persistance des données
- ✅ Synchronisation temps réel
- ✅ Intégrité des données

---

## ⚡ Prérequis Techniques

### **Démarrage de l'environnement**
1. **Base de données** :
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **Backend** (Quarkus) :
   ```bash
   ./mvnw quarkus:dev
   ```

3. **Application mobile** (depuis le dossier apps/mobile) :
   ```bash
   npm start
   ```

### **URLs d'accès** 
- 📱 **App Mobile** : Expo Go ou simulateur
- 💻 **Dashboard Restaurant** : [http://localhost:5173/restaurant](http://localhost:5173/restaurant)
- 🗄️ **Base de données (PgAdmin)** : [http://localhost:5050](http://localhost:5050)
- 🔗 **API Documentation** : [http://localhost:8080/q/swagger-ui](http://localhost:8080/q/swagger-ui)

---

## 🧪 Scénarios de Test

### **Phase 1 : Configuration et Gestion des Menus** 

#### **Test 1.1 : Création d'un Menu Complet**
**Objectif** : Créer un menu avec plusieurs catégories et plats

**Étapes** :
1. 🌐 Accéder au dashboard restaurant : `http://localhost:5173/restaurant/menu`
2. ➕ Cliquer sur "Ajouter un plat"
3. 📝 Créer **3 entrées** avec ces informations :
   - **Nom** : "Salade César", "Bruschetta", "Soupe du jour"
   - **Catégorie** : "entrées"
   - **Prix** : 8.50€, 6.90€, 7.20€
   - **Description** : Description détaillée
   - **Disponible** : ✅ Coché
4. 🍝 Créer **4 plats principaux** :
   - **Noms** : "Pizza Margherita", "Pasta Carbonara", "Burger Classic", "Saumon grillé"
   - **Catégorie** : "plats"
   - **Prix** : 12.90€, 14.50€, 13.90€, 18.90€
5. 🍰 Créer **2 desserts** :
   - **Noms** : "Tiramisu", "Crème brûlée"
   - **Catégorie** : "desserts"
   - **Prix** : 6.90€, 7.50€

**Vérifications** :
- ✅ Les plats apparaissent immédiatement après création
- ✅ Les filtres par catégorie fonctionnent correctement
- ✅ Les compteurs de plats se mettent à jour
- ✅ La recherche fonctionne sur les noms et descriptions

#### **Test 1.2 : Gestion de la Disponibilité**
**Étapes** :
1. 🔍 Sélectionner 2 plats créés précédemment
2. 👁️ Cliquer sur "Masquer" pour les rendre indisponibles
3. 🔄 Actualiser la page
4. 👁️‍🗨️ Vérifier dans le filtre "Non disponibles"
5. 🔄 Remettre les plats disponibles

**Vérifications** :
- ✅ Le statut change immédiatement
- ✅ Les filtres reflètent les changements
- ✅ Les modifications persistent après actualisation

---

### **Phase 2 : Test de l'Application Mobile**

#### **Test 2.1 : Navigation et Découverte**
**Étapes** :
1. 📱 Ouvrir l'application mobile OneEats
2. 🔍 Vérifier que le restaurant "Pizza Palace" est affiché dans la liste
3. 👆 Appuyer sur "Pizza Palace" pour accéder aux détails
4. 📋 Vérifier que le menu est chargé depuis l'API backend
5. 🏷️ Tester les filtres par catégorie (Pizza, Dessert, Salade, Pâtes, Boisson)

**Vérifications** :
- ✅ Pizza Palace est visible sur la page d'accueil (chargé depuis l'API)
- ✅ Les 8 plats existants en BDD sont visibles dans l'app
- ✅ Les prix correspondent exactement à ceux du dashboard
- ✅ Les plats non disponibles sont correctement masqués
- ✅ Les catégories s'affichent dynamiquement selon les plats en BDD
- ✅ Aucune donnée mockée n'est utilisée (tout vient de l'API)

#### **Test 2.2 : Processus de Commande Complet**
**Étapes** :
1. 🛒 **Ajout au panier** :
   - Ajouter 2x "Pizza Margherita" 
   - Ajouter 1x "Salade César"
   - Ajouter 1x "Tiramisu"
2. 🛍️ **Accéder au panier** via l'icône flottante
3. ✏️ **Modifier les quantités** :
   - Réduire les pizzas à 1x
   - Ajouter 1x "Crème brûlée"
4. 📋 **Finaliser la commande** :
   - **Heure de récupération** : Choisir un créneau 30min plus tard
   - **Nom** : "Jean Testeur"
   - **Téléphone** : "06.12.34.56.78"  
   - **Instructions** : "Sans oignons sur la pizza"
5. ✅ **Confirmer la commande**

**Vérifications** :
- ✅ Le total se calcule automatiquement : 1×12.90 + 1×8.50 + 1×6.90 + 1×7.50 = **35.80€**
- ✅ La commande se confirme avec succès
- ✅ L'utilisateur est redirigé vers le suivi de commande
- ✅ Un ID de commande unique est généré

---

### **Phase 3 : Vérification Dashboard Restaurant**

#### **Test 3.1 : Réception de Commande en Temps Réel**
**Étapes** :
1. 💻 Retourner au dashboard : `http://localhost:5173/restaurant/orders`
2. 🔄 Actualiser si nécessaire
3. 👀 Vérifier la présence de la nouvelle commande

**Vérifications** :
- ✅ La commande apparaît dans l'onglet "En attente"
- ✅ Les détails correspondent : nom client, téléphone, articles, total
- ✅ Les instructions spéciales sont visibles
- ✅ L'heure de récupération est correcte

#### **Test 3.2 : Gestion du Cycle de Vie de la Commande**
**Étapes** :
1. ✅ **Accepter la commande** → Statut passe à "En préparation"
2. ⏰ Attendre 10 secondes
3. 🍽️ **Marquer "Prêt"** → Statut passe à "Prête"
4. ⏰ Attendre 10 secondes  
5. 📦 **Marquer "Récupérée"** → Statut passe à "Récupérée"

**Vérifications** :
- ✅ Chaque changement de statut est instantané
- ✅ La commande change d'onglet automatiquement
- ✅ Les boutons d'action évoluent selon le statut
- ✅ Le temps écoulé s'affiche correctement

---

### **Phase 4 : Vérification Mobile - Suivi Temps Réel**

#### **Test 4.1 : Suivi de Commande Client**
**Étapes** :
1. 📱 Dans l'app mobile, aller sur l'onglet "Panier" → "En cours"
2. 🔍 Localiser la commande créée au Test 2.2
3. 👆 Appuyer sur "Voir les détails"
4. 📈 Vérifier que le statut correspond à celui du dashboard

**Vérifications** :
- ✅ Le statut de la commande est synchronisé avec le dashboard
- ✅ Tous les détails de la commande sont corrects
- ✅ L'heure estimée de récupération est affichée
- ✅ Les articles et prix sont exacts

---

### **Phase 5 : Validation Base de Données**

#### **Test 5.1 : Vérification de la Persistance**
**Étapes** :
1. 🗄️ Accéder à PgAdmin : `http://localhost:5050`
2. 🔐 **Connexion** :
   - Email : `admin@oneeats.com`
   - Mot de passe : `admin123`
3. 🔗 **Se connecter à la base** :
   - Host : `postgres` 
   - Database : `oneeats_dev`
   - Username : `oneeats_user`
   - Password : `oneeats_pass`
4. 🔍 **Exécuter les requêtes suivantes** :

```sql
-- Vérifier les menus créés
SELECT id, name, price, category, available 
FROM menu_items 
WHERE restaurant_id = '11111111-1111-1111-1111-111111111111'
ORDER BY category, name;

-- Vérifier la dernière commande
SELECT o.id, o.status, o.total, o.client_name, o.created_at,
       oi.quantity, mi.name as item_name, oi.total_price
FROM orders o
JOIN order_items oi ON o.id = oi.order_id  
JOIN menu_items mi ON oi.menu_item_id = mi.id
ORDER BY o.created_at DESC
LIMIT 10;
```

**Vérifications** :
- ✅ **9 plats** sont présents dans la base (3 entrées + 4 plats + 2 desserts)
- ✅ Les prix correspondent exactement à ceux saisis
- ✅ La commande est enregistrée avec tous ses détails
- ✅ Les relations entre commande et articles sont correctes
- ✅ Le statut de la commande correspond au dashboard

---

## 🚨 Tests d'Erreurs et Cas Limites

### **Test E.1 : Gestion des Erreurs**
1. 🛒 Essayer de commander depuis l'app sans être connecté
2. 📱 Tester la navigation avec une connexion internet instable
3. 💻 Créer un plat avec un prix négatif ou invalide
4. 🔄 Rafraîchir la page pendant une création de plat

### **Test E.2 : Performance et Robustesse**
1. ⚡ Créer rapidement 10 plats d'affilée
2. 📱 Ajouter/retirer rapidement des articles du panier
3. 🔄 Tester avec plusieurs onglets du dashboard ouverts
4. ⏰ Laisser l'app mobile ouverte pendant 30 minutes

---

## 📊 Critères de Validation

### ✅ **Test RÉUSSI** si :
- Tous les plats créés sont visibles sur mobile
- Les commandes transitent correctement du mobile au dashboard  
- La base de données contient toutes les informations cohérentes
- Les changements de statut sont temps réel
- Aucune perte de données lors des actualisation

### ❌ **Test ÉCHOUÉ** si :
- Décalage entre les données mobile/dashboard/BDD
- Commandes qui ne s'affichent pas
- Erreurs lors de la création/modification
- Statuts non synchronisés
- Crash ou erreurs d'affichage

---

## 📋 Rapport de Test Attendu

### **Format du Rapport**

```markdown
# Rapport de Test - [Date]

## ✅ Tests Réussis
- [ ] Phase 1 : Création menus  
- [ ] Phase 2 : App mobile
- [ ] Phase 3 : Dashboard restaurant
- [ ] Phase 4 : Suivi temps réel
- [ ] Phase 5 : Base de données

## ❌ Problèmes Détectés
1. **[Titre du problème]**
   - Description : ...
   - Étapes pour reproduire : ...
   - Impact : Critique/Majeur/Mineur

## 📊 Statistiques
- Temps total de test : X minutes
- Nombre de plats créés : 9
- Nombre de commandes testées : 1
- Taux de réussite : X%

## 💡 Suggestions d'Amélioration
- ...
```

---

## 🆘 Support et Dépannage

### **Problèmes Courants**
1. **Dashboard ne s'affiche pas** → Vérifier que Quarkus est démarré sur le port 8080
2. **App mobile ne se connecte pas** → Vérifier l'IP du serveur dans la configuration
3. **Base de données inaccessible** → Vérifier Docker et les conteneurs PostgreSQL
4. **Commandes ne s'affichent pas** → Vérifier les logs backend avec `./mvnw quarkus:dev`

### **Contacts Techniques**
- 💻 **Backend/API** : Vérifier logs Quarkus console
- 📱 **Mobile** : Vérifier Metro bundler et Expo console  
- 🗄️ **Base de données** : Vérifier docker-compose logs

---

**🎯 Objectif** : Ce plan de test valide l'intégralité du flux OneEats, de la création d'un menu restaurant jusqu'à la commande client, en passant par la vérification de la persistance des données. Il garantit que toutes les parties du système communiquent correctement et que l'expérience utilisateur est fluide et cohérente.