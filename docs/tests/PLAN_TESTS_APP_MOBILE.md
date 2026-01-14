# Plan de Tests Utilisateur - Application Mobile OneEats

## Objectif des Tests

Ce document guide les testeurs pour valider le fonctionnement complet de l'application mobile OneEats (React Native + Expo), permettant aux clients de découvrir les restaurants, consulter les menus, passer des commandes et suivre leur statut en temps réel.

---

## Périmètre de Test - Application Mobile

### Découverte Restaurants
- ✅ Liste des restaurants disponibles
- ✅ Recherche et filtres (distance, cuisine, ouvert/fermé)
- ✅ Détails restaurant (profil, horaires, avis)
- ✅ Navigation fluide et performance

### Consultation Menus  
- ✅ Affichage des menus par restaurant
- ✅ Organisation par catégories (entrées, plats, desserts)
- ✅ Détails des plats (prix, description, options diététiques)
- ✅ Images et informations complètes

### Système de Panier et Commandes
- ✅ Ajout/suppression d'articles au panier
- ✅ Gestion des quantités
- ✅ Passage de commande avec instructions spéciales
- ✅ Suivi des commandes en temps réel

### Profil Utilisateur et Paramètres
- ✅ Authentification et gestion de compte
- ✅ Paramètres avancés (notifications, préférences alimentaires)
- ✅ Historique des commandes
- ✅ Système de notifications push

### Fonctionnalités Spécifiques Mobile
- ✅ Navigation Expo Router
- ✅ Thème sombre/clair
- ✅ Notifications push Expo
- ✅ Optimisations de performance
- ✅ Design responsive et Material Design 3

---

## Prérequis Techniques

### Architecture Mobile Spécifique
- **Backend** : API OneEats sur `http://192.168.1.36:8080/api`
- **Frontend** : React Native + Expo 53 + Expo Router
- **Platform** : iOS Simulator / Android Emulator / Device physique
- **Node** : Version 20+ avec Expo CLI

### Services à vérifier avant tests
```bash
# 1. Backend API accessible depuis mobile
curl http://192.168.1.36:8080/api/restaurants

# 2. Application mobile démarrée
cd apps/mobile && npm start

# 3. Vérifier connexion réseau local
ping 192.168.1.36
```

### Données de test
- **API Backend** : Restaurants et menus chargés via `import-dev.sql`
- **Restaurant Test** : Pizza Palace avec menus complets
- **Utilisateur Test** : `user@test.com` / `password123`

---

## Plan de Tests Détaillé

### Test 0 : Lancement et Navigation

**Objectif** : Vérifier le démarrage et la navigation de base

**Étapes** :
1. 🚀 Lancer l'application via Expo
2. 📱 Vérifier l'écran de démarrage
3. 🧭 Tester la navigation entre les 3 onglets principaux
4. 🔄 Tester la rotation d'écran (si applicable)

**Vérifications** :
- ✅ Application se lance sans erreur
- ✅ Navigation fluide entre onglets (Restaurants, Mes Commandes, Mon Compte)
- ✅ Badges de notification visibles sur les onglets
- ✅ Interface responsive et adaptée à la taille d'écran

---

### Test 1 : Découverte des Restaurants

#### **Test 1.1 : Liste des Restaurants**
**Objectif** : Affichage et interaction avec la liste des restaurants

**Étapes** :
1. 🏠 Aller sur l'onglet "Restaurants" (accueil)
2. 👀 Observer la liste des restaurants chargée
3. 🔄 Tester le scroll et le lazy loading
4. ⚡ Vérifier les performances avec le monitoring

**Vérifications** :
- ✅ Liste des restaurants s'affiche rapidement
- ✅ Cartes restaurants avec images, noms, descriptions
- ✅ Indicateurs ouvert/fermé visibles
- ✅ Temps de render < 16ms (monitoring performance)
- ✅ Images optimisées se chargent progressivement

#### **Test 1.2 : Recherche et Filtres**
**Objectif** : Fonctionnalités de recherche et filtrage

