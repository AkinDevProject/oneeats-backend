# Documentation du Domaine Menu

## Rôle
Le domaine Menu gère la création, la modification, l’activation/désactivation et la consultation des plats proposés par les restaurants.

## Entités principales
- **MenuItem (Plat)** : id, nom, description, prix, disponible, catégorie, restaurant (référence)

## Cas d’usage principaux
- Ajout, modification et suppression d’un plat
- Activation/désactivation d’un plat
- Consultation de la carte d’un restaurant

## Interfaces exposées (ports)
- **MenuRepository** : CRUD des plats

## Exemples de scénarios
- Un restaurateur ajoute un nouveau plat à sa carte.
- Un client consulte la liste des plats disponibles d’un restaurant.

## Structure technique (exemple)
```
menu/
├── api/
│   ├── interface/         # MenuRepository
│   ├── model/             # MenuItemDto
│   ├── cqrs/command/      # CreateMenuItemCommand, UpdateMenuItemCommand
├── internal/
│   ├── entity/            # MenuItem
│   ├── application/       # Use cases (CreateMenuItemUseCase, ...)
│   ├── mapper/            # MenuItemMapper
│   ├── client/            # InMemoryMenuRepository
├── adapter/web/           # MenuResource (REST)
```

## Bonnes pratiques
- Ne jamais exposer l’entité MenuItem directement : toujours passer par MenuItemDto.
- Séparer les responsabilités entre les couches (api, internal, application, client, adapter).
- Documenter chaque classe et méthode clé avec JavaDoc.

---

*Document généré automatiquement pour faciliter la compréhension et la maintenance du domaine Menu.*


