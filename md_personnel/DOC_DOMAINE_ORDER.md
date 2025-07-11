# Documentation du Domaine Order (Commande)

## Rôle
Le domaine Order gère la création, la modification, le suivi et la suppression des commandes passées par les clients auprès des restaurants.

## Entités principales
- **Order (Commande)** : id, client (User), restaurant, liste des items (OrderItem), statut, mode, dates
- **OrderItem** : id, menuItem (Plat), quantité, prix unitaire

## Cas d’usage principaux
- Création d’une commande par un client
- Modification ou annulation d’une commande
- Suivi du statut de la commande (PENDING, ACCEPTED, REJECTED, COMPLETED)
- Consultation de l’historique des commandes

## Interfaces exposées (ports)
- **OrderRepository** : CRUD des commandes

## Exemples de scénarios
- Un client passe une commande à emporter dans un restaurant.
- Un restaurateur accepte ou refuse une commande.
- Un client consulte l’historique de ses commandes.

## Structure technique (exemple)
```
order/
├── api/
│   ├── interface/         # OrderRepository
│   ├── model/             # OrderDto, OrderItemDto
│   ├── cqrs/command/      # CreateOrderCommand, UpdateOrderCommand
├── internal/
│   ├── entity/            # Order, OrderItem
│   ├── application/       # Use cases (CreateOrderUseCase, ...)
│   ├── mapper/            # OrderMapper
│   ├── client/            # InMemoryOrderRepository
├── adapter/web/           # OrderResource (REST)
```

## Bonnes pratiques
- Ne jamais exposer l’entité Order directement : toujours passer par OrderDto.
- Séparer les responsabilités entre les couches (api, internal, application, client, adapter).
- Documenter chaque classe et méthode clé avec JavaDoc.

---

*Document généré automatiquement pour faciliter la compréhension et la maintenance du domaine Order.*

