# Story 7.1: CRUD Utilisateurs Admin

Status: ready-for-dev

## Story

As an admin,
I want to manage user accounts with search, filters, and pagination,
So that I can handle user issues and maintain the user base.

## Acceptance Criteria

### AC-1: Liste paginee des utilisateurs
**Given** I am an authenticated admin
**When** I GET /api/admin/users with pagination parameters (page, size)
**Then** I receive a paginated list of users
**And** the response includes totalElements, totalPages, currentPage

### AC-2: Recherche par terme
**Given** I am an authenticated admin
**When** I GET /api/admin/users?search=john
**Then** I receive users matching "john" in firstName, lastName, or email

### AC-3: Filtre par role
**Given** I am an authenticated admin
**When** I GET /api/admin/users?role=CLIENT
**Then** I receive only users with role CLIENT

### AC-4: Filtre par statut
**Given** I am an authenticated admin
**When** I GET /api/admin/users?status=ACTIVE
**Then** I receive only users with status ACTIVE

### AC-5: Mise a jour utilisateur
**Given** I am an authenticated admin
**When** I PUT /api/admin/users/{id} with updated data
**Then** the user information is updated
**And** email uniqueness is validated
**And** I receive the updated user

### AC-6: Changement de statut utilisateur
**Given** I am an authenticated admin
**When** I PATCH /api/admin/users/{id}/status with new status
**Then** the user status changes (ACTIVE, SUSPENDED, INACTIVE)
**And** I receive the updated user

### AC-7: Details utilisateur
**Given** I am an authenticated admin
**When** I GET /api/admin/users/{id}
**Then** I receive complete user details including order history summary

## Tasks / Subtasks

