# DEV_PLAN - Application Mobile OneEats MVP

## Analyse de l'existant ✅

### Pages existantes et fonctionnelles :
- **Home (index.tsx)** : Liste des restaurants avec recherche, filtres, catégories
- **Restaurant ([id].tsx)** : Détail restaurant avec menu et ajout au panier
- **Menu Item ([id].tsx)** : Détail article avec personnalisation et options
- **Cart (cart.tsx)** : Panier complet avec onglets (panier, commandes en cours, historique)
- **Profile (profile.tsx)** : Profil utilisateur avec sections (compte, favoris, paramètres, support)
- **Order ([id].tsx)** : Suivi détaillé des commandes avec statuts
- **Auth (login.tsx)** : Authentification (connexion, inscription, invité)

### Fonctionnalités déjà implémentées :
- ✅ Navigation avec Expo Router
- ✅ Gestion des thèmes avec contexte
- ✅ Panier complet avec persistance
- ✅ Authentification multi-mode
- ✅ Contextes pour Auth, Cart, Order, Notifications, Theme
- ✅ Mock data complet (restaurants, menus, commandes)
- ✅ UI/UX professionnelle avec React Native Paper
- ✅ Animations avec Reanimated
- ✅ Gestion des favoris (UI)
- ✅ System de notifications
- ✅ Gestion des options et personnalisation des plats

---

## Développements nécessaires pour finaliser le MVP

### 1. Écran de recherche avancée
- **Description courte** : Créer une page dédiée pour la recherche avancée avec filtres détaillés et résultats optimisés.
- **Prompt à exécuter** : Créer `apps/mobile/app/search/index.tsx` avec recherche par nom de restaurant, type de cuisine, gamme de prix, note minimale, temps de livraison, et options diététiques. Inclure l'historique de recherche, suggestions automatiques et sauvegarde des filtres favoris. Intégrer avec le contexte de thème et ajouter des animations de transition.
- **Mise à jour du contexte** : Oui, documenter la nouvelle fonctionnalité de recherche dans `contexte.md`.
- **Message de commit** : "Ajouter écran de recherche avancée avec filtres et historique"

### 2. Système de favoris complet
- **Description courte** : Finaliser le système de favoris avec persistance locale et synchronisation.
- **Prompt à exécuter** : Créer `src/contexts/FavoritesContext.tsx` pour gérer l'ajout/suppression de restaurants favoris avec AsyncStorage. Mettre à jour `apps/mobile/app/(tabs)/profile.tsx` pour afficher et gérer les vrais favoris. Ajouter les boutons favoris dans `restaurant/[id].tsx` et `(tabs)/index.tsx`. Implémenter la persistance locale et les animations de cœur.
- **Mise à jour du contexte** : Oui, documenter le système de favoris dans `contexte.md`.
- **Message de commit** : "Implémenter système de favoris avec persistance locale"



### 4. Écran de géolocalisation et carte
- **Description courte** : Intégrer une carte interactive pour localiser les restaurants et calculer les distances.
- **Prompt à exécuter** : Créer `apps/mobile/app/map/index.tsx` avec intégration MapView (Expo Maps), localisation GPS, markers de restaurants, calcul de distance, et navigation GPS. Ajouter les permissions de localisation et gestion des erreurs. Créer le contexte `LocationContext.tsx` pour la géolocalisation.
- **Mise à jour du contexte** : Oui, documenter la fonctionnalité de géolocalisation dans `contexte.md`.
- **Message de commit** : "Intégrer carte interactive et géolocalisation des restaurants"



### 6. Onboarding et guide utilisateur
- **Description courte** : Créer un onboarding pour les nouveaux utilisateurs avec présentation des fonctionnalités.
- **Prompt à exécuter** : Créer `apps/mobile/app/onboarding/index.tsx` avec carrousel de présentation, permissions (localisation, notifications), création de profil guidée, et tutoriel interactif. Ajouter la logique first-launch avec AsyncStorage et navigation automatique vers onboarding ou home.
- **Mise à jour du contexte** : Oui, documenter l'onboarding dans `contexte.md`.
- **Message de commit** : "Ajouter onboarding et guide utilisateur pour premiers usages"

