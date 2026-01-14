# Plan de Tests Utilisateur - Dashboard Administrateur

## Objectif des Tests

Ce document guide les testeurs pour valider le fonctionnement complet du dashboard administrateur OneEats, permettant aux administrateurs de superviser la plateforme, gérer les restaurants, utilisateurs et consulter les statistiques globales.

---

## Périmètre de Test - Dashboard Administrateur

### Tableau de Bord Principal
- ✅ Vue d'ensemble avec KPIs temps réel
- ✅ Métriques globales (restaurants, utilisateurs, commandes)
- ✅ Graphiques et visualisations données
- ✅ Alertes et notifications système

### Gestion des Restaurants  
- ✅ Liste complète des restaurants partenaires
- ✅ Validation et approbation nouveaux restaurants
- ✅ Suspension/activation des comptes restaurants
- ✅ Modération des profils et menus

### Gestion des Utilisateurs
- ✅ Liste des utilisateurs clients
- ✅ Consultation des profils utilisateurs
- ✅ Gestion des comptes (activation/désactivation)
- ✅ Support et modération

### Supervision des Commandes
- ✅ Vue globale de toutes les commandes
- ✅ Monitoring temps réel des statuts
- ✅ Intervention en cas de problème
- ✅ Analytics avancées des commandes

### Analytics et Statistiques
- ✅ Rapports détaillés de performance
- ✅ Tendances et insights business
- ✅ Métriques financières
- ✅ Export de données

---

## Prérequis Techniques

### Architecture Admin Spécifique
- **Backend** : Quarkus lancé depuis IntelliJ IDEA
- **Frontend** : React intégré via Quinoa dans Quarkus
- **URL Admin** : `http://localhost:8080/admin`
- **Base de données** : PostgreSQL Docker avec données complètes

### Services à vérifier avant tests
```bash
# 1. Base de données avec données complètes
docker-compose -f docker-compose.dev.yml up -d

# 2. Vérifier Quarkus en mode dev (depuis IntelliJ)
http://localhost:8080/q/health

# 3. Vérifier dashboard admin accessible
http://localhost:8080/admin
```

### Données de test
- **Administrateur** : `admin@oneeats.com` / `adminpass123`
- **Restaurants** : Plusieurs restaurants avec statuts variés
- **Utilisateurs** : Base d'utilisateurs clients diversifiée
- **Commandes** : Historique complet de commandes

---

## Plan de Tests Détaillé

### Test 0 : Connexion Dashboard Admin**

**Objectif** : Vérifier l'accès au dashboard administrateur

**Étapes** :
1. 🌐 Accéder à `http://localhost:8080/login`
2. 📝 Saisir les identifiants admin : `admin@oneeats.com` / `adminpass123`
3. 🔑 Cliquer sur "Se connecter"
4. ↩️ Vérifier la redirection vers `/admin`

**Vérifications** :
- ✅ Connexion admin réussie sans erreur
- ✅ Interface admin visible avec menu de navigation complet
- ✅ Header avec nom et rôle administrateur
- ✅ Toutes les sections admin accessibles depuis le menu

---

### Test 1 : Tableau de Bord Principal**

#### **Test 1.1 : Vue d'Ensemble et KPIs**
**Objectif** : Vérifier l'affichage des métriques principales

**Étapes** :
1. 🏠 Accéder au dashboard principal `/admin`
2. 👀 Observer les cartes de métriques principales
3. 📊 Vérifier les graphiques temps réel
4. 🔄 Tester le rafraîchissement automatique

**Vérifications** :
- ✅ KPIs affichés : nombre restaurants, utilisateurs, commandes du jour
- ✅ Métriques financières : revenus, commande moyenne
- ✅ Graphiques interactifs fonctionnels (BarChart, LineChart)
- ✅ Mise à jour temps réel des données
- ✅ Indicateurs de tendance (hausse/baisse) visibles

#### **Test 1.2 : Alertes et Notifications**
**Objectif** : Système d'alertes administrateur

