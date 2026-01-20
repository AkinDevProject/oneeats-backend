# ADR-005 — Strategie d'Authentification Detaillee (Keycloak + Social Login + Hybrid Roles)

## Contexte

- ADR-001 etablit Keycloak comme fournisseur OIDC/JWT, mais sans details d'implementation.
- OneEats a 3 clients distincts : Mobile (React Native/Expo), Web Dashboard (React/Vite), API externe (futur).
- Besoin de Social Login (Google, Apple, Facebook) + inscription email classique.
- Gestion des roles metier complexe : un utilisateur peut gerer plusieurs restaurants avec des permissions differentes.
- MVP ne necessite pas de 2FA, mais doit etre activable post-MVP.
- UX mobile exige une session longue ("Remember Me") pour eviter les reconnexions frequentes.

## Decision

### 1. Identity Providers (IdP)

Configuration Keycloak avec les Identity Providers suivants :

| Provider | Priorite | Notes |
|----------|----------|-------|
| **Google** | MVP | Configuration simple, OAuth 2.0 standard |
| **Email/Password** | MVP | Natif Keycloak, validation email optionnelle |
| **Facebook** | Post-MVP | Necessite Facebook App Developer |
| **Apple** | Pre-App Store | Obligatoire si autres social logins presents sur iOS |

### 2. Flows OIDC par Client

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FLOWS OIDC PAR TYPE DE CLIENT                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  WEB DASHBOARD (React/Vite)                                                 │
│  ├── Flow : Authorization Code Flow                                         │
│  ├── Stockage : HttpOnly Secure Cookies                                     │
│  ├── CSRF : Token synchronise                                               │
│  └── Gestion : quarkus-oidc mode "web-app"                                  │
│                                                                             │
│  MOBILE APP (React Native/Expo)                                             │
│  ├── Flow : Authorization Code Flow + PKCE (Proof Key for Code Exchange)   │
│  ├── Stockage : expo-secure-store (chiffrement natif iOS/Android)          │
│  ├── Refresh : Background token refresh                                     │
│  └── Gestion : quarkus-oidc mode "service" (Bearer tokens)                  │
│                                                                             │
│  QUARKUS BACKEND                                                            │
│  ├── Mode : hybrid (supporte web-app ET service)                            │
│  ├── Detection : Presence header "Authorization: Bearer" → mode service    │
│  ├── Absence header → mode web-app (cookies)                                │
│  └── Validation : JWKS endpoint Keycloak                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3. Strategie de Tokens

| Token | Duree | Usage |
|-------|-------|-------|
| **Access Token** | 15 minutes | Authentification des requetes API |
| **Refresh Token** | 7 jours | Renouvellement silencieux de l'access token |
| **Refresh Token (Remember Me)** | 30 jours | Session longue pour mobile et "Se souvenir de moi" |
| **ID Token** | 15 minutes | Informations utilisateur (claims) |

Configuration Keycloak recommandee :
```
Realm Settings > Tokens:
- Access Token Lifespan: 15 minutes
- Access Token Lifespan For Implicit Flow: 15 minutes
- Client Session Idle: 7 days
- Client Session Max: 30 days
- Refresh Token Max Reuse: 0 (single use for security)

Authentication > Flows > Browser > Remember Me:
- Enabled: true
- Cookie Max Age: 30 days
```

### 4. Architecture Hybride des Roles (Keycloak + Base de Donnees)

**Principe de separation des responsabilites :**

```
┌─────────────────────────────┐      ┌─────────────────────────────────────┐
│         KEYCLOAK            │      │          ONEEATS DATABASE           │
│     (Authentification)      │      │       (Autorisation Metier)         │
├─────────────────────────────┤      ├─────────────────────────────────────┤
│                             │      │                                     │
│  Realm Roles :              │      │  Table `users` :                    │
│  ├── user (clients mobile)  │      │  ├── id UUID PK                     │
│  ├── restaurant (dashboard) │      │  ├── keycloak_id VARCHAR UNIQUE     │
│  └── admin (backoffice)     │      │  ├── email VARCHAR                  │
│                             │      │  └── role ENUM (existant)           │
│  Donnees stockees :         │      │                                     │
│  ├── sub (user ID)          │      │  Table `restaurant_staff` :         │
│  ├── email                  │      │  ├── id UUID PK                     │
│  ├── preferred_username     │      │  ├── user_id FK -> users            │
│  └── realm_access.roles[]   │      │  ├── restaurant_id FK -> restaurants│
│                             │      │  ├── staff_role ENUM                │
│                             │      │  │   (OWNER, MANAGER, STAFF)        │
│                             │      │  ├── permissions JSONB              │
│                             │      │  └── created_at TIMESTAMP           │
│                             │      │                                     │
└─────────────────────────────┘      └─────────────────────────────────────┘
```

