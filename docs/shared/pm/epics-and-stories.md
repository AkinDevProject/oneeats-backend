---
stepsCompleted:
  - overview
  - requirements-inventory
  - coverage-map
  - epic-breakdown
  - story-details
inputDocuments:
  - docs/product/prd.md
  - docs/architecture/target-architecture.md
  - docs/adr/ADR-001-auth.md
  - docs/adr/ADR-002-order-statuses.md
  - docs/adr/ADR-003-notifications.md
  - docs/adr/ADR-004-uploads.md
  - docs/api/API_SPECS.md
---

# OneEats Backend - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for OneEats Backend MVP, decomposing the requirements from the PRD and Architecture into implementable stories.

**Priorities:**
- P0: Critical for MVP
- P1: Important for MVP
- P2: Post-MVP

## Requirements Inventory

### Functional Requirements

| ID | Requirement | Priority | Epic |
|----|-------------|----------|------|
| FR-01 | Auth JWT avec roles CLIENT/RESTAURANT/ADMIN | P0 | Epic 1 |
| FR-02 | Protection routes par role | P0 | Epic 1 |
| FR-03 | CRUD restaurants avec validations | P0 | Epic 2 |
| FR-04 | Statut open/active et approbation restaurants | P0 | Epic 2 |
| FR-05 | Upload logo restaurant | P0 | Epic 2 |
| FR-06 | CRUD menu items avec categories | P0 | Epic 3 |
| FR-07 | Gestion disponibilite et options dietetiques | P0 | Epic 3 |
| FR-08 | Upload images menu items | P0 | Epic 3 |
| FR-09 | Passage de commande depuis mobile | P0 | Epic 4 |
| FR-10 | Cycle de vie commandes (state machine) | P0 | Epic 4 |
| FR-11 | Historique et listing commandes | P0 | Epic 4 |
| FR-12 | Regles annulation commandes | P0 | Epic 4 |
| FR-13 | WebSocket notifications temps reel | P1 | Epic 5 |
| FR-14 | Push notifications mobile | P1 | Epic 5 |
| FR-15 | Stats jour restaurant | P1 | Epic 6 |
| FR-16 | Stats plateforme admin | P1 | Epic 6 |
| FR-17 | CRUD utilisateurs admin | P1 | Epic 7 |

### NonFunctional Requirements

| ID | Requirement | Priority | Epic |
|----|-------------|----------|------|
| NFR-01 | Latence API p95 < 300ms | P1 | Epic 8 |
| NFR-02 | Disponibilite 99.5% | P1 | Epic 8 |
| NFR-03 | Logs structures JSON | P1 | Epic 8 |
| NFR-04 | Metriques Prometheus | P1 | Epic 8 |
| NFR-05 | Health checks complets | P1 | Epic 8 |
| NFR-06 | Tests integration critiques | P1 | Epic 8 |

### Additional Requirements

- Storage abstrait pour uploads (FS dev, S3/GCS prod)
- Securite uploads (validation MIME, taille, sanitation)
- Alignement statuts commandes (ADR-002)

### FR Coverage Map

| Epic | Requirements Covered |
|------|---------------------|
| Epic 1: Auth & Securite | FR-01, FR-02 |
| Epic 2: Restaurants | FR-03, FR-04, FR-05 |
| Epic 3: Menu | FR-06, FR-07, FR-08 |
| Epic 4: Commandes | FR-09, FR-10, FR-11, FR-12 |
| Epic 5: Notifications | FR-13, FR-14 |
| Epic 6: Analytics | FR-15, FR-16 |
| Epic 7: Admin Users | FR-17 |
| Epic 8: Observabilite | NFR-01 to NFR-06 |

## Epic List

- Epic 1: Auth & Securite (P0)
- Epic 2: Restaurants (P0)
- Epic 3: Menu (P0)
- Epic 4: Commandes (P0)
- Epic 5: Notifications (P1)
- Epic 6: Analytics & Dashboard (P1)
- Epic 7: Admin Users (P1)
- Epic 8: Observabilite & Qualite (P1)

---