**Étapes** :
1. 🚨 Identifier les alertes actives (restaurants fermés, commandes en attente)
2. 👀 Consulter les notifications importantes
3. ✅ Marquer des alertes comme traitées
4. 🔔 Tester les notifications temps réel

**Vérifications** :
- ✅ Alertes restaurants inactifs visibles
- ✅ Notifications commandes en attente affichées
- ✅ Compteurs d'alertes mis à jour
- ✅ Actions rapides disponibles depuis le dashboard
- ✅ Badges de statut colorés et explicites

#### **Test 1.3 : Filtres et Périodes**
**Objectif** : Filtrage des données par période

**Étapes** :
1. 📅 Changer la période d'affichage (aujourd'hui → semaine → mois)
2. 📊 Observer la mise à jour des graphiques
3. 🔍 Utiliser les filtres disponibles
4. 📈 Vérifier la cohérence des données

**Vérifications** :
- ✅ Filtres temporels fonctionnent (today, week, month)
- ✅ Graphiques se mettent à jour automatiquement
- ✅ Données cohérentes entre les différentes vues
- ✅ Performance acceptable lors des changements
- ✅ Indicateurs de chargement durant les transitions

---

### Test 2 : Gestion des Restaurants**

#### **Test 2.1 : Liste des Restaurants**
**Objectif** : Consultation de tous les restaurants partenaires

**Étapes** :
1. 🌐 Naviguer vers `/admin/restaurants`
2. 📋 Observer la liste complète des restaurants
3. 🔍 Tester la recherche par nom
4. 🏷️ Tester les filtres par statut (actif/inactif, ouvert/fermé)

**Vérifications** :
- ✅ Tous les restaurants affichés avec informations clés
- ✅ Statuts visuels clairs (badges colorés)
- ✅ Recherche fonctionne sur noms et descriptions
- ✅ Filtres appliquent correctement
- ✅ Pagination si nombreux restaurants

#### **Test 2.2 : Détails et Modération Restaurant**
**Objectif** : Consultation et modération d'un restaurant

**Étapes** :
1. 👆 Cliquer sur "Détails" d'un restaurant (ex: Pizza Palace)
2. 📋 Consulter les informations complètes
3. 🍽️ Vérifier la liste des menus associés
4. 📊 Observer les statistiques du restaurant

**Vérifications** :
- ✅ Informations détaillées complètes
- ✅ Menu du restaurant accessible et consultable
- ✅ Statistiques spécifiques au restaurant
- ✅ Historique des commandes visible
- ✅ Actions administrateur disponibles

#### **Test 2.3 : Actions Administratives**
**Objectif** : Gérer les restaurants (activation/suspension)

**Étapes** :
1. ⚠️ Suspendre temporairement un restaurant de test
2. ✅ Vérifier le changement de statut immédiat
3. 🔄 Réactiver le restaurant
4. 📝 Ajouter une note administrative

**Vérifications** :
- ✅ Suspension appliquée immédiatement
- ✅ Restaurant marqué comme inactif
- ✅ Réactivation fonctionne correctement
- ✅ Notes administratives sauvegardées
- ✅ Historique des actions conservé

---

### Test 3 : Gestion des Utilisateurs**

#### **Test 3.1 : Liste des Utilisateurs**
**Objectif** : Consultation de la base utilisateurs

**Étapes** :
1. 🌐 Naviguer vers `/admin/users`
2. 👥 Observer la liste des utilisateurs clients
3. 🔍 Rechercher un utilisateur spécifique
4. 🏷️ Filtrer par statut (actif/inactif)

**Vérifications** :
- ✅ Liste utilisateurs avec informations essentielles
- ✅ Données personnelles masquées appropriément
- ✅ Recherche par email ou nom fonctionne
- ✅ Statuts utilisateurs visibles
- ✅ Informations de dernière connexion

#### **Test 3.2 : Profil Utilisateur Détaillé**
**Objectif** : Consultation d'un profil utilisateur

**Étapes** :
1. 👆 Cliquer sur "Voir profil" d'un utilisateur
2. 📋 Consulter les informations complètes
3. 📊 Vérifier l'historique des commandes
4. 🔍 Observer les statistiques utilisateur

