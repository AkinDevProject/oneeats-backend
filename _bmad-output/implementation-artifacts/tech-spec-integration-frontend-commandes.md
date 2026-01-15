---
title: 'Intégration Frontend-Backend Commandes'
slug: 'integration-frontend-commandes'
created: '2026-01-15'
completed: '2026-01-15'
status: 'completed'
stepsCompleted: [1, 2, 3, 4, 5, 6]
tech_stack:
  - React 18
  - TypeScript
  - Vite/Quinoa (web)
  - Expo/React Native (mobile)
  - Quarkus REST APIs
files_to_modify:
  - apps/web/src/pages/restaurant/designs/KitchenBoardView.tsx
  - apps/web/src/pages/restaurant/designs/SwipeCardsView.tsx
  - apps/web/src/pages/restaurant/designs/CompactListView.tsx
  - apps/web/src/pages/restaurant/designs/TicketPrintView.tsx
  - apps/mobile/src/contexts/CartContext.tsx
code_patterns:
  - useRestaurantData hook pattern (web)
  - OrderContext with apiService (mobile)
  - Status mapping functions
  - Error/loading state management
test_patterns:
  - Manual end-to-end testing
  - Backend up/down scenarios
  - Status transition validation
---

# Tech-Spec: Intégration Frontend-Backend Commandes

**Created:** 2026-01-15
**Status:** Ready for Review

## Overview

### Problem Statement

Les frontends (dashboard web et application mobile) n'utilisent pas complètement les vraies APIs backend pour le module Commandes. Certains composants utilisent encore des données mock (`mockData.ts`), ce qui empêche la validation bout-en-bout du flux de commandes.

**Fichiers impactés:**
- 4 vues design web utilisent `mockOrders` au lieu du hook `useRestaurantData()`
- `CartContext.tsx` mobile utilise `generateMockOrder()` au lieu de l'API

### Solution

Migrer tous les composants vers les vraies APIs en suivant les patterns existants:
1. Web: Utiliser `useRestaurantData()` hook (comme `OrdersManagementPage.tsx`)
2. Mobile: Utiliser `apiService.orders.create()` (comme `OrderContext.addOrder()`)

### Scope

**In Scope:**
- Dashboard Web : 4 vues design alternatives
- Application Mobile : fonction createOrder dans CartContext
- Garder le workaround `DEV_USER_ID` pour l'auth temporaire

**Out of Scope:**
- Implémentation Auth JWT (Epic 1)
- Notifications temps réel WebSocket (Epic 5)
- Autres modules (Restaurants, Menu)

## Context for Development

### Codebase Patterns

**Pattern Web (RÉFÉRENCE - useRestaurantData.ts:59-118):**
```typescript
// Hook qui gère fetch, loading, error, et refresh
const { orders, loading, error, updateOrderStatus, refetch } = useRestaurantData();
```

**Pattern Mobile (RÉFÉRENCE - OrderContext.tsx:269-333):**
```typescript
// Appel API avec transformation des données
const createdOrder = await apiService.orders.create({
  userId: user?.id || ENV.DEV_USER_ID,
  restaurantId: order.restaurantId,
  totalAmount: order.total,
  items: order.items.map(item => ({...}))
});
```

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `apps/web/src/hooks/useRestaurantData.ts` | Hook API complet (COPIER CE PATTERN) |
| `apps/web/src/pages/restaurant/OrdersManagementPage.tsx` | Usage du hook (EXEMPLE) |
| `apps/mobile/src/contexts/OrderContext.tsx:269-333` | Pattern addOrder (COPIER CE PATTERN) |

### Files to Modify

| # | File | Current State | Target State |
|---|------|--------------|--------------|
| 1 | `designs/KitchenBoardView.tsx` | `mockOrders` import | `useRestaurantData()` |
| 2 | `designs/SwipeCardsView.tsx` | `mockOrders` import | `useRestaurantData()` |
| 3 | `designs/CompactListView.tsx` | `mockOrders` import | `useRestaurantData()` |
| 4 | `designs/TicketPrintView.tsx` | `mockOrders` import | `useRestaurantData()` |
| 5 | `CartContext.tsx` | `generateMockOrder()` | `apiService.orders.create()` |