**Étapes** :
1. 🔍 Utiliser la barre de recherche avec "Pizza"
2. 🏷️ Tester les filtres par cuisine (si disponible)
3. 📍 Tester le filtre par distance/ouvert
4. ❌ Effacer les filtres et vérifier le retour

**Vérifications** :
- ✅ Recherche fonctionne sur noms et descriptions
- ✅ Filtres s'appliquent immédiatement
- ✅ Résultats pertinents affichés
- ✅ Performance maintained durant la recherche

#### **Test 1.3 : Détails Restaurant**
**Objectif** : Consultation du profil détaillé d'un restaurant

**Étapes** :
1. 👆 Taper sur une carte restaurant (ex: Pizza Palace)
2. 📋 Observer les informations détaillées
3. ⏰ Vérifier les horaires d'ouverture
4. 🍽️ Accéder au menu depuis le profil

**Vérifications** :
- ✅ Navigation vers `/restaurant/[id]` fonctionne
- ✅ Informations complètes affichées (nom, description, adresse)
- ✅ Horaires d'ouverture corrects et formatés
- ✅ Bouton "Voir le menu" fonctionnel

---

### Test 2 : Consultation des Menus

#### **Test 2.1 : Affichage du Menu**
**Objectif** : Consultation du menu d'un restaurant

**Étapes** :
1. 🍽️ Accéder au menu de Pizza Palace (`/menu/1`)
2. 📋 Observer l'organisation par catégories
3. 🏷️ Tester les filtres par catégorie
4. 🔍 Utiliser la recherche dans le menu

**Vérifications** :
- ✅ Menu s'affiche avec toutes les catégories
- ✅ Plats organisés correctement (entrées, plats, desserts)
- ✅ Prix et descriptions visibles
- ✅ Images des plats chargées (OptimizedImage)
- ✅ Badges diététiques (végétarien, etc.) affichés

#### **Test 2.2 : Détails des Plats**
**Objectif** : Consultation détaillée d'un plat

**Étapes** :
1. 👆 Taper sur un plat (ex: Pizza Margherita)
2. 📋 Consulter les détails complets
3. 🥗 Vérifier les options diététiques
4. 💰 Vérifier le prix et la disponibilité

**Vérifications** :
- ✅ Modal ou page de détail s'ouvre
- ✅ Description complète visible
- ✅ Options diététaires affichées clairement
- ✅ Prix formaté correctement
- ✅ Statut disponible/indisponible visible

---

### Test 3 : Système de Panier et Commandes

#### **Test 3.1 : Ajout au Panier**
**Objectif** : Ajouter des articles au panier

**Étapes** :
1. 🍽️ Depuis un menu, ajouter 2 Pizza Margherita
2. 🥗 Ajouter 1 Salade César
3. 🛒 Vérifier l'onglet "Mes Commandes"
4. 🔢 Vérifier les badges de quantité

**Vérifications** :
- ✅ Articles s'ajoutent au panier (CartContext)
- ✅ Badge de quantité mis à jour sur l'onglet
- ✅ Animation d'ajout fluide
- ✅ Persistance des données (AsyncStorage)
- ✅ Total calculé correctement

#### **Test 3.2 : Gestion du Panier**
**Objectif** : Modifier le contenu du panier

**Étapes** :
1. 🛒 Aller sur l'onglet "Mes Commandes"
2. ➕ Augmenter la quantité d'un article
3. ➖ Diminuer la quantité d'un article
4. 🗑️ Supprimer un article complètement
5. 💰 Vérifier les totaux mis à jour

**Vérifications** :
- ✅ Quantités modifiables avec + et -
- ✅ Totaux recalculés automatiquement
- ✅ Suppression d'articles fonctionne
- ✅ Panier vide géré correctement
- ✅ Interface réactive et fluide

#### **Test 3.3 : Passage de Commande**
**Objectif** : Finaliser et passer une commande

**Étapes** :
1. 🛒 Depuis un panier rempli, cliquer "Commander"
2. 📝 Ajouter des instructions spéciales (optionnel)
3. ✅ Confirmer la commande
4. 📱 Vérifier la création de la commande

