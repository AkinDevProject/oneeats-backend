# Documentation du Domaine Admin

## Rôle
Le domaine Admin gère la supervision, la gestion des utilisateurs, la validation des restaurants et le suivi global de la plateforme.

## Entités principales
- **Admin** : id, nom, prénom, email, statut

## Cas d’usage principaux
- Création, modification, suppression d’un administrateur
- Validation ou refus de restaurants
- Consultation de la liste des utilisateurs, restaurants, commandes
- Suivi des statistiques globales

## Interfaces exposées (ports)
- **AdminRepository** : gestion des administrateurs
- **AdminService** : fonctionnalités d’administration globale

## Exemples de scénarios
- Un admin valide un nouveau restaurant.
- Un admin suspend un utilisateur ou un restaurant.
- Un admin consulte les statistiques de la plateforme.

## Structure technique (exemple)
```
admin/
├── api/
│   ├── interface/         # AdminRepository, AdminService
│   ├── model/             # AdminDto
│   ├── cqrs/command/      # CreateAdminCommand, UpdateAdminCommand
├── internal/
│   ├── entity/            # Admin
│   ├── application/       # Use cases (CreateAdminUseCase, ...)
│   ├── mapper/            # AdminMapper
│   ├── client/            # InMemoryAdminRepository
├── adapter/web/           # AdminResource (REST)
```

## Bonnes pratiques
- Ne jamais exposer l’entité Admin directement : toujours passer par AdminDto.
- Séparer les responsabilités entre les couches (api, internal, application, client, adapter).
- Documenter chaque classe et méthode clé avec JavaDoc.

---

*Document généré automatiquement pour faciliter la compréhension et la maintenance du domaine Admin.*

