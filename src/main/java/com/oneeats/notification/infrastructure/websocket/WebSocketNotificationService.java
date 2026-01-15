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

    // ==================== RESTAURANT NOTIFICATIONS ====================

    /**
     * Envoyer une notification de nouvelle commande au restaurant
     */
    public void sendNewOrderToRestaurant(UUID restaurantId, UUID orderId, String orderNumber, String customerName, double totalAmount) {
        if (!RestaurantWebSocket.isRestaurantConnected(restaurantId)) {
            LOGGER.info("Restaurant " + restaurantId + " is not connected via WebSocket");
            return;
        }

        try {
            NewOrderNotification notification = new NewOrderNotification(
                "new_order",
                orderId,
                orderNumber,
                customerName,
                totalAmount,
                System.currentTimeMillis()
            );

            String jsonNotification = objectMapper.writeValueAsString(notification);
            RestaurantWebSocket.sendNotificationToRestaurant(restaurantId, jsonNotification);

            LOGGER.info("🍽️ New order notification sent to restaurant: " + restaurantId);
        } catch (JsonProcessingException e) {
            LOGGER.severe("Error serializing new order notification: " + e.getMessage());
        }
    }

    /**
     * Envoyer une notification de changement de statut au restaurant
     */
    public void sendOrderStatusToRestaurant(UUID restaurantId, UUID orderId, String orderNumber, String previousStatus, String newStatus) {
        if (!RestaurantWebSocket.isRestaurantConnected(restaurantId)) {
            LOGGER.info("Restaurant " + restaurantId + " is not connected via WebSocket");
            return;
        }

        try {
            RestaurantOrderStatusNotification notification = new RestaurantOrderStatusNotification(
                "order_status_changed",
                orderId,
                orderNumber,
                previousStatus,
                newStatus,
                System.currentTimeMillis()
            );

            String jsonNotification = objectMapper.writeValueAsString(notification);
            RestaurantWebSocket.sendNotificationToRestaurant(restaurantId, jsonNotification);

            LOGGER.info("🍽️ Order status notification sent to restaurant: " + restaurantId);
        } catch (JsonProcessingException e) {
            LOGGER.severe("Error serializing order status notification: " + e.getMessage());
        }
    }

    // ==================== NOTIFICATION CLASSES ====================

    /**
     * Notification de nouvelle commande pour les restaurants
     */
    public static class NewOrderNotification {
        public String type;
        public UUID orderId;
        public String orderNumber;
        public String customerName;
        public double totalAmount;
        public long timestamp;

        public NewOrderNotification(String type, UUID orderId, String orderNumber, String customerName, double totalAmount, long timestamp) {
            this.type = type;
            this.orderId = orderId;
            this.orderNumber = orderNumber;
            this.customerName = customerName;
            this.totalAmount = totalAmount;
            this.timestamp = timestamp;
        }

        // Getters
        public String getType() { return type; }
        public UUID getOrderId() { return orderId; }
        public String getOrderNumber() { return orderNumber; }
        public String getCustomerName() { return customerName; }
        public double getTotalAmount() { return totalAmount; }
        public long getTimestamp() { return timestamp; }
    }

    /**
     * Notification de changement de statut pour les restaurants
     */
    public static class RestaurantOrderStatusNotification {
        public String type;
        public UUID orderId;
        public String orderNumber;
        public String previousStatus;
        public String newStatus;
        public long timestamp;

        public RestaurantOrderStatusNotification(String type, UUID orderId, String orderNumber, String previousStatus, String newStatus, long timestamp) {
            this.type = type;
            this.orderId = orderId;
            this.orderNumber = orderNumber;
            this.previousStatus = previousStatus;
            this.newStatus = newStatus;
            this.timestamp = timestamp;
        }

        // Getters
        public String getType() { return type; }
        public UUID getOrderId() { return orderId; }
        public String getOrderNumber() { return orderNumber; }
        public String getPreviousStatus() { return previousStatus; }
        public String getNewStatus() { return newStatus; }
        public long getTimestamp() { return timestamp; }
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