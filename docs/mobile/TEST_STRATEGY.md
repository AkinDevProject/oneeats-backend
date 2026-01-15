# Stratégie de Tests - OneEats Mobile App

> Document de référence pour la stratégie de tests de l'application mobile OneEats.
> App React Native / Expo - MVP Testing Strategy.

---

## Table des Matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Stack Technologique](#2-stack-technologique)
3. [Pyramide de Tests](#3-pyramide-de-tests)
4. [Tests Unitaires](#4-tests-unitaires)
5. [Tests de Composants](#5-tests-de-composants)
6. [Tests d'Intégration](#6-tests-dintégration)
7. [Tests End-to-End](#7-tests-end-to-end)
8. [Structure des Fichiers](#8-structure-des-fichiers)
9. [Plan de Test MVP](#9-plan-de-test-mvp)
10. [Commandes et CI/CD](#10-commandes-et-cicd)

---

## 1. Vue d'ensemble

### Objectifs MVP
- Valider les **flows critiques** : Auth, Commande, Panier
- Assurer la **stabilité des contexts** React
- Garantir la **couverture des services** API
- Tests **automatisés** pour éviter les régressions

### Approche
- **Pragmatique** : Focus sur le ROI des tests
- **Progressive** : Commencer par les tests unitaires, puis monter
- **Maintenable** : Tests lisibles et faciles à maintenir

---

## 2. Stack Technologique

### Outils Sélectionnés

| Type | Outil | Justification |
|------|-------|---------------|
| **Unit Tests** | Jest | Standard React Native, intégré Expo |
| **Component Tests** | React Native Testing Library (RNTL) | Tests centrés utilisateur, meilleure pratique |
| **E2E Tests** | Maestro | Simple, YAML-based, idéal pour MVP |
| **Mocking** | MSW (Mock Service Worker) | Mocking API moderne et réaliste |
| **Coverage** | Jest Coverage | Intégré, rapports HTML/LCOV |

### Installation

```bash
# Dans apps/mobile/
npm install --save-dev @testing-library/react-native @testing-library/jest-native
npm install --save-dev msw

# Maestro (installation globale)
# macOS
brew install maestro
# Windows/Linux
curl -Ls "https://get.maestro.mobile.dev" | bash
```

### Configuration Jest

```javascript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    '<rootDir>/tests/setup.ts'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-paper|react-native-reanimated)'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/e2e/'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    }
  }
};
```

---

## 3. Pyramide de Tests

```
         /\
        /  \      E2E Tests (Maestro)
       / 5% \     - Flows critiques complets
      /______\
     /        \   Integration Tests
    /   15%    \  - Contexts + API
   /____________\
  /              \ Component Tests
 /      30%       \ - Écrans isolés
/__________________ \
        50%          Unit Tests
                     - Services, Utils, Hooks
```

### Répartition pour MVP

| Type | Effort | Couverture Cible |
|------|--------|------------------|
| Unit Tests | 50% | Services (80%), Utils (90%) |
| Component Tests | 30% | Écrans critiques (60%) |
| Integration Tests | 15% | Contexts (70%) |
| E2E Tests | 5% | Happy paths (3-5 flows) |

---

## 4. Tests Unitaires

### 4.1 Services API

```typescript
// tests/unit/services/api.test.ts
import apiService from '../../../src/services/api';
import { server } from '../../mocks/server';
import { rest } from 'msw';

describe('apiService', () => {
  describe('restaurants', () => {
    it('should fetch all restaurants', async () => {
      const restaurants = await apiService.restaurants.getAll();

      expect(restaurants).toBeInstanceOf(Array);
      expect(restaurants.length).toBeGreaterThan(0);
      expect(restaurants[0]).toHaveProperty('id');
      expect(restaurants[0]).toHaveProperty('name');
    });

    it('should fetch restaurant by id', async () => {
      const restaurant = await apiService.restaurants.getById('resto-1');

      expect(restaurant).toHaveProperty('id', 'resto-1');
      expect(restaurant).toHaveProperty('name');
      expect(restaurant).toHaveProperty('menuItems');
    });

    it('should handle 404 error', async () => {
      server.use(
        rest.get('*/restaurants/:id', (req, res, ctx) => {
          return res(ctx.status(404));
        })
      );

      await expect(apiService.restaurants.getById('invalid'))
        .rejects.toThrow();
    });
  });
});
```

### 4.2 Service d'Authentification

```typescript
// tests/unit/services/authService.test.ts
import authService from '../../../src/services/authService';
import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store');

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('valid-token');

      const result = await authService.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when no token', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const result = await authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('getAccessToken', () => {
    it('should refresh token if expired', async () => {
      const expiredTime = Date.now() - 1000;
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('token')
        .mockResolvedValueOnce(expiredTime.toString());

      // Mock refresh...
      const token = await authService.getAccessToken();

      expect(token).toBeDefined();
    });
  });
});
```

### 4.3 Utilitaires

```typescript
// tests/unit/utils/imageUtils.test.ts
import { buildRestaurantImageUrl, buildMenuItemImageUrl } from '../../../src/utils/imageUtils';

describe('imageUtils', () => {
  describe('buildRestaurantImageUrl', () => {
    it('should return full URL for relative path', () => {
      const result = buildRestaurantImageUrl('/images/resto.jpg');

      expect(result).toContain('http');
      expect(result).toContain('resto.jpg');
    });

    it('should return input if already full URL', () => {
      const url = 'https://example.com/image.jpg';

      expect(buildRestaurantImageUrl(url)).toBe(url);
    });

    it('should handle null/undefined', () => {
      expect(buildRestaurantImageUrl(null)).toBeDefined();
      expect(buildRestaurantImageUrl(undefined)).toBeDefined();
    });
  });
});
```

---

## 5. Tests de Composants

### 5.1 Setup Testing Library

```typescript
// tests/setup.ts
import '@testing-library/jest-native/extend-expect';
import { server } from './mocks/server';

// Mock expo modules
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' }
}));

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn()
  },
  useLocalSearchParams: () => ({}),
  Stack: { Screen: () => null }
}));

// MSW server setup
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 5.2 Test de l'écran Login

```typescript
// tests/components/LoginScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../app/auth/login';
import { AuthProvider } from '../../src/contexts/AuthContext';
import { ThemeProvider } from '../../src/contexts/ThemeContext';

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <ThemeProvider>
      <AuthProvider>
        {component}
      </AuthProvider>
    </ThemeProvider>
  );
};

describe('LoginScreen', () => {
  it('should render login button', () => {
    const { getByText } = renderWithProviders(<LoginScreen />);

    expect(getByText('Se connecter')).toBeTruthy();
  });

  it('should render social login buttons', () => {
    const { getByText } = renderWithProviders(<LoginScreen />);

    expect(getByText('Google')).toBeTruthy();
    expect(getByText('Apple')).toBeTruthy();
  });

  it('should render skip option', () => {
    const { getByText } = renderWithProviders(<LoginScreen />);

    expect(getByText('Continuer sans compte')).toBeTruthy();
  });

  it('should trigger login on button press', async () => {
    const { getByText } = renderWithProviders(<LoginScreen />);

    fireEvent.press(getByText('Se connecter'));

    // Verify loading state or navigation
    await waitFor(() => {
      // Assertions...
    });
  });
});
```

### 5.3 Test de l'écran Panier

```typescript
// tests/components/CartScreen.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CartScreen from '../../app/(tabs)/cart';
import { CartProvider } from '../../src/contexts/CartContext';

describe('CartScreen', () => {
  it('should show empty state when cart is empty', () => {
    const { getByText } = render(
      <CartProvider>
        <CartScreen />
      </CartProvider>
    );

    expect(getByText(/panier.*vide/i)).toBeTruthy();
  });

  it('should show items when cart has items', () => {
    // Pre-fill cart with test data
    const { getByText, getAllByTestId } = render(
      <CartProvider initialItems={mockCartItems}>
        <CartScreen />
      </CartProvider>
    );

    expect(getAllByTestId('cart-item').length).toBe(mockCartItems.length);
  });

  it('should update quantity on +/- press', () => {
    const { getByTestId, getByText } = render(
      <CartProvider initialItems={mockCartItems}>
        <CartScreen />
      </CartProvider>
    );

    fireEvent.press(getByTestId('increase-qty-0'));

    expect(getByText('2')).toBeTruthy(); // Quantity updated
  });
});
```

---

## 6. Tests d'Intégration

### 6.1 Test du Context Panier

```typescript
// tests/integration/CartContext.test.tsx
import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { CartProvider, useCart } from '../../src/contexts/CartContext';

const wrapper = ({ children }) => (
  <CartProvider>{children}</CartProvider>
);

describe('CartContext', () => {
  it('should start with empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.total).toBe(0);
  });

  it('should add item to cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(mockMenuItem);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].menuItem.id).toBe(mockMenuItem.id);
  });

  it('should increase quantity for existing item', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(mockMenuItem);
      result.current.addItem(mockMenuItem);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
  });

  it('should calculate total correctly', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({ ...mockMenuItem, price: 10 });
      result.current.addItem({ ...mockMenuItem2, price: 15 });
    });

    expect(result.current.total).toBe(25);
  });

  it('should clear cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(mockMenuItem);
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
  });
});
```

### 6.2 Test du Context Auth

```typescript
// tests/integration/AuthContext.test.tsx
import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-hooks';
import { AuthProvider, useAuth } from '../../src/contexts/AuthContext';