**Vérifications** :
- ✅ Formulaire de commande s'affiche
- ✅ Récapitulatif complet visible
- ✅ Instructions spéciales enregistrées
- ✅ Commande créée avec succès (API)
- ✅ Redirection vers le suivi de commande

#### **Test 3.4 : Suivi de Commande en Temps Réel**
**Objectif** : Suivre l'évolution d'une commande

**Étapes** :
1. 📋 Consulter une commande passée
2. 👀 Observer le statut actuel
3. 🔔 Simuler un changement de statut (via dashboard restaurant)
4. 📱 Vérifier la mise à jour temps réel

**Vérifications** :
- ✅ Statut de commande affiché clairement
- ✅ Progression visuelle (étapes, barres de progression)
- ✅ Mise à jour automatique sans refresh
- ✅ Notifications push déclenchées
- ✅ Détails commande complets accessibles

---

### Test 4 : Profil Utilisateur et Paramètres

#### **Test 4.1 : Connexion et Authentification**
**Objectif** : Système d'authentification utilisateur

**Étapes** :
1. 👤 Aller sur l'onglet "Mon Compte"
2. 🔑 Tenter une connexion avec `user@test.com` / `password123`
3. ✅ Vérifier la connexion réussie
4. 🚪 Tester la déconnexion

**Vérifications** :
- ✅ Écran de connexion accessible
- ✅ Authentification via AuthContext
- ✅ Interface utilisateur connecté affichée
- ✅ Déconnexion fonctionne correctement
- ✅ Persistance de session (AsyncStorage)

#### **Test 4.2 : Paramètres Avancés Complets**
**Objectif** : Tester le système de paramètres complet

**Étapes** :
1. ⚙️ Accéder à `/settings` depuis le profil
2. 🔔 Modifier les paramètres de notifications
3. 🥗 Configurer les préférences alimentaires
4. 🔒 Ajuster les paramètres de confidentialité
5. 🌍 Changer la langue et devise
6. 💾 Sauvegarder et vérifier la persistance

**Vérifications** :
- ✅ Interface paramètres complète accessible
- ✅ Toutes les sections fonctionnelles (notifications, alimentaires, confidentialité, app, à propos)
- ✅ Modifications sauvegardées (SettingsContext + AsyncStorage)
- ✅ Hooks utilitaires fonctionnent (`useActiveDietaryPreferences`)
- ✅ Export/Import paramètres disponible

#### **Test 4.3 : Notifications Push**
**Objectif** : Système de notifications push Expo

**Étapes** :
1. 🔔 Accéder à `/test-notifications` (page de test)
2. ✅ Autoriser les notifications push
3. 📱 Tester l'envoi de notifications
4. 🔄 Simuler différents types (commande, promo, recommandation)
5. 📊 Vérifier l'historique des notifications

**Vérifications** :
- ✅ Permissions push demandées et accordées
- ✅ Token Expo Push généré et stocké
- ✅ Templates de notifications fonctionnent
- ✅ Navigation automatique vers détails
- ✅ Badges non lues gérés correctement
- ✅ Intégration avec OrderContext pour déclenchement auto

---

### Test 5 : Fonctionnalités Spécifiques Mobile

#### **Test 5.1 : Thème et Interface**
**Objectif** : Système de thème et interface adaptative

**Étapes** :
1. 🎨 Tester le changement de thème (clair/sombre)
2. 📱 Vérifier l'adaptation sur différentes tailles d'écran
3. 🔄 Tester la rotation d'écran
4. ⚡ Vérifier les animations Reanimated

**Vérifications** :
- ✅ ThemeContext fonctionne correctement
- ✅ Interface s'adapte aux deux thèmes
- ✅ Design responsive et Material Design 3
- ✅ Animations fluides et performantes
- ✅ Navigation Expo Router stable

#### **Test 5.2 : Optimisations de Performance**
**Objectif** : Vérifier les optimisations de performance

