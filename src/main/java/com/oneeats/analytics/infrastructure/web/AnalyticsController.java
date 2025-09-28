package com.oneeats.analytics.infrastructure.web;

import com.oneeats.analytics.application.dto.PlatformStatsDTO;
import com.oneeats.analytics.application.service.AnalyticsService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * Controller REST pour les analytics de la plateforme
 */
@Path("/api/analytics")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AnalyticsController {

    @Inject
    AnalyticsService analyticsService;

    @GET
    @Path("/platform")
    public Response getPlatformStats() {
        try {
            PlatformStatsDTO stats = analyticsService.getPlatformStats();
            return Response.ok(stats).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Erreur lors du calcul des statistiques: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/dashboard")
    public Response getDashboardStats() {
        // Alias pour la compatibilité avec l'API service frontend
        return getPlatformStats();
    }

    @GET
    @Path("/revenue")
    public Response getRevenueStats(@QueryParam("period") @DefaultValue("month") String period) {
        try {
            PlatformStatsDTO stats = analyticsService.getPlatformStats();

            // Retourner uniquement les données de revenus selon la période
            var revenueData = switch (period.toLowerCase()) {
                case "day" -> Response.ok()
                    .entity("{\"revenue\":" + stats.getTodayRevenue() + ",\"orders\":" + stats.getTodayOrders() + "}")
                    .build();
                case "week" -> Response.ok()
                    .entity("{\"revenue\":" + stats.getWeekRevenue() + ",\"orders\":" + stats.getWeekOrders() + "}")
                    .build();
                case "month" -> Response.ok()
                    .entity("{\"revenue\":" + stats.getMonthRevenue() + ",\"orders\":" + stats.getMonthOrders() + "}")
                    .build();
                default -> Response.ok(stats).build();
            };

            return revenueData;
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Erreur lors du calcul des revenus: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/trends")
    public Response getTrendsStats() {
        try {
            PlatformStatsDTO stats = analyticsService.getPlatformStats();

            // Retourner les données de tendances
            var trendsData = "{" +
                "\"dailyStats\":" + convertDailyStatsToJson(stats.getDailyStats()) + "," +
                "\"revenueGrowth\":" + stats.getRevenueGrowth() + "," +
                "\"orderGrowth\":" + stats.getOrderGrowth() + "," +
                "\"userGrowth\":" + stats.getUserGrowth() +
                "}";

            return Response.ok(trendsData).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Erreur lors du calcul des tendances: " + e.getMessage())
                    .build();
        }
    }

    private String convertDailyStatsToJson(java.util.List<com.oneeats.analytics.application.dto.DailyStatsDTO> dailyStats) {
        if (dailyStats == null || dailyStats.isEmpty()) {
            return "[]";
        }

        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < dailyStats.size(); i++) {
            var stat = dailyStats.get(i);
            if (i > 0) json.append(",");
            json.append("{")
                .append("\"date\":\"").append(stat.getDate()).append("\",")
                .append("\"orders\":").append(stat.getOrders()).append(",")
                .append("\"revenue\":").append(stat.getRevenue())
                .append("}");
        }
        json.append("]");
        return json.toString();
    }
}