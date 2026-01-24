package com.oneeats.admin.application.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO pour les alertes admin temps réel
 */
public record AlertDTO(
    UUID id,
    AlertType type,
    AlertSeverity severity,
    String title,
    String message,
    String entityId,       // ID de l'entité concernée (restaurant, user, order)
    String entityType,     // Type: "restaurant", "user", "order"
    LocalDateTime createdAt,
    boolean isRead,
    String actionUrl       // URL pour l'action (ex: "/admin/restaurants/{id}")
) {
    /**
     * Factory method pour créer une alerte
     */
    public static AlertDTO create(
        AlertType type,
        AlertSeverity severity,
        String title,
        String message,
        String entityId,
        String entityType
    ) {
        return new AlertDTO(
            UUID.randomUUID(),
            type,
            severity,
            title,
            message,
            entityId,
            entityType,
            LocalDateTime.now(),
            false,
            buildActionUrl(entityType, entityId)
        );
    }

    private static String buildActionUrl(String entityType, String entityId) {
        if (entityType == null || entityId == null) return null;
        return switch (entityType) {
            case "restaurant" -> "/admin/restaurants/" + entityId;
            case "user" -> "/admin/users/" + entityId;
            case "order" -> "/admin/orders/" + entityId;
            default -> null;
        };
    }
}