**Étapes** :
1. ⚡ Activer le monitoring de performance
2. 🏠 Naviguer rapidement entre les écrans
3. 📊 Observer les métriques temps réel
4. 🚨 Déclencher des alertes de performance
5. 📈 Consulter le rapport détaillé

**Vérifications** :
- ✅ Hooks de monitoring fonctionnent (`usePerformanceMonitor`)
- ✅ Temps de render < 16ms
- ✅ Interactions < 100ms
- ✅ Navigation < 500ms
- ✅ Images optimisées avec cache
- ✅ VirtualizedList pour grandes listes
- ✅ Composants mémoïsés (React.memo)

---

### Test 6 : Intégration et Synchronisation

#### **Test 6.1 : Synchronisation avec Backend**
**Objectif** : Vérifier la communication avec l'API

**Étapes** :
1. 🌐 Vérifier la connexion API (`http://192.168.1.36:8080/api`)
2. 📝 Créer une commande mobile
3. 🖥️ Vérifier réception sur dashboard restaurant
4. 🔄 Tester la synchronisation bidirectionnelle

**Vérifications** :
- ✅ API calls réussissent (services/api.ts)
- ✅ Données synchronisées entre mobile et dashboard
- ✅ Gestion des erreurs réseau
- ✅ Retry automatique en cas d'échec
- ✅ Temps de réponse API < 2s

#### **Test 6.2 : Gestion Hors Ligne**
**Objectif** : Comportement en cas de perte de connexion

**Étapes** :
1. 📶 Désactiver le Wi-Fi/données mobiles
2. 📱 Tenter de naviguer dans l'app
3. 🛒 Essayer d'ajouter des articles au panier
4. 📶 Réactiver la connexion
5. 🔄 Vérifier la synchronisation automatique

**Vérifications** :
- ✅ Interface reste utilisable hors ligne
- ✅ Données cachées accessibles (AsyncStorage)
- ✅ Messages d'erreur explicites
- ✅ Synchronisation automatique au retour
- ✅ Pas de perte de données panier

---

## Tests de Régression Mobile

### Test R1 : Persistance et Mémoire**
- ✅ Fermer/rouvrir l'application
- ✅ Vérifier conservation panier et paramètres
- ✅ Test de fuite mémoire avec monitoring

### Test R2 : Performance Multi-Plateforme**
- ✅ Test sur iOS et Android
- ✅ Performance sur appareils anciens
- ✅ Adaptabilité écrans différents

### Test R3 : Gestion d'Erreurs**
- ✅ API indisponible
- ✅ Données corrompues
- ✅ Permissions refusées

---

## Critères de Validation Mobile

### Critères de Succès
- Navigation fluide avec Expo Router
- Panier et commandes fonctionnent correctement
- Notifications push délivrées et interactives
- Paramètres complets et persistants
- Performance optimale (métriques respectées)
- Interface responsive et accessible

### Critères d'Échec
- Crashes fréquents ou erreurs JS
- Lenteurs importantes (>500ms navigation)
- Notifications ne fonctionnent pas
- Perte de données panier/paramètres
- Interface cassée sur certains appareils
- API calls échouent systématiquement

---

## Environnement de Test Mobile

### **Configuration Requise**
- ✅ Node.js 20+ avec Expo CLI installé
- ✅ Backend OneEats sur `192.168.1.36:8080`
- ✅ iOS Simulator / Android Emulator ou device physique
- ✅ Connexion réseau local stable

### **Commandes de Test**
```bash
# Lancer l'app mobile
cd apps/mobile && npm start

# Tests spécifiques
npm run ios      # iOS Simulator
npm run android  # Android Emulator
npm run web      # Version web (test)
```

### **Appareils de Test**
- 📱 iPhone (iOS 15+)
- 🤖 Android (API 28+)  
- 💻 Version web (développement)
- 📱 Devices physiques divers

---

**🎯 Ce plan couvre tous les aspects critiques de l'application mobile OneEats, depuis la découverte des restaurants jusqu'aux fonctionnalités avancées de notifications et performance, en tenant compte de l'architecture React Native + Expo et des optimisations implémentées.**