**Flux d'autorisation :**
1. Keycloak authentifie l'utilisateur → JWT avec `realm_role`
2. Quarkus extrait `sub` (keycloak_id) du token
3. Quarkus charge le contexte metier depuis `restaurant_staff`
4. Decisions d'autorisation basees sur `staff_role` + `permissions`

**Permissions granulaires (JSONB) :**
```json
{
  "view_orders": true,
  "update_orders": true,
  "view_menu": true,
  "update_menu": true,
  "view_stats": true,
  "manage_staff": false
}
```

### 5. Double Authentification (2FA)

| Phase | Strategie |
|-------|-----------|
| **MVP** | 2FA desactive par defaut |
| **Post-MVP** | 2FA optionnel (utilisateur peut l'activer dans son profil) |
| **Implementation** | Keycloak OTP (TOTP via app authenticator) |

Keycloak supporte nativement :
- TOTP (Google Authenticator, Authy, etc.)
- WebAuthn (cles de securite, biometrie)

Activation post-MVP via `Authentication > Flows > Browser > OTP Form`.

### 6. Configuration Docker Keycloak

Ajout au `docker-compose.dev.yml` :
```yaml
keycloak:
  image: quay.io/keycloak/keycloak:24.0
  command: start-dev
  environment:
    KEYCLOAK_ADMIN: admin
    KEYCLOAK_ADMIN_PASSWORD: admin
    KC_DB: postgres
    KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
    KC_DB_USERNAME: oneeats
    KC_DB_PASSWORD: oneeats
  ports:
    - "8180:8080"
  depends_on:
    - postgres
```

### 7. Configuration Quarkus

```yaml
# application.yml
quarkus:
  oidc:
    auth-server-url: ${KEYCLOAK_URL:http://localhost:8180}/realms/oneeats
    client-id: oneeats-app
    credentials:
      secret: ${KEYCLOAK_CLIENT_SECRET:dev-secret}
    application-type: hybrid
    token:
      issuer: ${KEYCLOAK_URL:http://localhost:8180}/realms/oneeats
    roles:
      source: realm
```

## Consequences

### Positives
- **Flexibilite** : Social login + email sans code custom
- **Scalabilite** : Un utilisateur peut gerer N restaurants avec permissions differentes
- **Securite** : PKCE pour mobile, HttpOnly cookies pour web, tokens courts
- **UX** : Remember Me 30 jours, refresh silencieux
- **Evolutivite** : 2FA activable sans changement de code

### Negatives
- **Complexite operationnelle** : Keycloak a deployer et maintenir
- **Synchronisation** : Mapping keycloak_id <-> users a gerer
- **Latence initiale** : Premier login implique Keycloak + DB lookup

### Risques et Mitigations

| Risque | Mitigation |
|--------|------------|
| Keycloak down | Health check, fallback graceful degradation |
| Token vole | Duree courte (15min), HTTPS obligatoire, Secure cookies |
| Desynchronisation user | Event listener Keycloak → sync DB |

## Implementation Checklist

### Backend (Quarkus)
- [ ] Ajouter table `restaurant_staff` (migration Flyway)
- [ ] Ajouter colonne `keycloak_id` a `users`
- [ ] Creer `AuthService` pour mapping Keycloak → contexte metier
- [ ] Configurer `quarkus-oidc` mode hybrid
- [ ] Creer endpoint `/api/auth/me` (infos utilisateur + permissions)

### Keycloak
- [ ] Creer realm `oneeats`
- [ ] Configurer client `oneeats-app` (confidential)
- [ ] Configurer client `oneeats-mobile` (public, PKCE)
- [ ] Ajouter Identity Provider Google
- [ ] Configurer roles : user, restaurant, admin
- [ ] Configurer token lifespans

### Frontend Web
- [ ] Integrer `@react-keycloak/web` ou flux OIDC manuel
- [ ] Gerer refresh token automatique
- [ ] Proteger routes par role

### Mobile (Expo)
- [ ] Integrer `expo-auth-session` avec PKCE
- [ ] Stocker tokens dans `expo-secure-store`
- [ ] Implementer refresh en background
- [ ] Gerer Remember Me

## Status

**Accepted** (2026-01-15)

## References

- [ADR-001 — Authentification Keycloak](ADR-001-auth.md)
- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Quarkus OIDC Guide](https://quarkus.io/guides/security-oidc-code-flow-authentication)
- [OAuth 2.0 PKCE RFC 7636](https://datatracker.ietf.org/doc/html/rfc7636)
