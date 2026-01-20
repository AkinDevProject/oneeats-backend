# Configuration Navigation - OneEats Mobile

## Stratégie recommandée implémentée

### SANS barre de navigation
- **Pages principales (tabs)** → Navigation par onglets
- **Pages fullscreen** → Expérience immersive
- **Pages d'auth** → Focus sur l'action

### AVEC barre de navigation
- **Pages de détail** → Retour facile + contexte
- **Pages modales** → Action claire

## Configuration actuelle

### **Pages SANS barre (`headerShown: false`)**

#### **Onglets principaux :**
```tsx
// (tabs)/_layout.tsx
headerShown: false,
```
- ✅ `(tabs)/index` - Accueil avec navigation custom
- ✅ `(tabs)/cart` - Panier avec header custom  
- ✅ `(tabs)/profile` - Profil avec navigation tabs

#### **Pages système :**
```tsx
// _layout.tsx
<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
<Stack.Screen name="auth/index" options={{ headerShown: false }} />
<Stack.Screen name="designs" options={{ headerShown: false }} />
```
- ✅ `auth/login` - Page de connexion fullscreen
- ✅ `designs/*` - Sélection de design
- ✅ `+not-found` - Page 404

### **Pages AVEC barre (configuration individuelle)**

#### **Pages de détail :**
```tsx
// Configuration Stack.Screen dans chaque page
<Stack.Screen 
  options={{
    title: dynamicTitle,
    headerStyle: { backgroundColor: currentTheme.colors.surface },
    headerTitleStyle: { 
      color: currentTheme.colors.onSurface,
      fontWeight: '600'
    },
    headerBackTitle: backTitle,
    headerTintColor: currentTheme.colors.onSurface,
  }} 
/>
```

- ✅ **`restaurant/[id]`** : "Pizza Palace" ← "Restaurants"
- ✅ **`menu/[id]`** : "Pizza Margherita" ← "Pizza Palace"  
- ✅ **`order/[id]`** : "Commande #1234" ← "Mes commandes"

## 🎨 **Rendu visuel**

### **Navigation par onglets (SANS barre) :**
```
┌─────────────────────┐
│                     │ ← Pas de barre
│  🏠 OneEats         │
│                     │
│  [Liste restaurants]│
│                     │
├─────────────────────┤
│ 🏠  📋  🛒  👤     │ ← Onglets
└─────────────────────┘
```

### **Pages de détail (AVEC barre) :**
```
┌─────────────────────┐
│ ←  Pizza Palace     │ ← Barre de navigation
├─────────────────────┤
│                     │
│  [Header restaurant]│
│  [Menu items]       │
│                     │
└─────────────────────┘
```

## Avantages de cette approche

### UX optimale
- **Navigation intuitive** : Tabs pour navigation principale
- **Retour facile** : Barre sur pages de détail
- **Immersion** : Pas de barre sur pages principales

### Cohérence thème
- **Couleurs OneEats** : Turquoise cohérent
- **Typographie** : Font-weight 600 professionnel
- **Espacement** : Padding harmonieux

### Titres professionnels
- **Dynamiques** : "Pizza Margherita" au lieu de "menu/[id]"
- **Contextuels** : Breadcrumb intelligent
- **Cohérents** : Style uniforme

## Checklist validation

- ✅ Pages tabs SANS barre (navigation onglets)
- ✅ Pages auth SANS barre (focus connexion) 
- ✅ Pages détail AVEC barre (retour facile)
- ✅ Titres dynamiques professionnels
- ✅ Thème OneEats cohérent
- ✅ Breadcrumb intelligent

## Résultat final

**Navigation moderne et intuitive :**
- **Accueil** → Onglets fluides
- **Détail restaurant** → "Pizza Palace" avec retour
- **Détail plat** → "Pizza Margherita" avec breadcrumb
- **Commande** → "Commande #1234" avec contexte

**Fini les titres techniques "menu/[id]" !** 🎉