### 7. Système de reviews et notes
- **Description courte** : Permettre aux utilisateurs de noter et commenter les restaurants et plats.
- **Prompt à exécuter** : Créer `apps/mobile/app/review/[restaurantId].tsx` pour laisser des avis, `src/contexts/ReviewContext.tsx` pour gérer les reviews locales. Ajouter les composants de notation étoiles, commentaires, upload de photos. Intégrer dans les pages restaurant et historique des commandes. Implémenter la persistance locale des reviews.
- **Mise à jour du contexte** : Oui, documenter le système de reviews dans `contexte.md`.
- **Message de commit** : "Implémenter système de reviews et notation des restaurants"

### 8. Mode offline et cache
- **Description courte** : Implémenter un mode offline avec cache intelligent pour une utilisation sans réseau.
- **Prompt à exécuter** : Créer `src/services/CacheService.ts` pour gérer le cache des données restaurants et menus. Ajouter NetInfo pour détecter la connectivité, implémenter le cache intelligent avec expiration, et créer des indicateurs UI pour le mode offline. Mettre à jour tous les contextes pour gérer l'état offline/online.
- **Mise à jour du contexte** : Oui, documenter les capacités offline dans `contexte.md`.
- **Message de commit** : "Implémenter mode offline avec cache intelligent"

### 9. Système de partage social
- **Description courte** : Permettre le partage de restaurants et plats sur les réseaux sociaux.
- **Prompt à exécuter** : Intégrer Expo Sharing pour partager restaurants et plats, créer des liens deep links vers l'app, ajouter des boutons de partage dans les pages restaurant et menu. Créer des images de partage dynamiques avec les infos du restaurant/plat. Implémenter le système de deep linking pour ouvrir l'app via liens partagés.
- **Mise à jour du contexte** : Oui, documenter les fonctionnalités de partage dans `contexte.md`.
- **Message de commit** : "Ajouter partage social et deep linking"





### 12. Configuration de production
- **Description courte** : Préparer l'application pour le déploiement avec optimisations et configurations de production.
- **Prompt à exécuter** : Configurer les variables d'environnement, optimiser les bundles avec Metro, configurer les icônes et splash screens pour iOS/Android, préparer les configurations de build pour l'App Store et Play Store. Ajouter les métadonnées de l'app et configurer les permissions nécessaires. Créer les scripts de déploiement.
- **Mise à jour du contexte** : Oui, documenter la configuration de production dans `contexte.md`.
- **Message de commit** : "Configurer app pour déploiement production iOS/Android"

---

## Priorités de développement

### Phase 1 - Fonctionnalités Core (Urgence haute) 🔥
1. Système de favoris complet
2. Système de notifications push
3. Mode offline et cache
4. Optimisations de performance

### Phase 2 - Expérience utilisateur (Urgence moyenne) 📱
5. Écran de recherche avancée
6. Onboarding et guide utilisateur
7. Page des paramètres avancés
8. Système de reviews et notes

### Phase 3 - Fonctionnalités avancées (Urgence basse) ⭐
9. Écran de géolocalisation et carte
10. Système de partage social
11. Tests et validation
12. Configuration de production

---

## Estimation temporelle

- **Phase 1** : 2-3 jours de développement
- **Phase 2** : 2-3 jours de développement
- **Phase 3** : 2-3 jours de développement

**Total estimé** : 6-9 jours pour un MVP complet et robuste

---

## Technologies et dépendances à ajouter

### Nouvelles dépendances npm :
```bash
# Géolocalisation et cartes
expo-location
expo-maps
react-native-maps

# Notifications
expo-notifications

# Partage et deep linking
expo-sharing
expo-linking

# Cache et offline
@react-native-async-storage/async-storage (déjà présent)
@react-native-netinfo/netinfo

# Images optimisées
react-native-fast-image

# Tests
@testing-library/react-native
@testing-library/jest-native
jest
```

### Permissions à configurer :
- Location (géolocalisation)
- Notifications (push)
- Camera (reviews avec photos)

---

## État actuel : Excellent niveau de développement ✨

Votre application mobile OneEats est déjà très avancée avec :
- ✅ Architecture solide et bien structurée
- ✅ UI/UX professionnelle et moderne
- ✅ Fonctionnalités principales implémentées
- ✅ Gestion d'état avec contextes
- ✅ Navigation fluide
- ✅ Animations et interactions

**L'app est prête pour les développements finaux avant connexion backend !**
