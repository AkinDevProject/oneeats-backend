# ADR-001 — Authentification (Keycloak + JWT Resource Server)

## Contexte
- PRD requiert auth/autorisation par rôles CLIENT/RESTAURANT/ADMIN.
- `API_SPECS.md` liste endpoints /auth/login|refresh|logout|me.
- Roadmap Phase 3 sécurité : implémentation JWT.
- Stack actuelle : Quarkus 3.x, Keycloak déjà configuré (doc) mais non intégré côté code.

## Décision
- Utiliser Keycloak comme fournisseur OIDC/JWT. Quarkus agit en resource server (validation tokens) et délègue l’UI login/registration à Keycloak (flux standard).
- Rôles normalisés : `ROLE_CLIENT`, `ROLE_RESTAURANT`, `ROLE_ADMIN` mappés depuis les realm/client roles Keycloak vers le SecurityContext Quarkus.
- Endpoints sécurisés par rôle via annotations/permissions; `/api/auth/login` peut servir de proxy token si nécessaire, sinon on s’appuie sur Keycloak direct.
- Refresh token géré par Keycloak; si proxy backend requis, exposer `/api/auth/refresh` qui relaie vers Keycloak.

## Conséquences
- Alignement front/back : front obtient les tokens depuis Keycloak; les appels API incluent Authorization: Bearer <access_token>.
- À implémenter : config OIDC Quarkus (issuer, client-id, jwks), mappers rôle, guards sur endpoints.
- Tester : flux happy-path, token expiré, rôles interdits, CORS.

## Status
Accepted (2026-01-14)