**Vérifications** :
- ✅ Profil complet accessible (respectant la confidentialité)
- ✅ Historique des commandes détaillé
- ✅ Statistiques utilisateur (nombre commandes, montant total)
- ✅ Informations de contact si nécessaire
- ✅ Aucune donnée sensible exposée

#### **Test 3.3 : Modération Utilisateur**
**Objectif** : Actions de modération sur un utilisateur

**Étapes** :
1. ⚠️ Suspendre temporairement un compte de test
2. 📝 Ajouter une raison de suspension
3. ✅ Vérifier l'application immédiate
4. 🔄 Réactiver le compte utilisateur

**Vérifications** :
- ✅ Suspension utilisateur appliquée
- ✅ Raison de suspension enregistrée
- ✅ Utilisateur ne peut plus se connecter (si implémenté)
- ✅ Réactivation fonctionne correctement
- ✅ Log des actions administratives

---

### Test 4 : Supervision des Commandes**

#### **Test 4.1 : Vue Globale des Commandes**
**Objectif** : Monitoring de toutes les commandes

**Étapes** :
1. 🌐 Naviguer vers `/admin/orders`
2. 📋 Observer la liste globale des commandes
3. 🔍 Filtrer par statut et période
4. 🏪 Filtrer par restaurant

**Vérifications** :
- ✅ Toutes les commandes visibles toutes restaurants confondus
- ✅ Informations essentielles affichées (client, restaurant, statut)
- ✅ Filtres multiples fonctionnent correctement
- ✅ Temps réel ou actualisation fréquente
- ✅ Performance acceptable avec grand volume

#### **Test 4.2 : Détails Commande Administrateur**
**Objectif** : Vue détaillée administrative d'une commande

**Étapes** :
1. 👆 Cliquer sur "Détails" d'une commande
2. 📋 Consulter toutes les informations
3. 👥 Voir les détails client et restaurant
4. 📊 Vérifier les métriques de traitement

**Vérifications** :
- ✅ Détails complets commande accessibles
- ✅ Informations client et restaurant visibles
- ✅ Historique des changements de statut
- ✅ Temps de traitement et métriques
- ✅ Actions administratives disponibles si nécessaire

#### **Test 4.3 : Intervention Administrative**
**Objectif** : Intervention admin sur une commande problématique

**Étapes** :
1. 🚨 Identifier une commande avec problème potentiel
2. 📞 Contacter le restaurant (simulation)
3. 📝 Ajouter des notes administratives
4. 🔄 Forcer un changement de statut si nécessaire

**Vérifications** :
- ✅ Commandes problématiques identifiables
- ✅ Outils de communication disponibles
- ✅ Notes administratives sauvegardées
- ✅ Actions d'urgence possibles
- ✅ Traçabilité des interventions

---

### Test 5 : Analytics et Statistiques**

#### **Test 5.1 : Page Analytics Détaillée**
**Objectif** : Consultation des statistiques avancées

**Étapes** :
1. 🌐 Naviguer vers `/admin/stats`
2. 📊 Explorer les différents graphiques
3. 📅 Changer les périodes d'analyse
4. 🔍 Utiliser les filtres avancés

**Vérifications** :
- ✅ Page analytics complète et fonctionnelle
- ✅ Graphiques interactifs (Recharts)
- ✅ Métriques business importantes
- ✅ Comparaisons périodes précédentes
- ✅ Performance graphiques acceptable

#### **Test 5.2 : KPIs et Métriques Business**
**Objectif** : Vérifier les indicateurs clés

**Étapes** :
1. 💰 Vérifier les métriques financières
2. 📈 Observer les tendances de croissance
3. 🏪 Analyser la performance des restaurants
4. 👥 Consulter les statistiques utilisateurs

**Vérifications** :
- ✅ Revenus totaux et par période calculés correctement
- ✅ Nombre de commandes et évolution
- ✅ Restaurants les plus performants identifiés
- ✅ Taux de rétention et nouveaux utilisateurs
- ✅ Données cohérentes avec la base