## Implementation Plan

### Tasks

#### Web - Vues Design (Tâches 1-4)

- [x] **Task 1: Migrer KitchenBoardView.tsx**
  - File: `apps/web/src/pages/restaurant/designs/KitchenBoardView.tsx`
  - Actions:
    1. Supprimer ligne 6: `import { mockOrders } from '../../../data/mockData';`
    2. Ajouter import: `import { useRestaurantData } from '../../../hooks/useRestaurantData';`
    3. Remplacer ligne 10: `const [orders, setOrders] = useState<Order[]>(mockOrders);`
       Par: `const { orders, loading, error, updateOrderStatus } = useRestaurantData();`
    4. Modifier `handleStatusUpdate` pour appeler `updateOrderStatus(orderId, newStatus)`
    5. Ajouter états loading/error dans le rendu

- [x] **Task 2: Migrer SwipeCardsView.tsx**
  - File: `apps/web/src/pages/restaurant/designs/SwipeCardsView.tsx`
  - Actions: Identiques à Task 1
    1. Supprimer import mockOrders
    2. Ajouter import useRestaurantData
    3. Remplacer useState(mockOrders) par useRestaurantData()
    4. Connecter les actions au hook updateOrderStatus
    5. Gérer loading/error

- [x] **Task 3: Migrer CompactListView.tsx**
  - File: `apps/web/src/pages/restaurant/designs/CompactListView.tsx`
  - Actions: Identiques à Task 1

- [x] **Task 4: Migrer TicketPrintView.tsx**
  - File: `apps/web/src/pages/restaurant/designs/TicketPrintView.tsx`
  - Actions: Identiques à Task 1

#### Mobile - Création de Commandes (Tâche 5)

- [x] **Task 5: Connecter CartContext.createOrder à l'API**
  - File: `apps/mobile/src/contexts/CartContext.tsx`
  - Actions:
    1. Ajouter import: `import apiService from '../services/api';`
    2. Ajouter import: `import { ENV } from '../config/env';`
    3. Ajouter import: `import { useAuth } from './AuthContext';` (si pas déjà)
    4. Modifier fonction `createOrder` (ligne 184-200):

    ```typescript
    const createOrder = async (restaurantId: string, customerNotes?: string, customerData?: {...}): Promise<Order | null> => {
      if (items.length === 0) return null;

      try {
        // Appeler l'API réelle au lieu de generateMockOrder
        const createdOrder = await apiService.orders.create({
          userId: user?.id || ENV.DEV_USER_ID,
          restaurantId: restaurantId,
          totalAmount: totalPrice,
          specialInstructions: customerNotes,
          items: items.map(item => ({
            menuItemId: item.menuItem.id,
            menuItemName: item.menuItem.name,
            unitPrice: item.menuItem.price,
            quantity: item.quantity,
            specialNotes: item.specialInstructions
          }))
        });

        clearCart();
        return createdOrder;
      } catch (error) {
        console.error('Error creating order:', error);
        throw error; // Propager l'erreur pour que l'UI puisse la gérer
      }
    };
    ```
    5. Supprimer l'import de `generateMockOrder` de mockData.ts

#### Cleanup (Optionnel)

- [x] **Task 6 (Optionnel): Nettoyer mockData.ts** *(Non supprimé - utilisé dans les tests)*
  - Files:
    - `apps/web/src/data/mockData.ts`
    - `apps/mobile/src/data/mockData.ts`
  - Action: Supprimer `mockOrders` et `generateMockOrder` si plus utilisés
  - Note: Vérifier qu'aucun autre fichier ne les importe avant suppression

### Acceptance Criteria

#### Web - Vues Design