- [ ] Task 1: Creer AdminUserController (AC: 1-7)
  - [ ] 1.1 Creer le controller sur /api/admin/users
  - [ ] 1.2 Ajouter annotation @RolesAllowed(Roles.ADMIN) (temporairement commentee jusqu'a Epic 1)
  - [ ] 1.3 Implementer GET avec pagination (page, size, sort)

- [ ] Task 2: Implementer recherche et filtres (AC: 2-4)
  - [ ] 2.1 Creer AdminUserQuery avec champs search, role, status
  - [ ] 2.2 Creer AdminUserQueryHandler
  - [ ] 2.3 Ajouter methodes repository: findBySearchTerm, findByRole, findByStatus
  - [ ] 2.4 Implementer pagination avec Panache

- [ ] Task 3: Implementer endpoints CRUD admin (AC: 5-7)
  - [ ] 3.1 PUT /api/admin/users/{id} - update complet
  - [ ] 3.2 PATCH /api/admin/users/{id}/status - changement statut
  - [ ] 3.3 GET /api/admin/users/{id} - details avec stats

- [ ] Task 4: Creer DTOs admin specifiques
  - [ ] 4.1 AdminUserDTO (avec role, orderCount, lastOrderDate)
  - [ ] 4.2 AdminUserListDTO (version allege pour liste)
  - [ ] 4.3 UpdateAdminUserRequest
  - [ ] 4.4 PagedResponse<T> generique

- [ ] Task 5: Tests
  - [ ] 5.1 Tests unitaires AdminUserQueryHandler
  - [ ] 5.2 Tests integration AdminUserController
  - [ ] 5.3 Verifier validation email unique

## Dev Notes

### Architecture existante a suivre

Le domaine `user` existe deja avec architecture hexagonale complete:

```
src/main/java/com/oneeats/user/
├── api/                         # NON UTILISE - utiliser application/
├── application/
│   ├── command/                 # CQRS Commands
│   │   ├── CreateUserCommand.java
│   │   ├── UpdateUserCommand.java
│   │   ├── DeleteUserCommand.java
│   │   └── UpdateUserStatusCommand.java
│   ├── dto/
│   │   └── UserDTO.java
│   ├── mapper/
│   │   └── UserApplicationMapper.java
│   └── query/                   # CQRS Queries
│       ├── GetAllUsersQuery.java
│       └── GetUserQuery.java
├── domain/
│   ├── model/
│   │   ├── User.java           # Aggregate root
│   │   └── UserStatus.java     # ACTIVE, INACTIVE, SUSPENDED
│   ├── repository/
│   │   └── IUserRepository.java
│   ├── service/
│   │   └── UserDomainService.java
│   └── specification/
│       └── UniqueEmailSpecification.java
└── infrastructure/
    ├── entity/
    │   └── UserEntity.java
    ├── mapper/
    │   └── UserInfrastructureMapper.java
    ├── repository/
    │   └── JpaUserRepository.java
    └── web/
        └── UserController.java  # Endpoint /api/users (NON admin)
```

### Endpoints existants vs nouveaux

| Existant | Nouveau (Admin) |
|----------|-----------------|
| GET /api/users | GET /api/admin/users (+ pagination, search, filters) |
| GET /api/users/{id} | GET /api/admin/users/{id} (+ stats) |
| PUT /api/users/{id} | PUT /api/admin/users/{id} |
| PATCH /api/users/{id}/status | PATCH /api/admin/users/{id}/status |

### Pattern de pagination Quarkus/Panache

```java
// Dans le repository
public PanacheQuery<UserEntity> findWithFilters(String search, String role, UserStatus status) {
    StringBuilder query = new StringBuilder("1=1");
    Map<String, Object> params = new HashMap<>();

    if (search != null && !search.isBlank()) {
        query.append(" and (lower(firstName) like :search or lower(lastName) like :search or lower(email) like :search)");
        params.put("search", "%" + search.toLowerCase() + "%");
    }
    // ... autres filtres

    return find(query.toString(), params);
}

// Dans le controller
@GET
public Response getUsers(
    @QueryParam("page") @DefaultValue("0") int page,
    @QueryParam("size") @DefaultValue("20") int size,
    @QueryParam("search") String search,
    @QueryParam("role") String role,
    @QueryParam("status") UserStatus status
) {
    PanacheQuery<UserEntity> query = repository.findWithFilters(search, role, status);
    List<UserEntity> users = query.page(page, size).list();
    long total = query.count();

    return Response.ok(new PagedResponse<>(users, page, size, total)).build();
}
```

### UserStatus existant

```java
public enum UserStatus {
    ACTIVE,      // Utilisateur actif, peut commander
    INACTIVE,    // Compte desactive (peut etre supprime)
    SUSPENDED    // Compte suspendu temporairement
}
```

### Roles definis (com.oneeats.security.Roles)

```java
public static final String ADMIN = "admin";
public static final String USER = "user";           // = CLIENT
public static final String RESTAURANT = "restaurant";
public static final String RESTAURANT_MANAGER = "restaurant_manager";
public static final String SUPPORT = "support";
```

**Note**: Le role "CLIENT" dans les specs correspond a "USER" dans le code.

### Validation email unique

Utiliser la specification existante:
```java
@Inject UniqueEmailSpecification uniqueEmailSpec;

// Dans le handler
if (!uniqueEmailSpec.isSatisfiedBy(user)) {
    throw new ValidationException("Email already exists");
}
```

### Project Structure Notes

- **Nouveau controller**: `user/infrastructure/web/AdminUserController.java`
- **Nouveaux DTOs**: `user/application/dto/AdminUserDTO.java`, `PagedResponse.java`
- **Nouvelle query**: `user/application/query/AdminUserQuery.java`
- **Extension repository**: Ajouter methodes dans `IUserRepository` et `JpaUserRepository`

### References

- [Source: docs/product/epics-and-stories.md#Epic 7]
- [Source: docs/architecture/architecture.md#C4 Component View]
- [Source: docs/api/API_SPECS.md#Admin Endpoints]
- [Source: src/main/java/com/oneeats/user/infrastructure/web/UserController.java]
- [Source: src/main/java/com/oneeats/user/domain/model/User.java]

## Dev Agent Record

### Agent Model Used

(A remplir par dev-story)

### Debug Log References

(A remplir pendant implementation)

### Completion Notes List

(A remplir apres implementation)

### File List

Files a creer/modifier:
- [ ] `src/main/java/com/oneeats/user/infrastructure/web/AdminUserController.java` (NEW)
- [ ] `src/main/java/com/oneeats/user/application/dto/AdminUserDTO.java` (NEW)
- [ ] `src/main/java/com/oneeats/user/application/dto/AdminUserListDTO.java` (NEW)
- [ ] `src/main/java/com/oneeats/user/application/dto/PagedResponse.java` (NEW)
- [ ] `src/main/java/com/oneeats/user/application/query/AdminUserQuery.java` (NEW)
- [ ] `src/main/java/com/oneeats/user/application/query/AdminUserQueryHandler.java` (NEW)
- [ ] `src/main/java/com/oneeats/user/domain/repository/IUserRepository.java` (MODIFY)
- [ ] `src/main/java/com/oneeats/user/infrastructure/repository/JpaUserRepository.java` (MODIFY)
- [ ] `src/test/java/com/oneeats/integration/AdminUserControllerTest.java` (NEW)
- [ ] `src/test/java/com/oneeats/unit/user/application/AdminUserQueryHandlerTest.java` (NEW)
