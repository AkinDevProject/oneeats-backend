# Structure du Frontend Web - OneEats

## Vue d'ensemble

Cette application web frontend a été réorganisée pour améliorer la maintenabilité, la réutilisabilité et la compréhension du code. Elle suit les meilleures pratiques React/TypeScript avec une séparation claire des responsabilités.

## Structure des dossiers

### `/components` - Composants réutilisables

#### `/components/dashboard`
Composants spécifiques aux tableaux de bord :
- **DashboardHeader** : En-tête responsive avec contrôles (analytics, période, actions)
- **QuickMetrics** : Cartes de métriques KPI avec animations
- **StatusDistribution** : Affichage distribution des statuts avec graphique
- **MetricCard** : Composant de carte métrique générique réutilisable

#### `/components/ui` (existant)
Composants d'interface utilisateur de base :
- Button, Card, Input, Modal, Table, Toast, Badge

#### `/components/layouts` (existant)
Layouts de page :
- AdminLayout, RestaurantLayout

#### `/components/auth`, `/components/forms`, `/components/charts`
Dossiers préparés pour futurs composants spécialisés

### `/hooks` - Hooks personnalisés

#### `/hooks/business`
Hooks contenant la logique métier :
- **useAnalytics** : Génération et gestion des données analytics
- **useQuickMetrics** : Calcul des métriques rapides à partir des commandes

#### `/hooks/ui`, `/hooks/data` (préparés)
Dossiers pour hooks d'interface et de données

### `/utils` - Utilitaires

#### `/utils/formatters`
Fonctions de formatage centralisées :
- Formatage monétaire, dates, nombres, pourcentages
- Formatage des changements avec couleurs
- Formatage des statuts et noms

#### `/utils/calculations`, `/utils/validators` (préparés)
Dossiers pour calculs et validations

### `/services` - Services API

#### `/services/api.ts`
Service API centralisé avec méthodes organisées par domaine :
- Restaurants, MenuItems, Orders, Users, Analytics

### `/pages` - Pages de l'application

Chaque page majeure peut avoir sa propre structure avec :
- `index.tsx` - Composant principal de la page
- `/components` - Composants spécifiques à cette page
- `/hooks` - Hooks spécifiques à cette page (si nécessaire)

## Conventions de code

### Composants
- **Nom** : PascalCase pour les composants (`DashboardHeader`)
- **Documentation** : Commentaires JSDoc pour tous les composants
- **Props** : Interfaces TypeScript bien définies
- **Export** : Export par défaut pour le composant principal

### Hooks
- **Nom** : camelCase avec préfixe `use` (`useAnalytics`)
- **Retour** : Objets avec propriétés nommées explicitement
- **Dépendances** : useMemo pour optimiser les recalculs

### Utilitaires
- **Nom** : camelCase pour les fonctions (`formatCurrency`)
- **Export** : Exports nommés depuis des fichiers index
- **Types** : Interfaces pour les options complexes

## Utilisation

### Import des composants dashboard
```typescript
import { DashboardHeader, QuickMetrics } from '../../components/dashboard';
```

### Import des hooks business
```typescript
import { useAnalytics, useQuickMetrics } from '../../hooks/business';
```

### Import des formatters
```typescript
import { formatCurrency, formatDateTime } from '../../utils/formatters';
```

## Avantages de cette structure

### Maintenabilité
- Code modulaire et réutilisable
- Séparation claire des responsabilités
- Composants de 50-200 lignes maximum

### Réutilisabilité
- Composants dashboard partagés entre Admin et Restaurant
- Hooks métier centralisés
- Utilitaires formatage unifiés

### Compréhension
- Documentation complète avec JSDoc
- Noms explicites et conventions cohérentes
- Structure logique par fonctionnalité

### Performance
- Hooks avec memoization
- Composants optimisés avec React.memo (quand nécessaire)
- Imports optimisés avec tree-shaking

## Migration et évolution

### Étapes de migration réalisées
1. ✅ Création de la structure de dossiers
2. ✅ Extraction des composants réutilisables (DashboardHeader, QuickMetrics, etc.)
3. ✅ Création des hooks business (useAnalytics, useQuickMetrics)
4. ✅ Refactorisation du RestaurantDashboard
5. ✅ Ajout des utilitaires de formatage
6. ✅ Documentation et commentaires

### Étapes suivantes recommandées
1. Refactoriser AdminDashboard avec les mêmes composants
2. Extraire et refactoriser MenuPage
3. Créer les hooks UI et data
4. Ajouter les validateurs et calculateurs
5. Optimiser les performances avec React.memo

### Bonnes pratiques à suivre
- Toujours lire le code existant avant de modifier
- Utiliser les composants existants avant d'en créer de nouveaux
- Documenter tous les nouveaux composants et hooks
- Tester les changements avec les outils de lint/typecheck
- Maintenir la cohérence avec les conventions établies

## Structure finale recommandée

```
src/
├── components/           # Composants réutilisables
│   ├── dashboard/       # Composants dashboard
│   ├── ui/              # Composants UI de base
│   ├── forms/           # Composants formulaires
│   ├── charts/          # Composants graphiques
│   └── auth/            # Composants authentification
├── hooks/               # Hooks personnalisés
│   ├── business/        # Logique métier
│   ├── ui/              # État interface
│   └── data/            # Gestion données
├── utils/               # Utilitaires
│   ├── formatters/      # Formatage
│   ├── calculations/    # Calculs
│   └── validators/      # Validations
├── services/            # Services externes
├── types/               # Types TypeScript
└── pages/               # Pages application
```

Cette structure garantit une évolutivité et une maintenabilité optimales pour l'équipe de développement.