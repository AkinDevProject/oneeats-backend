package com.oneeats.order.application.event;

import com.oneeats.notification.infrastructure.websocket.WebSocketNotificationService;
import com.oneeats.order.domain.event.OrderCreatedEvent;
import com.oneeats.order.infrastructure.persistence.JpaOrderRepository;
import com.oneeats.user.infrastructure.persistence.JpaUserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.logging.Logger;

/**
 * Gestionnaire d'evenements pour les nouvelles commandes.
 * Notifie le restaurant en temps reel via WebSocket quand une commande est creee.
 */
@ApplicationScoped
public class OrderCreatedEventHandler {

    private static final Logger LOGGER = Logger.getLogger(OrderCreatedEventHandler.class.getName());

    @Inject
    WebSocketNotificationService webSocketNotificationService;

    @Inject
    JpaOrderRepository orderRepository;

    @Inject
    JpaUserRepository userRepository;

    @Transactional
    public void handle(@Observes OrderCreatedEvent event) {
        LOGGER.info("🆕 Handling OrderCreatedEvent for order: " + event.getOrderId() +
                   " - Order Number: " + event.getOrderNumber() +
                   " - Restaurant: " + event.getRestaurantId() +
                   " - User: " + event.getUserId());

        try {
            // Recuperer les infos supplementaires pour la notification
            String customerName = getCustomerName(event.getUserId());
            double totalAmount = getOrderTotal(event.getOrderId());

            // Envoyer notification au restaurant via WebSocket
            webSocketNotificationService.sendNewOrderToRestaurant(
                event.getRestaurantId(),
                event.getOrderId(),
                event.getOrderNumber(),
                customerName,
                totalAmount
            );

            LOGGER.info("✅ Restaurant notified of new order: " + event.getOrderNumber());

        } catch (Exception e) {
            LOGGER.severe("❌ Failed to notify restaurant of new order: " + event.getOrderId() +
                         " - Error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String getCustomerName(java.util.UUID userId) {
        try {
            return userRepository.findById(userId)
                .map(user -> user.getFirstName() + " " + user.getLastName())
                .orElse("Client");
        } catch (Exception e) {
            LOGGER.warning("Could not fetch customer name: " + e.getMessage());
            return "Client";
        }
    }

    private double getOrderTotal(java.util.UUID orderId) {
        try {
            return orderRepository.findById(orderId)
                .map(order -> order.getTotalAmount().doubleValue())
                .orElse(0.0);
        } catch (Exception e) {
            LOGGER.warning("Could not fetch order total: " + e.getMessage());
            return 0.0;
        }
    }
}
