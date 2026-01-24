---
stepsCompleted:
  - overview
  - requirements-inventory
  - coverage-map
  - epic-breakdown
  - story-details
inputDocuments:
  - docs/shared/pm/prd.md
  - docs/shared/architect/architecture.md
  - docs/shared/architect/adr/ADR-001-auth.md
  - docs/shared/architect/adr/ADR-002-order-statuses.md
  - docs/shared/architect/adr/ADR-003-notifications.md
  - docs/shared/architect/adr/ADR-004-uploads.md
  - docs/shared/architect-dev/API_SPECS.md
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
- Epic 9: Mobile UAT Gap (P0/P1/P2) - **NEW 2026-01-24**
- Epic 10: Admin UAT Gap (P0/P1/P2) - **NEW 2026-01-24**

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

## Epic 9: Mobile UAT Gap

**Goal:** Combler les lacunes identifiées lors de l'analyse UAT Mobile pour permettre la validation complète du guide de test utilisateur.

**Dependencies:** Epic 1 (Auth) pour inscription/login.

**Priority:** P0 (bloquant UAT) / P1-P2 (améliorations)

**Source:** Analyse UAT du 2026-01-24 - Comparaison guide UAT vs code mobile

### Story 9.1: Formulaire Inscription Utilisateur

As a new user,
I want to create an account with email and password,
So that I can use the app without SSO providers.

**Priority:** P0 - Bloquant UAT Scénario #2

**Acceptance Criteria:**

**Given** I am on the login screen
**When** I tap "Create Account" or "Sign Up"
**Then** a registration form is displayed with name, email, password, confirm password, and terms checkbox

**Given** I fill the registration form with valid data
**When** I submit the form
**Then** my account is created and I am redirected to home

**Given** I enter an invalid email format
**When** I try to submit
**Then** I see an error message "Invalid email format"

**Given** I enter a password less than 8 characters
**When** I try to submit
**Then** I see an error message "Password must be at least 8 characters"

**Given** I enter mismatched passwords
**When** I try to submit
**Then** I see an error message "Passwords do not match"

**Given** I enter an email already in use
**When** I submit the form
**Then** I see an error message "Email already in use"

**Files:** `app/auth/register.tsx`, `src/contexts/AuthContext.tsx`
**Effort:** 4h

---

### Story 9.2: Connexion Email/Password

As a registered user,
I want to login with my email and password,
So that I can access my account without SSO.

**Priority:** P0 - Bloquant UAT Scénarios #3, #4

**Acceptance Criteria:**

**Given** I am on the login screen
**When** I enter valid email and password and tap "Login"
**Then** I am authenticated and redirected to home

**Given** I enter invalid credentials
**When** I tap "Login"
**Then** I see an error message "Invalid email or password"

**Given** I have forgotten my password
**When** I tap "Forgot Password"
**Then** I see a password recovery option

**Files:** `app/auth/login.tsx`, `src/contexts/AuthContext.tsx` (add `loginWithCredentials()`)
**Effort:** 3h

---

### Story 9.3: Mode Hors Connexion

As a user with unstable internet,
I want to see a clear message when I'm offline,
So that I understand why actions are failing.

**Priority:** P1 - Bloquant UAT Scénario #23

**Acceptance Criteria:**

**Given** my device loses internet connection
**When** I use the app
**Then** I see a banner "You are offline"

**Given** I am offline
**When** I try to place an order
**Then** I see a message explaining the action requires internet

**Given** I am offline
**When** I browse the app
**Then** cached restaurant data is still visible

**Given** my connection is restored
**When** the app detects connectivity
**Then** the offline banner disappears automatically

**Files:** `src/contexts/NetworkContext.tsx`, layout components
**Packages:** `@react-native-community/netinfo`
**Effort:** 6h

---

### Story 9.4: Affichage Allergènes et Infos Diététiques

As a user with dietary restrictions,
I want to see allergens and dietary info on menu items,
So that I can make safe food choices.

**Priority:** P2 - Améliore UAT Scénario #10

**Acceptance Criteria:**

**Given** I view a menu item detail
**When** the item has dietary info (vegetarian, vegan)
**Then** I see corresponding icons/badges