## Epic 1: Auth & Securite

**Goal:** Implementer l'authentification JWT via Keycloak avec gestion des roles pour securiser toutes les APIs.

**Dependencies:** Keycloak configure avec clients et roles.

### Story 1.1: Login JWT via Keycloak

As a user (CLIENT, RESTAURANT, or ADMIN),
I want to authenticate via Keycloak and receive a JWT token,
So that I can access protected API endpoints according to my role.

**Acceptance Criteria:**

**Given** I am an unauthenticated user with valid credentials
**When** I submit a POST request to /api/auth/login
**Then** I receive a JWT access token with my role claims
**And** the token contains user ID, email, and role information

**Given** I submit invalid credentials
**When** I attempt to login
**Then** I receive a 401 Unauthorized response
**And** no token is issued

### Story 1.2: Protection routes par role

As a system administrator,
I want all protected routes to validate JWT tokens and roles,
So that unauthorized access is prevented.

**Acceptance Criteria:**

**Given** I have a valid JWT token with role CLIENT
**When** I access a CLIENT-protected endpoint
**Then** the request is allowed

**Given** I have a valid JWT token with role CLIENT
**When** I access an ADMIN-only endpoint
**Then** I receive a 403 Forbidden response

**Given** I have no token or an expired token
**When** I access any protected endpoint
**Then** I receive a 401 Unauthorized response

### Story 1.3: Refresh et Logout

As an authenticated user,
I want to refresh my token before expiration and logout securely,
So that I maintain session continuity and can end my session safely.

**Acceptance Criteria:**

**Given** I have a valid refresh token
**When** I POST to /api/auth/refresh
**Then** I receive a new access token

**Given** I am logged in
**When** I POST to /api/auth/logout
**Then** my tokens are invalidated
**And** subsequent requests with old tokens are rejected

---

## Epic 2: Restaurants

**Goal:** Permettre la gestion complete des restaurants avec CRUD, statuts, et upload de logo.

**Dependencies:** Epic 1 (Auth) pour securiser les endpoints admin.

### Story 2.1: CRUD Restaurant

As an admin user,
I want to create, read, update, and delete restaurants,
So that I can manage the restaurant catalog on the platform.

**Acceptance Criteria:**

**Given** I am an authenticated admin
**When** I POST to /api/restaurants with valid data
**Then** a new restaurant is created with status PENDING
**And** I receive the created restaurant with its ID

**Given** I provide invalid data (missing email, invalid phone)
**When** I attempt to create a restaurant
**Then** I receive a 400 Bad Request with validation errors

**Given** restaurants exist in the system
**When** I GET /api/restaurants with pagination
**Then** I receive a paginated list of restaurants

### Story 2.2: Statut et Approbation

As an admin user,
I want to approve, block, or reactivate restaurants,
So that I can control which restaurants are visible to customers.

**Acceptance Criteria:**

**Given** a restaurant has status PENDING
**When** I PUT /api/restaurants/{id}/status with APPROVED
**Then** the restaurant status changes to APPROVED
**And** the restaurant becomes visible to customers

**Given** a restaurant has status APPROVED
**When** I PUT /api/restaurants/{id}/status with BLOCKED
**Then** the restaurant is no longer visible to customers

### Story 2.3: Stats du jour restaurant

As a restaurant owner,
I want to see my daily statistics (orders, revenue, average order value),
So that I can monitor my business performance.

**Acceptance Criteria:**

**Given** I am an authenticated restaurant owner
**When** I GET /api/restaurants/{id}/stats/today
**Then** I receive today's order count, total revenue, and average order value
**And** the values are consistent with completed orders

### Story 2.4: Upload Logo

As a restaurant owner,
I want to upload my restaurant logo,
So that customers can visually identify my restaurant.

**Acceptance Criteria:**

**Given** I have a valid image file (jpg/png/webp, max 5MB)
**When** I POST to /api/restaurants/{id}/upload-logo
**Then** the logo is stored and the logoUrl is returned

**Given** I upload an invalid file (wrong format or too large)
**When** I attempt to upload
**Then** I receive a 400 Bad Request with error details

