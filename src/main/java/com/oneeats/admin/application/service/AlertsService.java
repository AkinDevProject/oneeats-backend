package com.oneeats.admin.application.service;

import com.oneeats.admin.application.dto.AlertDTO;
import com.oneeats.admin.application.dto.AlertSeverity;
import com.oneeats.admin.application.dto.AlertType;
import com.oneeats.order.infrastructure.entity.OrderEntity;
import com.oneeats.restaurant.domain.model.RestaurantStatus;
import com.oneeats.restaurant.infrastructure.entity.RestaurantEntity;
import com.oneeats.user.domain.model.UserStatus;
import com.oneeats.user.infrastructure.entity.UserEntity;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Service pour générer les alertes admin temps réel
 * Agrège les données de différents domaines pour créer des alertes pertinentes
 */
@ApplicationScoped
public class AlertsService {

    /**
     * Récupère toutes les alertes actives, triées par date (récentes en premier)
     */
    @Transactional
    public List<AlertDTO> getAlerts(int page, int size) {
        List<AlertDTO> allAlerts = new ArrayList<>();

        // 1. Restaurants en attente de validation
        allAlerts.addAll(getPendingRestaurantAlerts());

        // 2. Restaurants bloqués récemment
        allAlerts.addAll(getBlockedRestaurantAlerts());

        // 3. Utilisateurs suspendus récemment
        allAlerts.addAll(getSuspendedUserAlerts());

        // 4. Commandes annulées récemment
        allAlerts.addAll(getCancelledOrderAlerts());

        // Trier par date (récentes en premier)
        allAlerts.sort(Comparator.comparing(AlertDTO::createdAt).reversed());

        // Pagination
        int start = page * size;
        int end = Math.min(start + size, allAlerts.size());

        if (start >= allAlerts.size()) {
            return List.of();
        }

        return allAlerts.subList(start, end);
    }

    /**
     * Compte le nombre total d'alertes non lues
     */
    @Transactional
    public long countUnreadAlerts() {
        long count = 0;

        // Restaurants en attente
        count += RestaurantEntity.count("status", RestaurantStatus.PENDING);

        // Restaurants bloqués (dernières 24h)
        LocalDateTime since24h = LocalDateTime.now().minusHours(24);
        count += RestaurantEntity.count("status = ?1 and blockedAt > ?2",
            RestaurantStatus.BLOCKED, since24h);

        // Utilisateurs suspendus (dernières 24h)
        count += UserEntity.count("status = ?1 and suspendedAt > ?2",
            UserStatus.SUSPENDED, since24h);

        // Commandes annulées (dernières 24h)
        count += OrderEntity.count("status = 'CANCELLED' and cancelledAt > ?1", since24h);

        return count;
    }

    private List<AlertDTO> getPendingRestaurantAlerts() {
        List<AlertDTO> alerts = new ArrayList<>();

        List<RestaurantEntity> pendingRestaurants = RestaurantEntity
            .find("status", RestaurantStatus.PENDING)
            .list();

        for (RestaurantEntity restaurant : pendingRestaurants) {
            alerts.add(AlertDTO.create(
                AlertType.NEW_RESTAURANT,
                AlertSeverity.WARNING,
                "Nouveau restaurant en attente",
                "Le restaurant \"" + restaurant.getName() + "\" attend validation",
                restaurant.getId().toString(),
                "restaurant"
            ));
        }

        return alerts;
    }

    private List<AlertDTO> getBlockedRestaurantAlerts() {
        List<AlertDTO> alerts = new ArrayList<>();

        // Restaurants bloqués dans les dernières 48h
        LocalDateTime since48h = LocalDateTime.now().minusHours(48);

        List<RestaurantEntity> blockedRestaurants = RestaurantEntity
            .find("status = ?1 and blockedAt > ?2", RestaurantStatus.BLOCKED, since48h)
            .list();

        for (RestaurantEntity restaurant : blockedRestaurants) {
            String reason = restaurant.getBlockingReason() != null
                ? restaurant.getBlockingReason()
                : "Raison non spécifiée";

            alerts.add(new AlertDTO(
                java.util.UUID.randomUUID(),
                AlertType.RESTAURANT_BLOCKED,
                AlertSeverity.CRITICAL,
                "Restaurant bloqué",
                "\"" + restaurant.getName() + "\" a été bloqué: " + reason,
                restaurant.getId().toString(),
                "restaurant",
                restaurant.getBlockedAt() != null ? restaurant.getBlockedAt() : LocalDateTime.now(),
                false,
                "/admin/restaurants/" + restaurant.getId()
            ));
        }

        return alerts;
    }

    private List<AlertDTO> getSuspendedUserAlerts() {
        List<AlertDTO> alerts = new ArrayList<>();

        // Utilisateurs suspendus dans les dernières 48h
        LocalDateTime since48h = LocalDateTime.now().minusHours(48);

        List<UserEntity> suspendedUsers = UserEntity
            .find("status = ?1 and suspendedAt > ?2", UserStatus.SUSPENDED, since48h)
            .list();

        for (UserEntity user : suspendedUsers) {
            String reason = user.getSuspensionReason() != null
                ? user.getSuspensionReason()
                : "Raison non spécifiée";

            String duration = user.getSuspendedUntil() != null
                ? "jusqu'au " + user.getSuspendedUntil().toLocalDate()
                : "indéfiniment";

            alerts.add(new AlertDTO(
                java.util.UUID.randomUUID(),
                AlertType.USER_SUSPENDED,
                AlertSeverity.WARNING,
                "Utilisateur suspendu",
                user.getFirstName() + " " + user.getLastName() + " suspendu " + duration + ": " + reason,
                user.getId().toString(),
                "user",
                user.getSuspendedAt() != null ? user.getSuspendedAt() : LocalDateTime.now(),
                false,
                "/admin/users/" + user.getId()
            ));
        }

        return alerts;
    }

    private List<AlertDTO> getCancelledOrderAlerts() {
        List<AlertDTO> alerts = new ArrayList<>();

        // Commandes annulées dans les dernières 24h
        LocalDateTime since24h = LocalDateTime.now().minusHours(24);

        List<OrderEntity> cancelledOrders = OrderEntity
            .find("status = 'CANCELLED' and cancelledAt > ?1", since24h)
            .list();

        for (OrderEntity order : cancelledOrders) {
            String reason = order.getCancellationReason() != null
                ? order.getCancellationReason()
                : "Raison non spécifiée";

            alerts.add(new AlertDTO(
                java.util.UUID.randomUUID(),
                AlertType.ORDER_CANCELLED,
                AlertSeverity.INFO,
                "Commande annulée",
                "Commande #" + order.getOrderNumber() + " annulée: " + reason,
                order.getId().toString(),
                "order",
                order.getCancelledAt() != null ? order.getCancelledAt() : LocalDateTime.now(),
                false,
                "/admin/orders/" + order.getId()
            ));
        }

        return alerts;
    }
}
