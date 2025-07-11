# Documentation du Domaine User

## Rôle
Le domaine User gère l’inscription, l’authentification, la gestion des rôles et le profil utilisateur (client, restaurateur, administrateur).

## Entités principales
- **User** : représente un utilisateur de la plateforme (client, restaurateur, admin).
    - id (UUID)
    - nom, prénom
    - email
    - mot de passe (hashé)
    - rôle (CLIENT, RESTAURANT, ADMIN)
    - date création, statut (actif, suspendu)

## Cas d’usage principaux
- Inscription d’un nouvel utilisateur
- Authentification (login/logout)
- Modification du profil utilisateur
- Gestion des rôles et permissions
- Suppression d’un utilisateur

## Interfaces exposées (ports)
- **UserRepository** : CRUD utilisateur
- **AuthService** : inscription, login, logout, validation

## Objets valeur
- **Email** : encapsule la validation et la normalisation d’une adresse email
- **MotDePasse** : encapsule le hash et la validation du mot de passe

## Exemples de scénarios
- Un client s’inscrit avec son email, reçoit un email de validation, puis se connecte.
- Un restaurateur modifie son profil et change son mot de passe.
- Un administrateur suspend un utilisateur pour non-respect des règles.

## Structure technique (exemple)
```
user/
├── api/
│   ├── interface/         # UserRepository, AuthService
│   ├── model/             # UserDto
│   ├── cqrs/command/      # CreateUserCommand, UpdateUserCommand
│   ├── cqrs/query/        # GetUserByIdQuery, GetAllUsersQuery
├── internal/
│   ├── entity/            # User
│   ├── valueobject/       # Email, MotDePasse
│   ├── application/       # Use cases (CreateUserUseCase, ...)
│   ├── mapper/            # UserMapper
│   ├── client/            # InMemoryUserRepository
├── adapter/web/           # UserResource (REST)
```

## Bonnes pratiques
- Ne jamais exposer l’entité User directement : toujours passer par UserDto.
- Utiliser les Value Objects pour la validation forte (Email, MotDePasse).
- Séparer les responsabilités entre les couches (api, internal, application, client, adapter).
- Documenter chaque classe et méthode clé avec JavaDoc.

---

*Document généré automatiquement pour faciliter la compréhension et la maintenance du domaine User.*

