package com.oneeats.favorite.adapter.web;

import com.oneeats.favorite.application.dto.UserFavoriteDTO;
import com.oneeats.favorite.application.mapper.UserFavoriteApplicationMapper;
import com.oneeats.favorite.application.service.UserFavoriteService;
import com.oneeats.favorite.domain.model.UserFavorite;
import com.oneeats.security.Roles;
import com.oneeats.security.application.AuthService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Path("/api/users/{userId}/favorites")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed({Roles.USER, Roles.ADMIN})
public class UserFavoriteController {

    @Inject
    UserFavoriteService favoriteService;

    @Inject
    UserFavoriteApplicationMapper mapper;

    @Inject
    AuthService authService;

    /**
     * GET /api/users/{userId}/favorites
     * Récupère tous les favoris d'un utilisateur
     * Note: userId peut etre l'ID de base de données OU le Keycloak ID
     */
    @GET
    public Response getUserFavorites(@PathParam("userId") UUID userId) {
        // Verifier que l'utilisateur accede a ses propres favoris
        if (!authService.hasRole(Roles.ADMIN) && !authService.isCurrentUser(userId)) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity(new ErrorResponse("Acces refuse aux favoris d'un autre utilisateur"))
                    .build();
        }

        try {
            // Utiliser l'ID de base de données de l'utilisateur courant
            // (pas l'ID de l'URL qui peut etre le Keycloak ID)
            UUID dbUserId = authService.getCurrentUser()
                    .map(user -> user.getId())
                    .orElse(userId); // Fallback sur userId si admin accede aux favoris d'un autre

            List<UserFavorite> favorites = favoriteService.getUserFavorites(dbUserId);

            List<UserFavoriteDTO> favoriteDTOs = favorites.stream()
                    .map(mapper::toDTO)
                    .collect(Collectors.toList());

            return Response.ok(favoriteDTOs).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse("Internal server error: " + e.getMessage()))
                    .build();
        }
    }

    /**
     * POST /api/users/{userId}/favorites/{restaurantId}
     * Ajoute un restaurant aux favoris
     */
    @POST
    @Path("/{restaurantId}")
    public Response addFavorite(@PathParam("userId") UUID userId,
                               @PathParam("restaurantId") UUID restaurantId) {
        // Verifier que l'utilisateur modifie ses propres favoris
        if (!authService.hasRole(Roles.ADMIN) && !authService.isCurrentUser(userId)) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity(new ErrorResponse("Acces refuse"))
                    .build();
        }

        try {
            // Utiliser l'ID de base de données
            UUID dbUserId = authService.getCurrentUser()
                    .map(user -> user.getId())
                    .orElse(userId);

            UserFavorite favorite = favoriteService.addFavorite(dbUserId, restaurantId);
            UserFavoriteDTO favoriteDTO = mapper.toDTO(favorite);

            return Response.status(Response.Status.CREATED)
                    .entity(new FavoriteResponse(true, "Restaurant added to favorites", favoriteDTO))
                    .build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        } catch (IllegalStateException e) {
            return Response.status(Response.Status.CONFLICT)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse("Internal server error"))
                    .build();
        }
    }

    /**
     * DELETE /api/users/{userId}/favorites/{restaurantId}
     * Retire un restaurant des favoris
     */
    @DELETE
    @Path("/{restaurantId}")
    public Response removeFavorite(@PathParam("userId") UUID userId,
                                  @PathParam("restaurantId") UUID restaurantId) {
        // Verifier que l'utilisateur modifie ses propres favoris
        if (!authService.hasRole(Roles.ADMIN) && !authService.isCurrentUser(userId)) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity(new ErrorResponse("Acces refuse"))
                    .build();
        }

        try {
            // Utiliser l'ID de base de données
            UUID dbUserId = authService.getCurrentUser()
                    .map(user -> user.getId())
                    .orElse(userId);

            favoriteService.removeFavorite(dbUserId, restaurantId);
            return Response.ok(new FavoriteResponse(false, "Restaurant removed from favorites", null))
                    .build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse("Internal server error"))
                    .build();
        }
    }

    /**
     * GET /api/users/{userId}/favorites/{restaurantId}
     * Vérifie si un restaurant est dans les favoris
     */
    @GET
    @Path("/{restaurantId}")
    public Response checkFavorite(@PathParam("userId") UUID userId,
                                 @PathParam("restaurantId") UUID restaurantId) {
        // Verifier que l'utilisateur accede a ses propres favoris
        if (!authService.hasRole(Roles.ADMIN) && !authService.isCurrentUser(userId)) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity(new ErrorResponse("Acces refuse"))
                    .build();
        }

        try {
            // Utiliser l'ID de base de données
            UUID dbUserId = authService.getCurrentUser()
                    .map(user -> user.getId())
                    .orElse(userId);

            boolean isFavorite = favoriteService.isFavorite(dbUserId, restaurantId);
            return Response.ok(new FavoriteStatusResponse(isFavorite)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse("Internal server error"))
                    .build();
        }
    }

    /**
     * PUT /api/users/{userId}/favorites/{restaurantId}/toggle
     * Toggle favori (ajoute si absent, retire si présent)
     */
    @PUT
    @Path("/{restaurantId}/toggle")
    public Response toggleFavorite(@PathParam("userId") UUID userId,
                                  @PathParam("restaurantId") UUID restaurantId) {
        // Verifier que l'utilisateur modifie ses propres favoris
        if (!authService.hasRole(Roles.ADMIN) && !authService.isCurrentUser(userId)) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity(new ErrorResponse("Acces refuse"))
                    .build();
        }

        try {
            // Utiliser l'ID de base de données
            UUID dbUserId = authService.getCurrentUser()
                    .map(user -> user.getId())
                    .orElse(userId);

            boolean added = favoriteService.toggleFavorite(dbUserId, restaurantId);
            String message = added ? "Restaurant added to favorites" : "Restaurant removed from favorites";
            return Response.ok(new FavoriteResponse(added, message, null)).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse("Internal server error"))
                    .build();
        }
    }

    /**
     * GET /api/users/{userId}/favorites/count
     * Récupère le nombre de favoris d'un utilisateur
     */
    @GET
    @Path("/count")
    public Response getFavoriteCount(@PathParam("userId") UUID userId) {
        // Verifier que l'utilisateur accede a ses propres favoris
        if (!authService.hasRole(Roles.ADMIN) && !authService.isCurrentUser(userId)) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity(new ErrorResponse("Acces refuse"))
                    .build();
        }

        try {
            // Utiliser l'ID de base de données
            UUID dbUserId = authService.getCurrentUser()
                    .map(user -> user.getId())
                    .orElse(userId);

            long count = favoriteService.countUserFavorites(dbUserId);
            return Response.ok(new FavoriteCountResponse(count)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse("Internal server error"))
                    .build();
        }
    }

    // DTOs de réponse
    record ErrorResponse(String message) {}
    record FavoriteResponse(boolean isFavorite, String message, UserFavoriteDTO favorite) {}
    record FavoriteStatusResponse(boolean isFavorite) {}
    record FavoriteCountResponse(long count) {}
}