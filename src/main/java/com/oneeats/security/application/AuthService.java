package com.oneeats.security.application;

import com.oneeats.security.infrastructure.entity.RestaurantStaffEntity;
import com.oneeats.security.infrastructure.repository.JpaRestaurantStaffRepository;
import com.oneeats.user.infrastructure.entity.UserEntity;
import com.oneeats.user.infrastructure.repository.JpaUserRepository;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Instance;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.eclipse.microprofile.jwt.JsonWebToken;

import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotAuthorizedException;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service d'authentification et d'autorisation.
 * Fait le lien entre Keycloak (authentification) et la base de donnees (autorisations metier).
 */
@ApplicationScoped
public class AuthService {

    @Inject
    SecurityIdentity securityIdentity;

    @Inject
    Instance<JsonWebToken> jwtInstance;

    @Inject
    JpaUserRepository userRepository;

    @Inject
    JpaRestaurantStaffRepository staffRepository;

    /**
     * Recupere le JWT si disponible (OIDC active)
     */
    private Optional<JsonWebToken> getJwt() {
        if (jwtInstance.isResolvable()) {
            return Optional.of(jwtInstance.get());
        }
        return Optional.empty();
    }

    /**
     * Recupere l'utilisateur courant depuis le token JWT.
     * Si l'utilisateur n'existe pas en base, le cree automatiquement (premier login).
     * Si l'utilisateur existe deja avec le meme email mais sans keycloak_id, lie le compte.
     */
    @Transactional
    public Optional<UserEntity> getCurrentUser() {
        if (securityIdentity.isAnonymous()) {
            return Optional.empty();
        }

        Optional<JsonWebToken> jwtOpt = getJwt();
        if (jwtOpt.isEmpty()) {
            return Optional.empty();
        }

        String keycloakId = jwtOpt.get().getSubject();
        if (keycloakId == null) {
            return Optional.empty();
        }

        // 1. Chercher par keycloak_id (utilisateur deja lie)
        Optional<UserEntity> user = userRepository.findByKeycloakId(keycloakId);

        if (user.isEmpty()) {
            // 2. Chercher par email (utilisateur existant non lie)
            String email = getClaimAsString("email");
            if (email != null) {
                user = userRepository.findEntityByEmail(email);
                if (user.isPresent()) {
                    // Lier le compte Keycloak a l'utilisateur existant
                    UserEntity existingUser = user.get();
                    existingUser.setKeycloakId(keycloakId);
                    userRepository.persist(existingUser);
                    return user;
                }
            }

            // 3. Premier login - creer l'utilisateur depuis les claims Keycloak
            user = Optional.of(createUserFromKeycloak(keycloakId));
        }

        return user;
    }

    /**
     * Cree un nouvel utilisateur en base depuis les informations Keycloak
     */
    @Transactional
    public UserEntity createUserFromKeycloak(String keycloakId) {
        UserEntity user = new UserEntity();
        user.setId(UUID.randomUUID());
        user.setKeycloakId(keycloakId);
        user.setEmail(getClaimAsString("email"));
        user.setFirstName(getClaimAsString("given_name", "Utilisateur"));
        user.setLastName(getClaimAsString("family_name", ""));
        user.setPasswordHash("keycloak_managed"); // Mot de passe gere par Keycloak
        user.setStatus(com.oneeats.user.domain.model.UserStatus.ACTIVE);
        user.setCreatedAt(java.time.LocalDateTime.now());

        userRepository.persist(user);
        return user;
    }

    /**
     * Recupere les roles Keycloak de l'utilisateur courant
     */
    public Set<String> getCurrentUserRoles() {
        return securityIdentity.getRoles();
    }

    /**
     * Verifie si l'utilisateur courant a un role specifique
     */
    public boolean hasRole(String role) {
        return securityIdentity.hasRole(role);
    }

    /**
     * Recupere les restaurants geres par l'utilisateur courant
     */
    public List<RestaurantStaffEntity> getCurrentUserRestaurants() {
        return getCurrentUser()
            .map(user -> staffRepository.findByUserId(user.getId()))
            .orElse(List.of());
    }

    /**
     * Verifie si l'utilisateur courant a acces a un restaurant
     */
    public boolean hasAccessToRestaurant(UUID restaurantId) {
        return getCurrentUser()
            .map(user -> staffRepository.hasAccessToRestaurant(user.getId(), restaurantId))
            .orElse(false);
    }

    /**
     * Exige que l'utilisateur courant ait acces au restaurant.
     * Lance ForbiddenException si l'acces est refuse.
     *
     * @param restaurantId ID du restaurant
     * @throws ForbiddenException si l'utilisateur n'a pas acces
     */
    public void requireRestaurantAccess(UUID restaurantId) {
        if (!hasAccessToRestaurant(restaurantId)) {
            throw new ForbiddenException("Acces refuse a ce restaurant");
        }
    }