**Given** I view a menu item with allergens
**When** I open the detail
**Then** I see a list of allergens (gluten, nuts, dairy, etc.)

**Files:** `app/menu/[id].tsx`
**Effort:** 2h

---

### Story 9.5: Message Restaurant Fermé Amélioré

As a user browsing restaurants,
I want to see opening hours when a restaurant is closed,
So that I know when I can order.

**Priority:** P2 - Améliore UAT Scénario #8

**Acceptance Criteria:**

**Given** a restaurant is closed
**When** I view its detail page
**Then** I see "Currently closed" with next opening time

**Given** a restaurant is closed
**When** I try to add items to cart
**Then** I see a message explaining I cannot order from a closed restaurant

**Files:** `app/restaurant/[id].tsx`, `app/(tabs)/index.tsx`
**Effort:** 1h

---

### Story 9.6: Notifications Push Réelles

As a user with an active order,
I want to receive real push notifications,
So that I'm alerted when my order status changes.

**Priority:** P3 - Améliore UAT Scénario #22

**Acceptance Criteria:**

**Given** I have placed an order
**When** the restaurant changes the order status
**Then** I receive a push notification on my device

**Given** the app is in background
**When** I receive a notification
**Then** tapping it opens the order detail

**Files:** `src/contexts/PushNotificationContext.tsx`, backend integration
**Effort:** 4h (+ backend work)

---

## Epic 10: Admin UAT Gap

**Goal:** Combler les lacunes identifiées lors de l'analyse UAT Admin pour permettre la validation complète du guide de test administrateur (UAT_GUIDE_ADMIN.md).

**Dependencies:** Epic 1 (Auth), Epic 2 (Restaurants), Epic 7 (Admin Users).

**Priority:** P0 (bloquant UAT) / P1-P2 (améliorations)

**Source:** Analyse UAT Admin du 2026-01-24 - Comparaison guide UAT vs code backend/web

### Story 10.1: Statut REJECTED pour Restaurants

As an administrator,
I want to reject a restaurant application with a specific status,
So that pending restaurants can be formally rejected.

**Priority:** P0 - Bloquant UAT Scénario #15

**Acceptance Criteria:**

**Given** a restaurant has status PENDING
**When** I reject it
**Then** the status changes to REJECTED

**Given** a restaurant is REJECTED
**When** I view the restaurants list
**Then** I can filter by REJECTED status

**Files:** `RestaurantStatus.java`, `RestaurantEntity.java`
**Effort:** 1h

---

### Story 10.2: Raison de Rejet Restaurant

As an administrator,
I want to provide a reason when rejecting a restaurant,
So that the restaurant owner understands why their application was rejected.

**Priority:** P0 - Bloquant UAT Scénario #15

**Acceptance Criteria:**

**Given** I am rejecting a restaurant
**When** I submit the rejection
**Then** I must provide a rejection reason

**Given** a restaurant was rejected
**When** I view its details
**Then** I see the rejection reason and rejection date

**Files:** `RestaurantEntity.java`, `Restaurant.java`, `RestaurantController.java`
**Effort:** 2h

---

### Story 10.3: UI Validation/Rejet Restaurant

As an administrator,
I want modal dialogs for validating and rejecting restaurants,
So that I can easily manage restaurant applications.

**Priority:** P0 - Bloquant UAT Scénarios #14, #15

**Acceptance Criteria:**

**Given** I click "Validate" on a pending restaurant
**When** the modal appears
**Then** I can confirm validation

**Given** I click "Reject" on a pending restaurant
**When** the modal appears
**Then** I must enter a rejection reason before confirming

**Given** I confirm validation or rejection
**When** the action completes
**Then** I see a success message and the list refreshes

**Files:** `apps/web/src/pages/RestaurantsManagementPage.tsx`
**Effort:** 2h

---

### Story 10.4: Raison de Blocage Restaurant

As an administrator,
I want to provide a reason when blocking a restaurant,
So that there is an audit trail for blocking decisions.

**Priority:** P0 - Bloquant UAT Scénario #5

**Acceptance Criteria:**

**Given** I am blocking an active restaurant
**When** I submit the block action
**Then** I must provide a blocking reason

**Given** a restaurant was blocked
**When** I view its details
**Then** I see the blocking reason and blocked date

