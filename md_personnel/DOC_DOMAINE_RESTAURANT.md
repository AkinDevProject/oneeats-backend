# Documentation du Domaine Restaurant

## Rôle
Le domaine Restaurant gère l’enregistrement, la modification, la validation et la gestion des informations publiques des restaurants sur la plateforme.

## Entités principales
- **Restaurant** : informations du restaurant (id, nom, description, adresse, téléphone, email, horaires, statut validation, propriétaire)
- **Adresse** (ValueObject) : rue, ville, code postal, pays

## Cas d’usage principaux
- Création et modification d’un restaurant
- Validation ou refus d’un restaurant par un administrateur
- Consultation des informations publiques d’un restaurant

## Interfaces exposées (ports)
- **RestaurantRepository** : CRUD restaurant
- **ValidationService** : gestion du statut de validation

## Exemples de scénarios
- Un restaurateur propose son établissement, un admin le valide ou le refuse.
- Un client consulte la fiche d’un restaurant validé.

## Structure technique (exemple)
```
restaurant/
├── api/
│   ├── interface/         # RestaurantRepository, ValidationService
│   ├── model/             # RestaurantDto
│   ├── cqrs/command/      # CreateRestaurantCommand, UpdateRestaurantCommand
├── internal/
│   ├── entity/            # Restaurant
│   ├── valueobject/       # Adresse
│   ├── application/       # Use cases (CreateRestaurantUseCase, ...)
│   ├── mapper/            # RestaurantMapper
│   ├── client/            # InMemoryRestaurantRepository
├── adapter/web/           # RestaurantResource (REST)
```

## Bonnes pratiques
- Ne jamais exposer l’entité Restaurant directement : toujours passer par RestaurantDto.
- Utiliser les Value Objects pour la validation forte (Adresse).
- Séparer les responsabilités entre les couches (api, internal, application, client, adapter).
- Documenter chaque classe et méthode clé avec JavaDoc.

---

*Document généré automatiquement pour faciliter la compréhension et la maintenance du domaine Restaurant.*