    /**
     * Exige un utilisateur authentifie et retourne son entite.
     * Lance NotAuthorizedException si non authentifie.
     *
     * @return UserEntity de l'utilisateur courant
     * @throws NotAuthorizedException si l'utilisateur n'est pas authentifie
     */
    public UserEntity requireCurrentUser() {
        return getCurrentUser()
            .orElseThrow(() -> new NotAuthorizedException("Authentification requise"));
    }

    /**
     * Verifie si l'utilisateur courant est le proprietaire de la ressource.
     *
     * @param userId ID de l'utilisateur proprietaire
     * @return true si l'utilisateur courant est le proprietaire
     */
    public boolean isCurrentUser(UUID userId) {
        return getCurrentUser()
            .map(user -> user.getId().equals(userId))
            .orElse(false);
    }

    /**
     * Exige que l'utilisateur courant soit le proprietaire de la ressource.
     *
     * @param userId ID de l'utilisateur proprietaire
     * @throws ForbiddenException si l'utilisateur n'est pas le proprietaire
     */
    public void requireCurrentUser(UUID userId) {
        if (!isCurrentUser(userId)) {
            throw new ForbiddenException("Acces refuse a cette ressource");
        }
    }

    /**
     * Recupere le role de l'utilisateur courant pour un restaurant
     */
    public Optional<RestaurantStaffEntity.StaffRole> getStaffRoleForRestaurant(UUID restaurantId) {
        return getCurrentUser()
            .flatMap(user -> staffRepository.findByUserIdAndRestaurantId(user.getId(), restaurantId))
            .map(RestaurantStaffEntity::getStaffRole);
    }

    /**
     * Verifie si l'utilisateur courant peut gerer le menu d'un restaurant
     */
    public boolean canManageMenu(UUID restaurantId) {
        return getStaffRoleForRestaurant(restaurantId)
            .map(role -> role == RestaurantStaffEntity.StaffRole.OWNER ||
                         role == RestaurantStaffEntity.StaffRole.MANAGER)
            .orElse(false);
    }

    /**
     * Verifie si l'utilisateur courant peut gerer le staff d'un restaurant
     */
    public boolean canManageStaff(UUID restaurantId) {
        return getStaffRoleForRestaurant(restaurantId)
            .map(role -> role == RestaurantStaffEntity.StaffRole.OWNER)
            .orElse(false);
    }

    /**
     * Ajoute un membre au staff d'un restaurant
     */
    @Transactional
    public RestaurantStaffEntity addStaffMember(UUID userId, UUID restaurantId, RestaurantStaffEntity.StaffRole role) {
        // Verifier que l'association n'existe pas deja
        Optional<RestaurantStaffEntity> existing = staffRepository.findByUserIdAndRestaurantId(userId, restaurantId);
        if (existing.isPresent()) {
            throw new IllegalStateException("User is already a staff member of this restaurant");
        }

        RestaurantStaffEntity staff = new RestaurantStaffEntity(userId, restaurantId, role);
        staffRepository.persist(staff);
        return staff;
    }

    /**
     * Construit le DTO des informations utilisateur courantes
     */
    public CurrentUserDTO getCurrentUserInfo() {
        Optional<UserEntity> userOpt = getCurrentUser();

        if (userOpt.isEmpty()) {
            return null;
        }

        UserEntity user = userOpt.get();
        List<RestaurantStaffEntity> restaurants = staffRepository.findByUserId(user.getId());

        return new CurrentUserDTO(
            user.getId().toString(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getFirstName() + " " + user.getLastName(),
            getCurrentUserRoles(),
            restaurants.stream()
                .map(r -> new RestaurantAccessDTO(
                    r.getRestaurantId().toString(),
                    r.getStaffRole().name(),
                    r.getPermissions()
                ))
                .collect(Collectors.toList())
        );
    }

    // Helper pour extraire un claim du JWT
    private String getClaimAsString(String claimName) {
        return getClaimAsString(claimName, null);
    }

    private String getClaimAsString(String claimName, String defaultValue) {
        try {
            Optional<JsonWebToken> jwtOpt = getJwt();
            if (jwtOpt.isEmpty()) {
                return defaultValue;
            }
            Object claim = jwtOpt.get().getClaim(claimName);
            return claim != null ? claim.toString() : defaultValue;
        } catch (Exception e) {
            return defaultValue;
        }
    }

    /**
     * DTO pour les informations de l'utilisateur courant
     */
    public record CurrentUserDTO(
        String id,
        String email,
        String firstName,
        String lastName,
        String fullName,
        Set<String> roles,
        List<RestaurantAccessDTO> restaurants
    ) {}

    /**
     * DTO pour l'acces a un restaurant
     */
    public record RestaurantAccessDTO(
        String restaurantId,
        String role,
        String permissions
    ) {}
}
