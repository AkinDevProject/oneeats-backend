# Documentation du Domaine Notification

## Rôle
Le domaine Notification gère l’envoi, la consultation, la suppression et le suivi des notifications envoyées aux utilisateurs (clients, restaurateurs, admins).

## Entités principales
- **Notification** : id, destinataireId, type, message, dateEnvoi, lu

## Cas d’usage principaux
- Envoi d’une notification à un utilisateur (nouvelle commande, changement de statut…)
- Consultation des notifications reçues
- Marquage d’une notification comme lue
- Suppression d’une notification

## Interfaces exposées (ports)
- **NotificationService** : gestion des notifications (envoi, lecture, suppression)

## Exemples de scénarios
- Un restaurateur reçoit une notification pour une nouvelle commande.
- Un client reçoit une notification lors du changement de statut de sa commande.

## Structure technique (exemple)
```
notification/
├── api/
│   ├── interface/         # NotificationService
│   ├── model/             # NotificationDto
│   ├── cqrs/command/      # SendNotificationCommand, MarkNotificationAsReadCommand
├── internal/
│   ├── entity/            # Notification
│   ├── application/       # Use cases (SendNotificationUseCase, ...)
│   ├── mapper/            # NotificationMapper
│   ├── client/            # InMemoryNotificationRepository
├── adapter/web/           # NotificationResource (REST)
```

## Bonnes pratiques
- Ne jamais exposer l’entité Notification directement : toujours passer par NotificationDto.
- Séparer les responsabilités entre les couches (api, internal, application, client, adapter).
- Documenter chaque classe et méthode clé avec JavaDoc.

---

*Document généré automatiquement pour faciliter la compréhension et la maintenance du domaine Notification.*