- [ ] **AC1:** Given le backend est démarré, when j'ouvre KitchenBoardView, then les commandes réelles s'affichent (pas les mocks)
- [ ] **AC2:** Given une commande PENDING dans KitchenBoardView, when je clique "Commencer", then le statut passe à PREPARING via l'API
- [ ] **AC3:** Given le backend est arrêté, when j'ouvre une vue design, then un message d'erreur s'affiche
- [ ] **AC4:** Given le backend est lent, when j'ouvre une vue design, then un indicateur de chargement s'affiche
- [ ] **AC5:** Given les 4 vues design migrées, when je rafraîchis les données, then toutes affichent les mêmes commandes (cohérence)

#### Mobile - Création Commandes

- [ ] **AC6:** Given un panier avec articles, when je valide la commande, then l'API `/api/orders` est appelée avec les bons paramètres
- [ ] **AC7:** Given l'API retourne succès, when la commande est créée, then le panier est vidé et la commande apparaît dans l'historique
- [ ] **AC8:** Given l'API retourne erreur, when la commande échoue, then un message d'erreur s'affiche et le panier est préservé
- [ ] **AC9:** Given pas de backend, when je crée une commande, then une erreur réseau est affichée proprement

#### Intégration E2E

- [ ] **AC10:** Given une commande créée sur mobile, when je consulte le dashboard web, then la commande apparaît dans la liste
- [ ] **AC11:** Given une commande acceptée sur dashboard web, when je rafraîchis le mobile, then le statut est mis à jour

## Additional Context

### Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Backend API `/api/orders` | ✅ Fonctionnel | Testé via OrdersManagementPage |
| `useRestaurantData` hook | ✅ Fonctionnel | Référence d'implémentation |
| `apiService.orders.create` | ✅ Fonctionnel | Utilisé dans OrderContext.addOrder |
| PostgreSQL + données test | ✅ Requis | docker-compose.dev.yml |

### Testing Strategy

**Tests Manuels Requis:**

1. **Web - Par vue design:**
   - Démarrer backend (IntelliJ)
   - Ouvrir chaque vue via DashboardDesignSelector
   - Vérifier affichage des commandes réelles
   - Tester changement de statut
   - Vérifier refresh automatique (30s)

2. **Mobile - Flux création:**
   - Démarrer Expo (`cd apps/mobile && npm start`)
   - Ajouter articles au panier
   - Valider commande
   - Vérifier apparition dans historique
   - Vérifier apparition sur dashboard web

3. **Scénarios d'erreur:**
   - Arrêter le backend
   - Vérifier messages d'erreur appropriés
   - Vérifier que les données ne sont pas perdues

### Risk Analysis

| Risk | Impact | Mitigation |
|------|--------|------------|
| Mapping statuts incorrect | Moyen | Utiliser les fonctions existantes (mapOrderStatus) |
| Breaking change CartContext | Haut | Tester flux complet avant merge |
| Régression vues design | Faible | Vues alternatives, page principale OK |

### Notes

- **Ordre recommandé:** Tasks 1-4 peuvent être parallélisées, Task 5 indépendante
- **Quick win:** Commencer par Task 1 (KitchenBoardView) pour valider le pattern
- **Auth:** DEV_USER_ID reste en place jusqu'à Epic 1 (JWT)
- **Pas de nouveaux tests unitaires:** Focus sur intégration manuelle pour cette spec

---

## Review Notes (2026-01-15)

**Revue adversariale complétée**
- Findings: 11 total, 2 corrigés, 3 non-applicables, 6 reportés (optimisations Low)
- Approche de résolution: Auto-fix tous (real)

**Corrections appliquées:**
- F5: Remplacé `window.location.reload()` par `refetch()` dans les 4 vues web

**Findings reportés pour itération future:**
- F1: Système de notification d'erreur (toast) - nécessite implémentation toast system
- F6: Indicateur de chargement pendant update statut
- F7-F10: Optimisations code (useMemo, centralisation normalisation, etc.)

**Validation requise:**
- Tests manuels E2E (Web + Mobile)
- Vérifier gestion d'erreur dans les composants appelant CartContext.createOrder
