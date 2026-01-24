package com.oneeats.admin.infrastructure.web;

import com.oneeats.admin.application.service.ExportService;
import com.oneeats.order.domain.model.OrderStatus;
import com.oneeats.restaurant.domain.model.RestaurantStatus;
import com.oneeats.security.Roles;
import com.oneeats.user.domain.model.UserStatus;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Controller pour l'export de données en CSV et Excel
 * Fournit des endpoints pour exporter les restaurants, utilisateurs et commandes
 */
@Path("/api/admin/export")
@RolesAllowed(Roles.ADMIN)
public class ExportController {

    private static final DateTimeFormatter DATE_PARAM_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Inject
    ExportService exportService;

    // ==================== RESTAURANTS ====================

    /**
     * GET /api/admin/export/restaurants - Export des restaurants
     *
     * @param format Format d'export: csv ou xlsx
     * @param status Filtre optionnel par statut
     */
    @GET
    @Path("/restaurants")
    public Response exportRestaurants(
        @QueryParam("format") @DefaultValue("csv") String format,
        @QueryParam("status") String status
    ) {
        try {
            RestaurantStatus statusFilter = parseRestaurantStatus(status);

            byte[] data;
            String contentType;
            String filename;

            if ("xlsx".equalsIgnoreCase(format)) {
                data = exportService.exportRestaurantsExcel(statusFilter);
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                filename = "restaurants_" + getTimestamp() + ".xlsx";
            } else {
                data = exportService.exportRestaurantsCsv(statusFilter);
                contentType = "text/csv; charset=UTF-8";
                filename = "restaurants_" + getTimestamp() + ".csv";
            }

            return Response.ok(data)
                .type(contentType)
                .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                .build();

        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Export failed: " + e.getMessage())
                .type(MediaType.TEXT_PLAIN)
                .build();
        }
    }

    // ==================== USERS ====================

    /**
     * GET /api/admin/export/users - Export des utilisateurs
     *
     * @param format Format d'export: csv ou xlsx
     * @param status Filtre optionnel par statut
     */
    @GET
    @Path("/users")
    public Response exportUsers(
        @QueryParam("format") @DefaultValue("csv") String format,
        @QueryParam("status") String status
    ) {
        try {
            UserStatus statusFilter = parseUserStatus(status);

            byte[] data;
            String contentType;
            String filename;

            if ("xlsx".equalsIgnoreCase(format)) {
                data = exportService.exportUsersExcel(statusFilter);
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                filename = "utilisateurs_" + getTimestamp() + ".xlsx";
            } else {
                data = exportService.exportUsersCsv(statusFilter);
                contentType = "text/csv; charset=UTF-8";
                filename = "utilisateurs_" + getTimestamp() + ".csv";
            }

            return Response.ok(data)
                .type(contentType)
                .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                .build();

        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Export failed: " + e.getMessage())
                .type(MediaType.TEXT_PLAIN)
                .build();
        }
    }

    // ==================== ORDERS ====================

    /**
     * GET /api/admin/export/orders - Export des commandes
     *
     * @param format Format d'export: csv ou xlsx
     * @param status Filtre optionnel par statut
     * @param from Date de début (format: yyyy-MM-dd)
     * @param to Date de fin (format: yyyy-MM-dd)
     */
    @GET
    @Path("/orders")
    public Response exportOrders(
        @QueryParam("format") @DefaultValue("csv") String format,
        @QueryParam("status") String status,
        @QueryParam("from") String from,
        @QueryParam("to") String to
    ) {
        try {
            OrderStatus statusFilter = parseOrderStatus(status);
            LocalDateTime fromDate = parseDate(from);
            LocalDateTime toDate = parseDate(to);

            // Si toDate est spécifié, ajouter 23:59:59 pour inclure toute la journée
            if (toDate != null) {
                toDate = toDate.plusDays(1).minusSeconds(1);
            }

            byte[] data;
            String contentType;
            String filename;

            if ("xlsx".equalsIgnoreCase(format)) {
                data = exportService.exportOrdersExcel(statusFilter, fromDate, toDate);
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                filename = "commandes_" + getTimestamp() + ".xlsx";
            } else {
                data = exportService.exportOrdersCsv(statusFilter, fromDate, toDate);
                contentType = "text/csv; charset=UTF-8";
                filename = "commandes_" + getTimestamp() + ".csv";
            }

            return Response.ok(data)
                .type(contentType)
                .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                .build();

        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Export failed: " + e.getMessage())
                .type(MediaType.TEXT_PLAIN)
                .build();
        }
    }

    // ==================== HELPERS ====================

    private RestaurantStatus parseRestaurantStatus(String status) {
        if (status == null || status.isEmpty()) return null;
        try {
            return RestaurantStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private UserStatus parseUserStatus(String status) {
        if (status == null || status.isEmpty()) return null;
        try {
            return UserStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private OrderStatus parseOrderStatus(String status) {
        if (status == null || status.isEmpty()) return null;
        try {
            return OrderStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private LocalDateTime parseDate(String dateStr) {
        if (dateStr == null || dateStr.isEmpty()) return null;
        try {
            return LocalDateTime.parse(dateStr + "T00:00:00");
        } catch (Exception e) {
            return null;
        }
    }

    private String getTimestamp() {
        return LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
    }
}
