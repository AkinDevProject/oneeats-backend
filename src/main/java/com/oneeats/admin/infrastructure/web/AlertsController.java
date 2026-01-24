package com.oneeats.admin.infrastructure.web;

import com.oneeats.admin.application.dto.AlertDTO;
import com.oneeats.admin.application.dto.AlertsResponse;
import com.oneeats.admin.application.service.AlertsService;
import com.oneeats.security.Roles;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

/**
 * Controller pour les alertes admin temps réel
 * Fournit les alertes récentes pour le dashboard admin
 */
@Path("/api/admin/alerts")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed(Roles.ADMIN)
public class AlertsController {

    @Inject
    AlertsService alertsService;

    /**
     * GET /api/admin/alerts - Récupère les alertes récentes avec pagination
     *
     * @param page Numéro de page (0-indexed)
     * @param size Nombre d'alertes par page
     * @return Liste des alertes triées par date (récentes en premier)
     */
    @GET
    public Response getAlerts(
        @QueryParam("page") @DefaultValue("0") int page,
        @QueryParam("size") @DefaultValue("20") int size
    ) {
        try {
            // Validation des paramètres
            if (page < 0) page = 0;
            if (size < 1) size = 20;
            if (size > 100) size = 100; // Limite max

            List<AlertDTO> alerts = alertsService.getAlerts(page, size);
            long totalUnread = alertsService.countUnreadAlerts();

            // Déterminer s'il y a plus de résultats
            List<AlertDTO> nextPage = alertsService.getAlerts(page + 1, size);
            boolean hasMore = !nextPage.isEmpty();

            AlertsResponse response = new AlertsResponse(
                alerts,
                totalUnread,
                page,
                size,
                hasMore
            );

            return Response.ok(response).build();

        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Failed to fetch alerts: " + e.getMessage())
                .build();
        }
    }

    /**
     * GET /api/admin/alerts/count - Compte les alertes non lues
     */
    @GET
    @Path("/count")
    public Response getUnreadCount() {
        try {
            long count = alertsService.countUnreadAlerts();
            return Response.ok(new UnreadCountResponse(count)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Failed to count alerts: " + e.getMessage())
                .build();
        }
    }

    // DTO pour la réponse du comptage
    public record UnreadCountResponse(long count) {}
}
