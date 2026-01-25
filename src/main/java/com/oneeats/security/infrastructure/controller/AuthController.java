package com.oneeats.security.infrastructure.controller;

import com.oneeats.security.application.AuthService;
import com.oneeats.security.application.AuthService.CurrentUserDTO;
import com.oneeats.security.application.dto.RegisterRequestDTO;
import com.oneeats.security.application.dto.RegisterResponseDTO;
import com.oneeats.security.infrastructure.keycloak.KeycloakAdminService;
import com.oneeats.user.domain.model.UserStatus;
import com.oneeats.user.infrastructure.entity.UserEntity;
import com.oneeats.user.infrastructure.repository.JpaUserRepository;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Controller REST pour l'authentification.
 * Fournit les endpoints pour recuperer les informations de l'utilisateur connecte.
 *
 * Note: La connexion/deconnexion est geree directement par Keycloak.
 * Ce controller expose uniquement les informations de session.
 */
@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthController {

    private static final Logger LOG = Logger.getLogger(AuthController.class);

    @Inject
    AuthService authService;

    @Inject
    KeycloakAdminService keycloakAdminService;

    @Inject
    JpaUserRepository userRepository;

    /**
     * Inscription d'un nouvel utilisateur.
     * Cree l'utilisateur dans Keycloak et dans la base locale.
     * Retourne des tokens JWT pour authentification immediate.
     *
     * @param request Donnees d'inscription (firstName, lastName, email, password)
     * @return RegisterResponseDTO avec tokens JWT
     */
    @POST
    @Path("/register")
    @Transactional
    public Response register(@Valid RegisterRequestDTO request) {
        LOG.info("Registration attempt for: " + request.email());

        try {
            // Verifier si l'email existe deja en base locale
            if (userRepository.findEntityByEmail(request.email()).isPresent()) {
                LOG.warn("Email already exists in local DB: " + request.email());
                return Response.status(Response.Status.CONFLICT)
                    .entity(new ErrorResponse("email_exists", "Cet email est deja utilise"))
                    .build();
            }

            // Creer l'utilisateur dans Keycloak
            String keycloakUserId = keycloakAdminService.createUser(request);

            // Creer l'utilisateur en base locale
            UserEntity user = new UserEntity();
            user.setId(UUID.randomUUID());
            user.setKeycloakId(keycloakUserId);
            user.setEmail(request.email().toLowerCase().trim());
            user.setFirstName(request.firstName().trim());
            user.setLastName(request.lastName() != null ? request.lastName().trim() : "");
            user.setPasswordHash("keycloak_managed"); // Mot de passe gere par Keycloak
            user.setStatus(UserStatus.ACTIVE);
            user.setCreatedAt(LocalDateTime.now());
            userRepository.persist(user);

            LOG.info("User created successfully: " + user.getId());

            // Obtenir des tokens pour l'utilisateur nouvellement cree
            KeycloakAdminService.TokenResponse tokens = keycloakAdminService.getTokensForUser(
                request.email(),
                request.password()
            );

            return Response.status(Response.Status.CREATED)
                .entity(RegisterResponseDTO.of(
                    tokens.accessToken(),
                    tokens.refreshToken(),
                    tokens.expiresIn(),
                    user.getId().toString()
                ))
                .build();

        } catch (WebApplicationException e) {
            if (e.getMessage().equals("email_exists")) {
                return Response.status(Response.Status.CONFLICT)
                    .entity(new ErrorResponse("email_exists", "Cet email est deja utilise"))
                    .build();
            }
            LOG.error("Registration failed", e);
            return Response.status(e.getResponse().getStatus())
                .entity(new ErrorResponse("registration_failed", e.getMessage()))
                .build();
        } catch (Exception e) {
            LOG.error("Registration error", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse("server_error", "Une erreur est survenue lors de l'inscription"))
                .build();
        }
    }

    /**
     * Connexion avec email et mot de passe.
     * Authentifie via Keycloak et retourne des tokens JWT.
     *
     * @param request Donnees de connexion (email, password)
     * @return RegisterResponseDTO avec tokens JWT
     */
    @POST
    @Path("/login")
    public Response login(LoginRequestDTO request) {
        LOG.info("Login attempt for: " + request.email());

        try {
            // Obtenir des tokens depuis Keycloak
            KeycloakAdminService.TokenResponse tokens = keycloakAdminService.getTokensForUser(
                request.email(),
                request.password()
            );

            // Trouver l'utilisateur en base locale
            String userId = userRepository.findEntityByEmail(request.email())
                .map(user -> user.getId().toString())
                .orElse("");

            return Response.ok(RegisterResponseDTO.of(
                tokens.accessToken(),
                tokens.refreshToken(),
                tokens.expiresIn(),
                userId
            )).build();

        } catch (WebApplicationException e) {
            if (e.getMessage().equals("invalid_credentials")) {
                return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ErrorResponse("invalid_credentials", "Email ou mot de passe incorrect"))
                    .build();
            }
            LOG.error("Login failed", e);
            return Response.status(e.getResponse().getStatus())
                .entity(new ErrorResponse("login_failed", e.getMessage()))
                .build();
        } catch (Exception e) {
            LOG.error("Login error", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse("server_error", "Une erreur est survenue lors de la connexion"))
                .build();
        }
    }

    /**
     * Recupere les informations de l'utilisateur connecte.
     * Inclut les roles Keycloak et les permissions par restaurant.
     *
     * @return CurrentUserDTO avec toutes les informations utilisateur
     */
    @GET
    @Path("/me")
    @Authenticated
    public Response getCurrentUser() {
        CurrentUserDTO user = authService.getCurrentUserInfo();

        if (user == null) {
            return Response.status(Response.Status.UNAUTHORIZED)
                .entity(new ErrorResponse("Not authenticated"))
                .build();
        }

        return Response.ok(user).build();
    }

    /**
     * Verifie si l'utilisateur est authentifie.
     * Endpoint public pour verifier le statut d'authentification.
     *
     * @return true si authentifie, false sinon
     */
    @GET
    @Path("/status")
    public Response getAuthStatus() {
        CurrentUserDTO user = authService.getCurrentUserInfo();
        return Response.ok(new AuthStatusResponse(user != null, user != null ? user.email() : null)).build();
    }

    /**
     * Verifie si l'utilisateur a acces a un restaurant specifique.
     *
     * @param restaurantId ID du restaurant
     * @return true si l'utilisateur a acces, false sinon
     */
    @GET
    @Path("/access/restaurant/{restaurantId}")
    @Authenticated
    public Response checkRestaurantAccess(@PathParam("restaurantId") String restaurantId) {
        try {
            java.util.UUID uuid = java.util.UUID.fromString(restaurantId);
            boolean hasAccess = authService.hasAccessToRestaurant(uuid);

            return Response.ok(new RestaurantAccessResponse(
                restaurantId,
                hasAccess,
                authService.getStaffRoleForRestaurant(uuid).map(Enum::name).orElse(null)
            )).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(new ErrorResponse("Invalid restaurant ID"))
                .build();
        }
    }

    /**
     * Recupere la liste des restaurants accessibles par l'utilisateur.
     *
     * @return Liste des restaurants avec roles et permissions
     */
    @GET
    @Path("/restaurants")
    @Authenticated
    public Response getUserRestaurants() {
        CurrentUserDTO user = authService.getCurrentUserInfo();

        if (user == null) {
            return Response.status(Response.Status.UNAUTHORIZED)
                .entity(new ErrorResponse("Not authenticated"))
                .build();
        }

        return Response.ok(user.restaurants()).build();
    }

    /**
     * Met a jour le token push de l'utilisateur connecte.
     * Permet de recevoir les notifications push sur mobile.
     *
     * @param request Token Expo Push (format: ExponentPushToken[xxx])
     * @return Success ou erreur
     */
    @PUT
    @Path("/push-token")
    @Authenticated
    @Transactional
    public Response updatePushToken(UpdatePushTokenRequest request) {
        LOG.info("Push token update request received");

        if (request == null || request.pushToken() == null || request.pushToken().trim().isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(new ErrorResponse("invalid_token", "Le token push est requis"))
                .build();
        }

        try {
            // Recuperer l'utilisateur connecte
            CurrentUserDTO currentUser = authService.getCurrentUserInfo();
            if (currentUser == null) {
                return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ErrorResponse("not_authenticated", "Utilisateur non authentifie"))
                    .build();
            }

            // Trouver l'utilisateur en base
            var userOpt = userRepository.findEntityByEmail(currentUser.email());
            if (userOpt.isEmpty()) {
                return Response.status(Response.Status.NOT_FOUND)
                    .entity(new ErrorResponse("user_not_found", "Utilisateur non trouve"))
                    .build();
            }

            // Mettre a jour le token push
            UserEntity user = userOpt.get();
            user.updatePushToken(request.pushToken().trim());
            userRepository.persist(user);

            LOG.info("Push token updated for user: " + user.getId());

            return Response.ok(new PushTokenResponse(
                true,
                "Token push mis a jour avec succes",
                user.getId().toString()
            )).build();

        } catch (Exception e) {
            LOG.error("Error updating push token", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse("server_error", "Erreur lors de la mise a jour du token"))
                .build();
        }
    }

    /**
     * Supprime le token push de l'utilisateur (deconnexion mobile).
     */
    @DELETE
    @Path("/push-token")
    @Authenticated
    @Transactional
    public Response deletePushToken() {
        LOG.info("Push token delete request received");

        try {
            CurrentUserDTO currentUser = authService.getCurrentUserInfo();
            if (currentUser == null) {
                return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ErrorResponse("not_authenticated", "Utilisateur non authentifie"))
                    .build();
            }

            var userOpt = userRepository.findEntityByEmail(currentUser.email());
            if (userOpt.isEmpty()) {
                return Response.status(Response.Status.NOT_FOUND)
                    .entity(new ErrorResponse("user_not_found", "Utilisateur non trouve"))
                    .build();
            }

            UserEntity user = userOpt.get();
            user.setPushToken(null);
            user.setPushTokenUpdatedAt(null);
            userRepository.persist(user);

            LOG.info("Push token deleted for user: " + user.getId());

            return Response.ok(new PushTokenResponse(
                true,
                "Token push supprime avec succes",
                user.getId().toString()
            )).build();

        } catch (Exception e) {
            LOG.error("Error deleting push token", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse("server_error", "Erreur lors de la suppression du token"))
                .build();
        }
    }

    // DTOs pour les reponses

    public record ErrorResponse(String error, String message) {
        public ErrorResponse(String message) {
            this("error", message);
        }
    }

    public record LoginRequestDTO(String email, String password) {}

    public record AuthStatusResponse(boolean authenticated, String email) {}

    public record RestaurantAccessResponse(
        String restaurantId,
        boolean hasAccess,
        String role
    ) {}

    public record UpdatePushTokenRequest(String pushToken) {}

    public record PushTokenResponse(boolean success, String message, String userId) {}
}