---

## Epic 3: Menu

**Goal:** Permettre la gestion complete des items de menu avec categories, disponibilite, et images.

**Dependencies:** Epic 2 (Restaurants) pour associer les items aux restaurants.

### Story 3.1: CRUD Menu Items

As a restaurant owner,
I want to create, update, and delete menu items with categories,
So that I can manage my restaurant's menu.

**Acceptance Criteria:**

**Given** I am an authenticated restaurant owner
**When** I POST to /api/menu-items with valid data
**Then** a new menu item is created for my restaurant
**And** the item has a unique name within my restaurant

**Given** I provide a price <= 0 or missing category
**When** I attempt to create a menu item
**Then** I receive a 400 Bad Request with validation errors

### Story 3.2: Disponibilite et Options Dietetiques

As a restaurant owner,
I want to toggle item availability and set dietary options,
So that customers see accurate menu information.

**Acceptance Criteria:**

**Given** a menu item exists
**When** I PATCH /api/menu-items/{id} with available=false
**Then** the item is marked unavailable
**And** customers cannot add it to their cart

**Given** a menu item has dietary options set
**When** customers view the item
**Then** they see isVegetarian, isVegan, and allergens information

### Story 3.3: Upload Image Item

As a restaurant owner,
I want to upload images for my menu items,
So that customers can see what they are ordering.

**Acceptance Criteria:**

**Given** I have a valid image file (jpg/png/webp, max 5MB)
**When** I POST to /api/menu-items/{id}/upload-image
**Then** the image is stored and imageUrl is returned

---

## Epic 4: Commandes

**Goal:** Implementer le cycle de vie complet des commandes de la creation a la recuperation.

**Dependencies:** Epic 2 (Restaurants) et Epic 3 (Menu) pour validation.

### Story 4.1: Passage de commande

As a mobile customer,
I want to place an order from my cart,
So that I can purchase food for pickup.

**Acceptance Criteria:**

**Given** I have items in my cart from an open, active restaurant
**When** I POST to /api/orders with my cart
**Then** an order is created with status PENDING
**And** the total is calculated correctly

**Given** my cart contains unavailable items
**When** I attempt to place an order
**Then** I receive a 400 Bad Request
**And** the unavailable items are identified

### Story 4.2: Cycle de vie commande

As a restaurant owner,
I want to update order status through the workflow,
So that customers know when their order is ready.

**Acceptance Criteria:**

**Given** an order has status PENDING
**When** I PUT /api/orders/{id}/status with PREPARING
**Then** the order status changes to PREPARING

**Given** an order has status PREPARING
**When** I PUT /api/orders/{id}/status with READY
**Then** the order status changes to READY
**And** the customer is notified

**Given** an order has status READY
**When** the customer picks up the order
**Then** the status changes to PICKED_UP

### Story 4.3: Historique et Listing

As a user (customer or restaurant),
I want to view order history with filters,
So that I can track past orders.

**Acceptance Criteria:**

**Given** I am an authenticated user
**When** I GET /api/orders with status and date filters
**Then** I receive a paginated list of matching orders

### Story 4.4: Regles Annulation

As a user,
I want to cancel an order according to business rules,
So that I can handle order issues appropriately.

**Acceptance Criteria:**

**Given** I am a customer with an order in PENDING status
**When** I request cancellation
**Then** the order is cancelled

**Given** I am a customer with an order in PREPARING status
**When** I request cancellation
**Then** the cancellation is rejected

**Given** I am a restaurant with an order in any status before PICKED_UP
**When** I request cancellation
**Then** the order is cancelled and customer is notified

---

## Epic 5: Notifications

**Goal:** Implementer les notifications temps reel pour informer les utilisateurs des changements de commandes.

**Dependencies:** Epic 1 (Auth) pour authentification WebSocket.

### Story 5.1: WebSocket Notifications

As a restaurant owner using the web dashboard,
I want to receive real-time notifications for new orders and status changes,
So that I can respond quickly to customer orders.

**Acceptance Criteria:**