#### **Test 5.3 : Export et Rapports**
**Objectif** : Génération de rapports

**Étapes** :
1. 📊 Générer un rapport mensuel
2. 💾 Exporter des données CSV/Excel (si disponible)
3. 🖨️ Créer un rapport PDF (si implémenté)
4. 📧 Envoyer un rapport par email (si disponible)

**Vérifications** :
- ✅ Génération de rapports fonctionne
- ✅ Formats d'export multiples disponibles
- ✅ Données exportées complètes et correctes
- ✅ Envoi automatique si implémenté
- ✅ Historique des rapports générés

---

### Test 6 : Fonctionnalités Système**

#### **Test 6.1 : Monitoring Technique**
**Objectif** : Supervision technique de la plateforme

**Étapes** :
1. 🖥️ Consulter les métriques serveur (si disponible)
2. 🗄️ Vérifier l'état de la base de données
3. 📡 Observer les performances API
4. 🔒 Consulter les logs de sécurité

**Vérifications** :
- ✅ Métriques système disponibles
- ✅ État des services visible
- ✅ Performances API monitées
- ✅ Logs accessibles aux admins
- ✅ Alertes techniques si nécessaire

#### **Test 6.2 : Gestion des Paramètres**
**Objectif** : Configuration plateforme

**Étapes** :
1. ⚙️ Accéder aux paramètres généraux
2. 🎛️ Modifier des configurations système
3. 🔄 Appliquer les changements
4. ✅ Vérifier la prise en compte

**Vérifications** :
- ✅ Interface de configuration accessible
- ✅ Paramètres modifiables par admin
- ✅ Changements appliqués immédiatement
- ✅ Validation des paramètres
- ✅ Sauvegarde configuration

---

## Tests de Régression Admin

### Test R1 : Performance Dashboard**
- ✅ Chargement rapide avec grandes quantités de données
- ✅ Graphiques fluides même avec historique important
- ✅ Recherches et filtres performants

### **🔍 Test R2 : Sécurité et Permissions**
- ✅ Accès admin uniquement avec role approprié
- ✅ Aucune donnée sensible exposée inappropriément
- ✅ Actions critiques nécessitent confirmation

### **🔍 Test R3 : Intégrité des Données**
- ✅ Modifications admin répercutées correctement
- ✅ Synchronisation temps réel fonctionne
- ✅ Cohérence entre dashboard admin et restaurant

---

## Critères de Validation Admin

### **✅ Critères de Succès**
- Tous les KPIs et métriques s'affichent correctement
- Gestion restaurants et utilisateurs complète
- Supervision commandes en temps réel fonctionnelle
- Analytics détaillées et exports disponibles
- Interface fluide et performante
- Sécurité et permissions respectées

### **❌ Critères d'Échec**
- Métriques incorrectes ou manquantes
- Impossibilité de gérer restaurants/utilisateurs
- Données temps réel non synchronisées
- Interface lente ou non responsive
- Failles de sécurité ou permissions
- Perte de données lors des actions admin

---

## Environnement de Test Admin

### **Configuration Requise**
- ✅ Quarkus en mode dev depuis IntelliJ IDEA
- ✅ PostgreSQL Docker avec données complètes
- ✅ Compte administrateur : `admin@oneeats.com` / `adminpass123`
- ✅ URL admin : `http://localhost:8080/admin`

### **Données de Test Complètes**
- 🏪 **5+ restaurants** avec statuts variés
- 👥 **20+ utilisateurs** avec historiques
- 📋 **50+ commandes** avec tous les statuts
- 📊 **Données statistiques** sur plusieurs mois

### **Navigateurs Admin**
- 🌐 Chrome/Chromium (recommandé pour performance)
- 🦊 Firefox (test compatibilité)
- 💻 Résolution min 1366x768 pour interface complète

---

**🎯 Ce plan couvre tous les aspects critiques du dashboard administrateur OneEats, depuis la supervision générale jusqu'aux fonctionnalités avancées d'analytics et de gestion, garantissant un contrôle complet de la plateforme.**