package com.oneeats.notification.infrastructure.websocket;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.UUID;
import java.util.logging.Logger;

@ApplicationScoped
public class WebSocketNotificationService {

    private static final Logger LOGGER = Logger.getLogger(WebSocketNotificationService.class.getName());

    @Inject
    ObjectMapper objectMapper;

    /**
     * Send order status notification via WebSocket
     */
    public void sendOrderStatusNotification(UUID userId, UUID orderId, String orderStatus, String title, String message) {
        if (!NotificationWebSocket.isUserConnected(userId)) {
            LOGGER.info("User " + userId + " is not connected via WebSocket, skipping real-time notification");
            return;
        }

        try {
            OrderStatusNotification notification = new OrderStatusNotification(
                "order_status_update",
                orderId,
                orderStatus,
                title,
                message,
                System.currentTimeMillis()
            );

            String jsonNotification = objectMapper.writeValueAsString(notification);
            NotificationWebSocket.sendNotificationToUser(userId, jsonNotification);

            LOGGER.info("Order status notification sent via WebSocket to user: " + userId);
        } catch (JsonProcessingException e) {
            LOGGER.severe("Error serializing notification to JSON: " + e.getMessage());
        }
    }

    /**
     * Send general notification via WebSocket
     */
    public void sendNotification(UUID userId, String type, String title, String message) {
        if (!NotificationWebSocket.isUserConnected(userId)) {
            LOGGER.info("User " + userId + " is not connected via WebSocket, skipping real-time notification");
            return;
        }

        try {
            GeneralNotification notification = new GeneralNotification(
                type,
                title,
                message,
                System.currentTimeMillis()
            );

            String jsonNotification = objectMapper.writeValueAsString(notification);
            NotificationWebSocket.sendNotificationToUser(userId, jsonNotification);

            LOGGER.info("General notification sent via WebSocket to user: " + userId);
        } catch (JsonProcessingException e) {
            LOGGER.severe("Error serializing notification to JSON: " + e.getMessage());
        }
    }

    // Inner classes for different notification types
    public static class OrderStatusNotification {
        public String type;
        public UUID orderId;
        public String orderStatus;
        public String title;
        public String message;
        public long timestamp;

        public OrderStatusNotification(String type, UUID orderId, String orderStatus, String title, String message, long timestamp) {
            this.type = type;
            this.orderId = orderId;
            this.orderStatus = orderStatus;
            this.title = title;
            this.message = message;
            this.timestamp = timestamp;
        }

        // Getters and setters
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public UUID getOrderId() { return orderId; }
        public void setOrderId(UUID orderId) { this.orderId = orderId; }

        public String getOrderStatus() { return orderStatus; }
        public void setOrderStatus(String orderStatus) { this.orderStatus = orderStatus; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    }

    public static class GeneralNotification {
        public String type;
        public String title;
        public String message;
        public long timestamp;

        public GeneralNotification(String type, String title, String message, long timestamp) {
            this.type = type;
            this.title = title;
            this.message = message;
            this.timestamp = timestamp;
        }

        // Getters and setters
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    }
}