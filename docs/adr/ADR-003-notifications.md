# ADR-003 — Notifications temps réel (WebSocket + push Expo)

## Contexte
- PRD et `API_SPECS.md` prévoient notifications (order created/status changed) via WebSocket et push mobile.
- Front web doit remplacer les mocks par temps réel; mobile utilise Expo/FCM.

## Décision
- Exposer un endpoint WebSocket `/ws/notifications` authentifié (token JWT) pour web (restaurant/admin).
- Événements : `order.created`, `order.status.changed`, `order.cancelled`; payload minimal (id, status, timestamps, restaurantId).
- Mobile : notifications push via Expo/FCM; WebSocket mobile optionnel (v2) ; fallback polling `/api/notifications` pour unread/count.

## Conséquences
- Nécessite une couche d’abstraction d’événements (Order events) dans le backend, avec publication WS + push.
- Auth sur WS obligatoire (vérifier token à l’upgrade), scope par restaurant/admin.
- Ajout d’un store notifications (table) pour historique/unread-count.

## Actions
- Implémenter WS sécurisé + broadcast par restaurant/admin.
- Intégrer Expo push service côté backend (ou worker) avec tokens device mobile.
- Ajouter endpoints REST pour l’historique notifications et unread-count (déjà dans `API_SPECS.md`).
- Tests : e2e sur changement de statut, auth WS, fallback polling.

## Status
Accepted (2026-01-14)