**Given** I am connected to /ws/notifications with valid auth
**When** a new order is created for my restaurant
**Then** I receive an order.created event

**Given** I am connected
**When** an order status changes
**Then** I receive a status.changed event with order details

### Story 5.2: REST Notifications et Unread Count

As a user,
I want to retrieve my notifications and unread count,
So that I can see what I missed while offline.

**Acceptance Criteria:**

**Given** I have unread notifications
**When** I GET /api/notifications/unread-count
**Then** I receive the count of unread notifications

**Given** I view a notification
**When** I POST /api/notifications/{id}/mark-read
**Then** the notification is marked as read

### Story 5.3: Push Mobile

As a mobile customer,
I want to receive push notifications for order updates,
So that I know when my order is ready even when the app is closed.

**Acceptance Criteria:**

**Given** I have registered my device token
**When** my order status changes to READY
**Then** I receive a push notification on my device

---

## Epic 6: Analytics & Dashboard

**Goal:** Fournir des statistiques pour les restaurants et les administrateurs.

**Dependencies:** Epic 4 (Commandes) pour les donnees.

### Story 6.1: Stats Restaurant

As a restaurant owner,
I want to view my daily and weekly statistics,
So that I can track my business performance.

**Acceptance Criteria:**

**Given** I am an authenticated restaurant owner
**When** I GET /api/restaurants/{id}/stats
**Then** I receive orders count, revenue, and average order value

### Story 6.2: Stats Plateforme

As an admin,
I want to view platform-wide statistics,
So that I can monitor overall platform health.

**Acceptance Criteria:**

**Given** I am an authenticated admin
**When** I GET /api/admin/stats
**Then** I receive totalRestaurants, activeRestaurants, totalUsers, totalOrders, totalRevenue

---

## Epic 7: Admin Users

**Goal:** Permettre la gestion des utilisateurs par les administrateurs.

**Dependencies:** Epic 1 (Auth) pour securite.

### Story 7.1: CRUD Utilisateurs

As an admin,
I want to manage user accounts,
So that I can handle user issues and maintain the user base.

**Acceptance Criteria:**

**Given** I am an authenticated admin
**When** I GET /api/admin/users with search and role filters
**Then** I receive a paginated list of users

**Given** I need to update a user
**When** I PUT /api/admin/users/{id}
**Then** the user information is updated
**And** email uniqueness is validated

---

## Epic 8: Observabilite & Qualite

**Goal:** Assurer la qualite et l'observabilite du systeme.

**Dependencies:** None.

### Story 8.1: Logs et Metriques

As an operations team member,
I want structured logs and metrics,
So that I can monitor and debug the system.

**Acceptance Criteria:**

**Given** the application is running
**When** requests are processed
**Then** logs are output in JSON format

**Given** the application is running
**When** I access /q/metrics
**Then** Prometheus metrics are exposed

### Story 8.2: Tests Integration

As a developer,
I want comprehensive integration tests,
So that I can ensure system reliability.

**Acceptance Criteria:**

**Given** the test suite
**When** I run integration tests
**Then** auth, restaurant, menu, and order flows are covered
**And** all tests pass

---

## Dependencies Summary

| Epic | Depends On | Notes |
|------|------------|-------|
| Epic 1: Auth | - | Foundation for all secured endpoints |
| Epic 2: Restaurants | Epic 1 | Admin endpoints need auth |
| Epic 3: Menu | Epic 2 | Menu items belong to restaurants |
| Epic 4: Commandes | Epic 2, Epic 3 | Orders reference restaurants and items |
| Epic 5: Notifications | Epic 1, Epic 4 | Auth for WS, events from orders |
| Epic 6: Analytics | Epic 4 | Stats computed from orders |
| Epic 7: Admin Users | Epic 1 | Admin role required |
| Epic 8: Observabilite | - | Can be implemented independently |

## Next Actions

- Validate notification scope for MVP (WebSocket web only vs push mobile)
- Plan sprints ordering P0 epics first, respecting dependencies
- Synchronize with frontend teams on status enums and DTO formats
