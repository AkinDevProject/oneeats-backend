# OneEats Mobile - Documentation Technique

Documentation technique consolidée pour l'application mobile React Native/Expo.

---

## Configuration et Structure

### Navigation (Expo Router)
Configuration complete avec navigation drawer, tabs et stack navigation.

**Fichiers principaux :**
- `app/_layout.tsx` : Layout racine avec providers
- `app/(drawer)/_layout.tsx` : Navigation drawer principale
- `app/(drawer)/(tabs)/_layout.tsx` : Navigation tabs inférieure

### Système de Thèmes
Thème adaptatif avec support mode sombre/clair.

**Composants :**
- `ThemeContext` : Gestion globale du thème
- `useTheme()` : Hook pour accéder aux couleurs et styles
- Variables CSS personnalisées pour cohérence

### Actions Utilisateur
Interface complète pour toutes les interactions utilisateur :

**Fonctionnalités :**
- Recherche restaurants avec filtres
- Gestion panier (ajout, modification, suppression)
- Passage de commandes avec suivi
- Gestion profil utilisateur
- Système de favoris restaurants
- Notifications push intégrées

---

## Corrections et Améliorations

### Corrections de Titres
Uniformisation des titres de navigation pour cohérence UX :
- Titres français cohérents
- Hiérarchie visuelle claire
- Navigation intuitive

### Optimisations Performance
Implémentation d'optimisations avancées :
- Hooks de monitoring performance
- Composants mémorisés pour listes
- Images optimisées avec cache
- Lazy loading des composants lourds

---

## 🎨 Changements MVP

### Fonctionnalités Ajoutées
- **Paramètres avancés** : Préférences alimentaires, notifications, confidentialité
- **Push notifications** : Système complet avec templates et historique
- **Performance monitoring** : Métriques temps réel et alertes
- **Contextes optimisés** : Re-architecture pour performance

### Architecture Mobile
```
apps/mobile/
├── app/                          # Expo Router pages
│   ├── (drawer)/                # Navigation principale
│   │   ├── (tabs)/             # Navigation tabs
│   │   ├── settings/           # Paramètres utilisateur
│   │   └── profile/            # Profil utilisateur
├── components/                  # Composants réutilisables
│   ├── forms/                  # Formulaires
│   ├── lists/                  # Listes optimisées
│   └── ui/                     # Composants UI de base
├── contexts/                   # Contextes React
│   ├── AuthContext.tsx        # Authentification
│   ├── OrderContext.tsx       # Gestion commandes
│   ├── SettingsContext.tsx    # Paramètres utilisateur
│   └── PushNotificationContext.tsx # Notifications
├── hooks/                      # Hooks personnalisés
│   ├── business/              # Logique métier
│   ├── performance/           # Monitoring performance
│   └── ui/                    # Hooks UI
├── services/                   # Services API
└── utils/                     # Utilitaires
```

---

## ⚡ Optimisations Performance

### Monitoring Intelligence
```typescript
// Hooks de performance
usePerformanceMonitor()     // Monitoring global
useRenderTime()             // Temps de rendu
useInteractionTime()        // Temps interaction
useNavigationTime()         // Temps navigation
useAPITime()                // Temps API
useImageLoadTime()          // Temps chargement images
```

### Composants Optimisés
```typescript
// Composants haute performance
<OptimizedImage />          // Images avec cache et lazy loading
<VirtualizedList />         // Listes virtualisées adaptatives
<MemoizedListItem />        // Items de liste mémorisés
```

### Contextes Performants
- **AuthContext** : useCallback/useMemo pour éviter re-renders
- **OrderContext** : State management optimisé
- **SettingsContext** : Persistance AsyncStorage efficace

---

## Système de Notifications

### Configuration Push
```json
// app.json - Configuration Expo
{
  "plugins": [
    [
      "expo-notifications",
      {
        "icon": "./assets/notification-icon.png",
        "sounds": ["./assets/notification-sound.wav"]
      }
    ]
  ]
}
```

### Templates Notifications
- **Commandes** : Confirmé, préparation, prêt, terminé, annulé
- **Promotions** : Offres spéciales restaurants
- **Recommandations** : Suggestions personnalisées

### Fonctionnalités Avancées
- Permissions automatiques iOS/Android
- Canaux Android spécialisés
- Navigation automatique vers détails
- Historique et statistiques
- Mode arrière-plan

---

## 🔒 Paramètres Utilisateur

### Sections Disponibles
- **🔔 Notifications Push** : Types, son, vibration
- **🥗 Préférences Alimentaires** : Végétarien, végétalien, allergènes
- **🔒 Confidentialité** : Localisation, données, marketing
- **👤 Compte** : Mot de passe, email, suppression
- **⚙️ Application** : Langue, devise, thème
- **ℹ️ À Propos** : Version, CGU, support

### Hooks Utilitaires
```typescript
useActiveDietaryPreferences()    // Préférences actives
useCheckDietaryCompatibility()   // Vérification compatibilité
useExportSettings()              // Export paramètres
useResetSettings()               // Réinitialisation
```

---

## Métriques et Performance

### Store Global Performance
```typescript
interface PerformanceMetric {
  type: 'render' | 'interaction' | 'navigation' | 'api' | 'image';
  duration: number;
  component?: string;
  timestamp: number;
}
```

### Alertes Développement
- Render > 16ms
- Interaction > 100ms
- Navigation > 500ms
- API > 2s

### Stratégies Adaptatives
- Choix automatique composant liste selon taille données
- Optimisation callbacks coûteux
- Cache mémoire intelligent

---

## État Actuel

### Fonctionnalités Complètes
- Navigation Expo Router complète
- Système de thèmes adaptatif
- Paramètres utilisateur avancés
- Push notifications intégrées
- Optimisations performance
- Monitoring métriques temps réel

### À Compléter
- Intégration APIs backend réelles
- Authentification utilisateur
- Tests automatisés
- Optimisations supplémentaires selon usage

### Technologies Utilisées
- **Framework** : React Native + Expo 53
- **Navigation** : Expo Router 5.1
- **State** : TanStack React Query + AsyncStorage
- **UI** : React Native Paper + expo-linear-gradient
- **Animations** : React Native Reanimated
- **Validation** : Formik + Yup
- **Notifications** : expo-notifications
- **Performance** : React.memo, useCallback, useMemo

L'application mobile offre maintenant une expérience utilisateur fluide avec monitoring de performance en temps réel et fonctionnalités avancées complètes.