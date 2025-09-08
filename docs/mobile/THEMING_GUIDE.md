# 🎨 Système de Thème Global OneEats

Le système de thème global de OneEats permet d'appliquer des thèmes cohérents sur toute l'application mobile avec un sélecteur de couleurs dynamique.

## 📁 Structure du Système

```
src/
├── contexts/
│   └── ThemeContext.tsx          # Contexte global des thèmes
├── components/
│   ├── ThemeSelector.tsx         # Sélecteur de thèmes réutilisable
│   ├── ThemedScreen.tsx          # Écran avec thème automatique
│   └── ThemedText.tsx            # Texte avec typographie thématisée
└── hooks/
    └── useThemedStyles.ts        # Hooks pour styles dynamiques
```

## 🚀 Utilisation

### 1. Hook Principal
```tsx
import { useAppTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const { currentTheme, selectedTheme, setSelectedTheme } = useAppTheme();
  
  return (
    <View style={{ backgroundColor: currentTheme.colors.surface }}>
      <Text style={{ color: currentTheme.colors.onSurface }}>
        Thème actuel : {selectedTheme}
      </Text>
    </View>
  );
}
```

### 2. Composants Prêts à l'Emploi

#### ThemedScreen
```tsx
import { ThemedScreen } from '../components/ThemedScreen';

export default function MyScreen() {
  return (
    <ThemedScreen statusBarStyle="light">
      {/* Votre contenu */}
    </ThemedScreen>
  );
}
```

#### ThemedText  
```tsx
import { ThemedText } from '../components/ThemedText';

<ThemedText variant="headlineLarge" color="primary">
  Titre Principal
</ThemedText>
<ThemedText variant="bodyMedium" color="onSurfaceVariant">
  Description
</ThemedText>
```

#### ThemeSelector
```tsx
import { ThemeSelector } from '../components/ThemeSelector';

<ThemeSelector 
  style={{ marginVertical: 16 }}
  onThemeChange={(theme) => console.log('Nouveau thème:', theme)}
/>
```

### 3. Hooks Avancés

#### useThemedStyles
```tsx
import { useThemedStyles } from '../hooks/useThemedStyles';

const MyComponent = () => {
  const styles = useThemedStyles(({ theme }) => ({
    container: {
      backgroundColor: theme.colors.surface,
      padding: 16,
    },
    title: {
      color: theme.colors.onSurface,
      fontSize: 18,
      fontWeight: 'bold',
    },
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mon titre</Text>
    </View>
  );
};
```

#### useThemeColors
```tsx
import { useThemeColors } from '../hooks/useThemedStyles';

const MyComponent = () => {
  const colors = useThemeColors();
  
  return (
    <View style={{ backgroundColor: colors.surface }}>
      <Text style={{ color: colors.onSurface }}>Texte</Text>
    </View>
  );
};
```

## 🎨 Thèmes Disponibles

1. **🟣 original** - Material You (thème d'origine)
2. **🔴 foodClassic** - Rouge Appétissant
3. **🟠 freshVibrant** - Orange Énergique  
4. **🟢 healthyChoice** - Vert Naturel
5. **🟡 sunnyDelight** - Jaune Gourmand
6. **🟣 premiumTouch** - Violet Moderne
7. **🔵 trustQuality** - Bleu Confiance
8. **🌊 tropicalFresh** - Turquoise Tropical
9. **❤️ vibrantRed** - Rouge Vif
10. **🔥 brightOrange** - Orange Vif
11. **🍿 mcdonaldsFrance** - Vert McDonald's

## 🛠️ Personnalisation

### Ajouter un Nouveau Thème

1. **Étendre les couleurs dans ThemeContext.tsx :**
```tsx
const colorThemes = {
  // ... thèmes existants
  
  monNouveauTheme: {
    primary: '#FF0000',
    primaryContainer: '#FFCCCC',
    // ... autres couleurs
  },
};
```

2. **Ajouter les métadonnées :**
```tsx
const themeMetadata = {
  // ... métadonnées existantes
  
  monNouveauTheme: { 
    name: 'Mon Thème', 
    emoji: '🎨', 
    description: 'Description' 
  },
};
```

### Couleurs du Thème Material 3

Chaque thème inclut toutes les couleurs Material Design 3 :

- **Primary** : Couleur principale de l'app
- **PrimaryContainer** : Version claire de la couleur principale  
- **Secondary** : Couleur secondaire
- **SecondaryContainer** : Version claire de la couleur secondaire
- **Surface** : Arrière-plan des cartes et composants
- **SurfaceVariant** : Variation de surface
- **Background** : Arrière-plan principal de l'app
- **Error** : Couleur d'erreur
- **OnPrimary/OnSurface/etc.** : Couleurs de texte sur les fonds correspondants

## 💾 Persistance

Les thèmes sélectionnés sont automatiquement sauvegardés dans `AsyncStorage` et restaurés au démarrage de l'application.

## 🧪 Exemples d'Intégration

### React Native Paper
```tsx
// Dans _layout.tsx, le PaperProvider utilise automatiquement le thème
<PaperProvider theme={currentTheme} key={selectedTheme}>
  {/* Tous les composants Paper héritent du thème */}
  <Button mode="contained">Bouton thématisé</Button>
  <Card>
    <Card.Content>
      <Title>Titre de carte</Title>
    </Card.Content>
  </Card>
</PaperProvider>
```

### Composants Natifs
```tsx
// Appliquer manuellement les couleurs du thème
const { currentTheme } = useAppTheme();

<ScrollView 
  style={{ backgroundColor: currentTheme.colors.background }}
  refreshControl={
    <RefreshControl 
      colors={[currentTheme.colors.primary]}
      tintColor={currentTheme.colors.primary}
    />
  }
>
  {/* Contenu */}
</ScrollView>
```

## ✨ Fonctionnalités

- ✅ **11 thèmes prédéfinis** avec palettes complètes
- ✅ **Persistance automatique** du thème sélectionné
- ✅ **Composants prêts à l'emploi** (ThemedScreen, ThemedText, ThemeSelector)
- ✅ **Hooks utilitaires** pour styles dynamiques
- ✅ **Integration React Native Paper** complète
- ✅ **Feedback haptique** lors des changements de thème
- ✅ **Synchronisation globale** - un seul sélecteur met à jour toute l'app
- ✅ **TypeScript complet** avec types stricts

## 🔧 Configuration Avancée

Pour forcer un re-render complet lors du changement de thème (recommandé pour React Native Paper), utilisez une `key` sur le PaperProvider :

```tsx
<PaperProvider theme={currentTheme} key={selectedTheme}>
  {/* Contenu */}
</PaperProvider>
```

Cette technique garantit que tous les composants Paper se mettent à jour correctement avec les nouvelles couleurs.