**Files:** `RestaurantEntity.java`, `Restaurant.java`
**Effort:** 1h

---

### Story 10.5: Gestion Commandes lors Blocage

As an administrator,
I want pending orders to be handled when I block a restaurant,
So that customers are not left with unfulfilled orders.

**Priority:** P0 - Bloquant UAT Scénario #5

**Acceptance Criteria:**

**Given** a restaurant has pending orders
**When** I block the restaurant
**Then** I see a warning showing the number of pending orders

**Given** I confirm blocking with pending orders
**When** the block completes
**Then** pending orders are cancelled with reason "Restaurant blocked"
**And** customers are notified

**Files:** `RestaurantService.java`, `OrderService.java`
**Effort:** 3h

---

### Story 10.6: Durée et Raison Suspension Utilisateur

As an administrator,
I want to specify duration and reason when suspending a user,
So that suspensions are documented and time-limited.

**Priority:** P1 - Bloquant UAT Scénario #16

**Acceptance Criteria:**

**Given** I am suspending a user
**When** I submit the suspension
**Then** I must provide a reason and select a duration

**Given** a user was suspended with duration
**When** the duration expires
**Then** the user is automatically reactivated

**Given** a user is suspended
**When** I view their profile
**Then** I see suspension reason, start date, and end date

**Files:** `UserEntity.java`, `User.java`, `AdminUserController.java`
**Effort:** 2h

---

### Story 10.7: UI Suspension Utilisateur avec Durée

As an administrator,
I want a modal to suspend users with duration selection,
So that I can easily manage user suspensions.

**Priority:** P1 - Bloquant UAT Scénario #16

**Acceptance Criteria:**

**Given** I click "Suspend" on an active user
**When** the modal appears
**Then** I can select duration (1 day, 7 days, 30 days, indefinite)
**And** I must enter a suspension reason

**Given** I confirm suspension
**When** the action completes
**Then** I see a success message with the suspension end date

**Files:** `apps/web/src/pages/UsersPage.tsx`
**Effort:** 2h

---

### Story 10.8: Endpoint Alertes Admin

As an administrator,
I want to see real-time alerts on the dashboard,
So that I can quickly respond to important events.

**Priority:** P1 - Améliore UAT Scénario #12

**Acceptance Criteria:**

**Given** I am on the admin dashboard
**When** alerts are available
**Then** I see a list of recent alerts (new restaurants, reported orders, etc.)

**Given** new events occur
**When** I refresh the dashboard
**Then** I see updated alerts

**Files:** `AlertsController.java` (new), `AlertsService.java` (new)
**Effort:** 3h

---

### Story 10.9: Export CSV/Excel

As an administrator,
I want to export data to CSV or Excel format,
So that I can analyze data in spreadsheet applications.

**Priority:** P2 - Bloquant UAT Scénario #11

**Acceptance Criteria:**

**Given** I am on the restaurants, users, or orders page
**When** I click "Export CSV" or "Export Excel"
**Then** a file is downloaded with the filtered data

**Given** I have applied filters
**When** I export
**Then** only filtered data is included in the export

**Files:** `ExportController.java` (new), `ExportService.java` (new)
**Dependencies:** Apache POI, OpenCSV (pom.xml)
**Effort:** 4h

---

### Story 10.10: Export PDF Rapport

As an administrator,
I want to export statistics as a PDF report,
So that I can share formatted reports with stakeholders.

**Priority:** P2 - Améliore UAT Scénario #11

**Acceptance Criteria:**

**Given** I am on the analytics page
**When** I click "Export PDF"
**Then** a formatted PDF report is generated with charts and statistics

**Given** I select a date range
**When** I export PDF
**Then** the report includes only data from that period

**Files:** `ExportService.java`, PDF templates
**Dependencies:** iText or JasperReports (pom.xml)
**Effort:** 4h

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
| Epic 9: Mobile UAT Gap | Epic 1 | Auth for login/register stories |
| Epic 10: Admin UAT Gap | Epic 1, Epic 2, Epic 7 | Admin features for UAT validation |

## Next Actions

- Validate notification scope for MVP (WebSocket web only vs push mobile)
- Plan sprints ordering P0 epics first, respecting dependencies
- Synchronize with frontend teams on status enums and DTO formats
