---
stepsCompleted:
  - context-analysis
  - container-design
  - component-design
  - key-flows
  - nfr-guards
  - adr-decisions
  - delivery-plan
inputDocuments:
  - docs/product/prd.md
  - docs/ROADMAP.md
  - docs/business/BUSINESS_RULES.md
  - docs/business/USE_CASES.md
  - docs/api/DATA_MODEL.md
  - docs/api/API_SPECS.md
  - docs/tests/TEST_STRATEGY.md
workflowType: 'architecture'
project_name: 'OneEats Backend'
user_name: 'Equipe OneEats'
date: '2026-01-15'
---

# Architecture Decision Document - OneEats Backend

_This document defines the target architecture for the OneEats Backend MVP, covering the monolithic Quarkus application with integrations to web (Quinoa), mobile (Expo), Keycloak, PostgreSQL, and notification systems._

## Architecture Objectives

- Consolidate the Quarkus monolith (Java 21) with a modular domain structure (auth, user, restaurant, menu, order, notification, analytics)
- Ensure alignment of order statuses and API contracts between backend and frontends (web/mobile)
- Prepare auth and security (Keycloak + JWT), observability (Micrometer/Prometheus, structured logs), and real-time features (WebSocket + Expo push)
- Define NFR requirements: performance (p95<300ms CRUD, p99<800ms orders), availability 99.5% MVP, validations/Bean Validation, GDPR compliance

## C4 Context View (Level 1)

```
[Mobile App (Expo)] -- REST/HTTPS --> [Quarkus API (Monolith)] <-- REST/HTTPS -- [Web Dashboard (Vite/Quinoa)]
[Admin Dashboard]   -- REST/HTTPS --> [Quarkus API (Monolith)]
[Quarkus API] -- OIDC/OAuth2 --> [Keycloak]
[Quarkus API] -- SQL --> [PostgreSQL]
[Quarkus API] -- WebSocket --> [Web Dashboard]
[Quarkus API] -- Push (Expo/FCM) --> [Mobile App]
```

## C4 Container View (Level 2)

| Container | Description | Technology |
|-----------|-------------|------------|
| Quarkus Monolith | Domain modules, REST controllers, services, repositories, WebSocket endpoint | Java 21, Quarkus 3.24.2 |
| PostgreSQL | Relational storage for all domain entities | PostgreSQL |
| Keycloak | OIDC provider with CLIENT/RESTAURANT/ADMIN roles | Keycloak |
| Front Web | Restaurant/Admin dashboards, served via Quinoa | Vite, React 18, TypeScript |
| Mobile | Customer app consuming REST + push notifications | Expo 54, React Native |
| File Storage | Local FS (dev), S3/GCS (prod) for images | FS / S3 |
| Observability | Metrics and health endpoints | Micrometer, Prometheus |

## C4 Component View (Level 3 - Quarkus)

| Component | Responsibility |
|-----------|---------------|
| `auth` | Keycloak OIDC integration, JWT validation, User/Role mappers |
| `user` | Account management (admin CRUD, profile), roles |
| `restaurant` | Profile management, hours (JSON schedule), open/active status, approval workflow |
| `menu` | MenuItem CRUD + categories, availability, allergens, options, image upload |
| `order` | Order lifecycle, cart validation, status transitions, notifications |
| `notification` | WebSocket + push; notification storage and unread-count |
| `analytics` | Stats endpoints (restaurant/admin), simple aggregations |
| `common` | Exceptions, validation, DTO mapping, logging/metrics, pagination |

## Key Flows

### Authentication Flow
```
Frontend --> /api/auth/login (Keycloak) --> JWT Token --> Subsequent API calls with Bearer token
Refresh via /api/auth/refresh if adopted
```

### Order Flow
```
Mobile places order (validated cart, open restaurant, available items)
  --> Order service creates order with status PENDING
  --> Restaurant updates: PENDING -> PREPARING -> READY -> PICKED_UP
  --> Notifications sent via WebSocket (web) + Push (mobile)
  --> CANCELLED possible according to business rules
```

### Notification Flow
```
Quarkus emits events (order.created, status.changed)
  --> WebSocket broadcast to web dashboard
  --> Push notification to mobile via Expo
  --> Fallback polling on /api/notifications
```

### Image Upload Flow
```
REST multipart upload --> Quarkus validation (size/format)
  --> Storage (FS dev / S3 prod) --> URL returned
```

## Order Status Alignment

Canonical API/Backend statuses (English):
- `PENDING` - Order created, awaiting restaurant confirmation
- `PREPARING` - Restaurant is preparing the order
- `READY` - Order ready for pickup
- `PICKED_UP` - Customer has picked up the order
- `CANCELLED` - Order cancelled

Documentation mapping (French):
- `EN_ATTENTE` → PENDING
- `EN_PREPARATION` → PREPARING
- `PRETE` → READY
- `RECUPEREE` → PICKED_UP
- `ANNULEE` → CANCELLED

## Non-Functional Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| API Latency | p95 < 300ms (CRUD), p99 < 800ms (orders) | Review after measurement |
| Availability | 99.5% | MVP target |
| Security | OIDC required except /auth/login | Bean Validation for inputs |
| Upload Limits | Max 5MB, whitelist formats (jpg/png/webp) | ADR-004 |
| Resilience | HTTP timeouts, limited retry on GET, polling fallback | If WebSocket down |
| Observability | Micrometer metrics, structured JSON logs | Trace/request ID correlation |
| GDPR | Minimal data, user deletion/deactivation supported | |

## Architecture Decision Records

| ADR | Decision | Status |
|-----|----------|--------|
| [ADR-001](../adr/ADR-001-auth.md) | Keycloak + JWT resource server for authentication | Accepted |
| [ADR-002](../adr/ADR-002-order-statuses.md) | Unified status naming: PENDING/PREPARING/READY/PICKED_UP/CANCELLED | Accepted |
| [ADR-003](../adr/ADR-003-notifications.md) | WebSocket + Expo push with polling fallback | Accepted |
| [ADR-004](../adr/ADR-004-uploads.md) | Local FS (dev), S3/GCS (prod) for file storage | Accepted |

## Technical Delivery Plan

### Phase 1: MVP Core
- Auth JWT implementation
- Restaurant CRUD with status management
- Menu CRUD with image upload
- Order lifecycle with aligned statuses
- Basic stats endpoints
- File uploads (FS dev)

### Phase 2: Dashboards & Advanced Features
- Admin user management
- Advanced analytics
- Restaurant approval workflow
- Search and filters
- Cloud storage migration (S3/GCS)

### Phase 3: Real-time & Security Hardening
- WebSocket notifications
- Expo push notifications
- Rate limiting
- Audit logging
- CSV/PDF exports

## Validation Checkpoints

- [ ] Review status/contracts with frontend teams (web/mobile) before delivery
- [ ] Verify DB schema vs DATA_MODEL.md after enum alignment
- [ ] Confirm Keycloak config (realms/clients/roles) and refresh token strategy
- [ ] Validate UX needs for notification fallback (polling) and error messages

## Related Documents

- [PRD](../product/prd.md) - Product Requirements Document
- [Epics & Stories](../product/epics-and-stories.md) - Implementation breakdown
- [API Specs](../api/API_SPECS.md) - API endpoint documentation
- [Data Model](../api/DATA_MODEL.md) - Database schema
- [Business Rules](../business/BUSINESS_RULES.md) - Domain rules
- [Hexagonal Guide](hexagonal-guide.md) - DDD implementation guide