describe('AuthContext', () => {
  it('should start as not authenticated', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await waitForNextUpdate();

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('should update user after successful login', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await waitForNextUpdate();

    await act(async () => {
      await result.current.loginWithSSO();
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeDefined();
  });

  it('should clear user after logout', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await waitForNextUpdate();

    await act(async () => {
      await result.current.loginWithSSO();
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
```

---

## 7. Tests End-to-End

### 7.1 Configuration Maestro

```yaml
# .maestro/config.yaml
appId: com.oneeats.mobile
flows:
  - flows/*.yaml
```

### 7.2 Flow : Commande Complete

```yaml
# .maestro/flows/order-flow.yaml
appId: com.oneeats.mobile
name: Complete Order Flow
---
# 1. Accueil - Sélection restaurant
- launchApp
- assertVisible: "OneEats"
- tapOn:
    text: ".*Restaurant.*"
    index: 0

# 2. Menu - Ajout au panier
- assertVisible: "Notre Menu"
- tapOn:
    id: "add-to-cart-0"
- assertVisible: "Panier"

# 3. Panier - Vérification
- tapOn: "Panier"
- assertVisible: "Votre panier"
- assertVisible: "Total"

# 4. Validation (si connecté)
- tapOn: "Commander"

# 5. Vérification redirection
- assertVisible:
    text: ".*Commande.*"
    timeout: 5000
```

### 7.3 Flow : Authentification

```yaml
# .maestro/flows/auth-flow.yaml
appId: com.oneeats.mobile
name: Authentication Flow
---
# 1. Page Login
- launchApp
- tapOn: "Profil"
- assertVisible: "Se connecter"

# 2. Social Login (mock)
- tapOn: "Google"
- assertVisible:
    text: ".*loading.*|.*chargement.*"
    optional: true

# 3. Skip option
- launchApp:
    clearState: true
- tapOn: "Profil"
- tapOn: "Continuer sans compte"
- assertVisible: "Accueil"
```

### 7.4 Flow : Navigation Principale

```yaml
# .maestro/flows/navigation-flow.yaml
appId: com.oneeats.mobile
name: Main Navigation Flow
---
- launchApp

# Tab Accueil
- assertVisible: "Restaurants"

# Tab Favoris
- tapOn:
    id: "tab-favorites"
- assertVisible: "Favoris"

# Tab Panier
- tapOn:
    id: "tab-cart"
- assertVisible: "panier"

# Tab Profil
- tapOn:
    id: "tab-profile"
- assertVisible: "Profil"

# Navigation secondaire
- tapOn: "Mes commandes"
- assertVisible: "Commandes"
- tapOn:
    id: "back-button"
```

---

## 8. Structure des Fichiers

```
apps/mobile/
├── tests/
│   ├── setup.ts                    # Configuration globale
│   ├── mocks/
│   │   ├── server.ts               # MSW server
│   │   ├── handlers.ts             # API handlers
│   │   └── data/
│   │       ├── restaurants.ts
│   │       ├── menuItems.ts
│   │       └── orders.ts
│   ├── unit/
│   │   ├── services/
│   │   │   ├── api.test.ts
│   │   │   └── authService.test.ts
│   │   ├── utils/
│   │   │   └── imageUtils.test.ts
│   │   └── hooks/
│   │       └── useFavorites.test.ts
│   ├── components/
│   │   ├── LoginScreen.test.tsx
│   │   ├── CartScreen.test.tsx
│   │   ├── RestaurantScreen.test.tsx
│   │   └── OrdersScreen.test.tsx
│   └── integration/
│       ├── AuthContext.test.tsx
│       ├── CartContext.test.tsx
│       └── OrderContext.test.tsx
├── .maestro/
│   ├── config.yaml
│   └── flows/
│       ├── order-flow.yaml
│       ├── auth-flow.yaml
│       └── navigation-flow.yaml
└── jest.config.js
```

---

## 9. Plan de Test MVP

### Phase 1 : Fondations (Semaine 1)
- [ ] Setup Jest + RNTL
- [ ] Setup MSW pour mocking API
- [ ] Tests unitaires services API
- [ ] Tests unitaires authService

### Phase 2 : Contexts (Semaine 2)
- [ ] Tests CartContext
- [ ] Tests AuthContext
- [ ] Tests OrderContext
- [ ] Tests SettingsContext

### Phase 3 : Composants (Semaine 3)
- [ ] Tests LoginScreen
- [ ] Tests CartScreen
- [ ] Tests OrdersScreen
- [ ] Tests ProfileScreen

### Phase 4 : E2E (Semaine 4)
- [ ] Setup Maestro
- [ ] Flow commande complete
- [ ] Flow authentification
- [ ] Flow navigation

### Couverture Cible MVP

| Module | Couverture Cible |
|--------|------------------|
| Services (api, auth) | 80% |
| Contexts | 70% |
| Écrans critiques | 60% |
| Utils | 90% |
| **Global** | **65%** |

---

## 10. Commandes et CI/CD

### Scripts NPM

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:components": "jest tests/components",
    "test:e2e": "maestro test .maestro/flows/",
    "test:e2e:ci": "maestro cloud --apiKey $MAESTRO_API_KEY .maestro/flows/"
  }
}
```

### GitHub Actions (CI)

```yaml
# .github/workflows/mobile-tests.yml
name: Mobile Tests

on:
  push:
    paths:
      - 'apps/mobile/**'
  pull_request:
    paths:
      - 'apps/mobile/**'

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd apps/mobile && npm ci
      - run: cd apps/mobile && npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: apps/mobile/coverage/lcov.info

  e2e-tests:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: mobile-dev-inc/action-maestro-cloud@v1
        with:
          api-key: ${{ secrets.MAESTRO_CLOUD_API_KEY }}
          app-file: apps/mobile/app-release.apk
          flows-folder: apps/mobile/.maestro/flows
```

---

## Checklist de Démarrage

- [ ] Installer les dépendances de test
- [ ] Configurer jest.config.js
- [ ] Créer tests/setup.ts
- [ ] Configurer MSW handlers
- [ ] Écrire le premier test unitaire
- [ ] Vérifier que `npm test` fonctionne
- [ ] Installer Maestro localement
- [ ] Créer le premier flow E2E
- [ ] Configurer le coverage threshold

---

*Document généré le 2026-01-15*
*Version : 1.0*
*Application : OneEats Mobile v1.0.0*
