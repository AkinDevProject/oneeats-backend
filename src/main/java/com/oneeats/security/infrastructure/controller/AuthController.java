package com.oneeats.security.infrastructure.controller;

import com.oneeats.security.application.AuthService;
import com.oneeats.security.application.AuthService.CurrentUserDTO;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

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

    @Inject
    AuthService authService;

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

    // DTOs pour les reponses

    public record ErrorResponse(String message) {}

    public record AuthStatusResponse(boolean authenticated, String email) {}

    public record RestaurantAccessResponse(
        String restaurantId,
        boolean hasAccess,
        String role
    ) {}
}
