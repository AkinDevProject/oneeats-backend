package com.oneeats.order.application.event;

import com.oneeats.notification.application.command.CreateNotificationCommand;
import com.oneeats.notification.application.command.CreateNotificationCommandHandler;
import com.oneeats.notification.domain.model.NotificationType;
import com.oneeats.notification.infrastructure.websocket.WebSocketNotificationService;
import com.oneeats.order.domain.event.OrderStatusChangedEvent;
import com.oneeats.order.domain.model.OrderStatus;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.logging.Logger;

@ApplicationScoped
public class OrderStatusChangedEventHandler {

    private static final Logger LOGGER = Logger.getLogger(OrderStatusChangedEventHandler.class.getName());

    @Inject
    CreateNotificationCommandHandler createNotificationCommandHandler;

    @Inject
    WebSocketNotificationService webSocketNotificationService;

    @Transactional
    public void handle(@Observes OrderStatusChangedEvent event) {
        LOGGER.info("🔔 Handling OrderStatusChangedEvent for order: " + event.getOrderId() +
                   " - User: " + event.getUserId() +
                   " - Restaurant: " + event.getRestaurantId() +
                   " - Status change: " + event.getPreviousStatus() + " → " + event.getNewStatus());

        // Creer une notification pour l'utilisateur (client mobile)
        String title = getNotificationTitle(event.getNewStatus());
        String message = getNotificationMessage(event.getNewStatus());

        if (title != null && message != null) {
            CreateNotificationCommand notificationCommand = new CreateNotificationCommand(
                event.getUserId(),
                getNotificationType(event.getNewStatus()),
                title,
                message
            );

            try {
                // Save notification to database
                createNotificationCommandHandler.handle(notificationCommand);
                LOGGER.info("✅ Database notification created successfully for order: " + event.getOrderId());

                // Send real-time notification via WebSocket to USER (client mobile)
                LOGGER.info("📡 Sending WebSocket notification to user: " + event.getUserId());
                webSocketNotificationService.sendOrderStatusNotification(
                    event.getUserId(),
                    event.getOrderId(),
                    event.getNewStatus().toString(),
                    title,
                    message
                );

                // Send real-time notification via WebSocket to RESTAURANT (dashboard)
                LOGGER.info("🍽️ Sending WebSocket notification to restaurant: " + event.getRestaurantId());
                webSocketNotificationService.sendOrderStatusToRestaurant(
                    event.getRestaurantId(),
                    event.getOrderId(),
                    getOrderNumber(event.getOrderId()),
                    event.getPreviousStatus().toString(),
                    event.getNewStatus().toString()
                );

                LOGGER.info("🚀 WebSocket notifications sent for order: " + event.getOrderId());
            } catch (Exception e) {
                LOGGER.severe("❌ Failed to process notification for order: " + event.getOrderId() +
                             " - Error: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            LOGGER.warning("⚠️ No notification generated for status: " + event.getNewStatus());
        }
    }

    private String getOrderNumber(java.util.UUID orderId) {
        // Pour simplifier, on retourne l'ID comme numero de commande
        // Dans une implementation complete, on irait chercher le orderNumber en BDD
        return orderId.toString().substring(0, 8).toUpperCase();
    }

    private String getNotificationTitle(OrderStatus status) {
        switch (status) {
            case CONFIRMED:
                return "Commande confirmée ! 🎉";
            case PREPARING:
                return "Préparation en cours 👨‍🍳";
            case READY:
                return "Commande prête ! 🍽️";
            case COMPLETED:
                return "Commande terminée ✅";
            case CANCELLED:
                return "Commande annulée ❌";
            default:
                return null;
        }
    }

    private String getNotificationMessage(OrderStatus status) {
        switch (status) {
            case CONFIRMED:
                return "Votre commande a été confirmée et sera bientôt préparée.";
            case PREPARING:
                return "Votre commande est en cours de préparation.";
            case READY:
                return "Votre commande est prête à être récupérée !";
            case COMPLETED:
                return "Merci d'avoir choisi notre service ! N'hésitez pas à laisser un avis.";
            case CANCELLED:
                return "Votre commande a été annulée. Si vous avez des questions, contactez le support.";
            default:
                return null;
        }
    }

    private NotificationType getNotificationType(OrderStatus status) {
        switch (status) {
            case CONFIRMED:
            case PREPARING:
            case READY:
            case COMPLETED:
                return NotificationType.ORDER_STATUS_UPDATE;
            case CANCELLED:
                return NotificationType.ORDER_CANCELLED;
            default:
                return NotificationType.ORDER_STATUS_UPDATE;
        }
    }
}