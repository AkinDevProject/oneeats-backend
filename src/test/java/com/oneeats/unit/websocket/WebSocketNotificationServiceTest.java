package com.oneeats.unit.websocket;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.oneeats.notification.infrastructure.websocket.NotificationWebSocket;
import com.oneeats.notification.infrastructure.websocket.RestaurantWebSocket;
import com.oneeats.notification.infrastructure.websocket.WebSocketNotificationService;
import jakarta.websocket.RemoteEndpoint;
import jakarta.websocket.Session;
import org.junit.jupiter.api.*;
import org.mockito.*;

import java.lang.reflect.Field;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static org.mockito.Mockito.*;

/**
 * Tests unitaires pour WebSocketNotificationService
 * Teste la logique d'envoi de notifications JSON via WebSocket
 *
 * Note: Ces tests manipulent l'etat statique des WebSocket classes via reflection.
 * Pour eviter la pollution d'etat entre tests:
 * - @BeforeEach et @AfterEach nettoient les maps statiques
 * - Les tests sont executes sequentiellement
 */
@DisplayName("WebSocketNotificationService Unit Tests")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class WebSocketNotificationServiceTest {

    @InjectMocks
    private WebSocketNotificationService notificationService;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private Session session;

    @Mock
    private RemoteEndpoint.Async asyncRemote;

    private AutoCloseable mocks;

    private static final UUID USER_ID = UUID.fromString("550e8400-e29b-41d4-a716-446655440000");
    private static final UUID RESTAURANT_ID = UUID.fromString("660e8400-e29b-41d4-a716-446655440001");
    private static final UUID ORDER_ID = UUID.fromString("770e8400-e29b-41d4-a716-446655440002");

    @BeforeEach
    void setUp() throws Exception {
        mocks = MockitoAnnotations.openMocks(this);

        when(session.getAsyncRemote()).thenReturn(asyncRemote);
        when(session.getId()).thenReturn("test-session-id");
        when(session.isOpen()).thenReturn(true);

        // Clear WebSocket sessions
        clearNotificationSessions();
        clearRestaurantSessions();
    }

    @AfterEach
    void tearDown() throws Exception {
        clearNotificationSessions();
        clearRestaurantSessions();
        mocks.close();
    }

    @SuppressWarnings("unchecked")
    private void clearNotificationSessions() throws Exception {
        Field sessionsField = NotificationWebSocket.class.getDeclaredField("sessions");
        sessionsField.setAccessible(true);
        Map<UUID, Session> sessions = (Map<UUID, Session>) sessionsField.get(null);
        sessions.clear();
    }

    @SuppressWarnings("unchecked")
    private void clearRestaurantSessions() throws Exception {
        Field sessionsField = RestaurantWebSocket.class.getDeclaredField("restaurantSessions");
        sessionsField.setAccessible(true);
        Map<UUID, Set<Session>> sessions = (Map<UUID, Set<Session>>) sessionsField.get(null);
        sessions.clear();
    }

    private void connectUser(UUID userId) throws Exception {
        Field sessionsField = NotificationWebSocket.class.getDeclaredField("sessions");
        sessionsField.setAccessible(true);
        @SuppressWarnings("unchecked")
        Map<UUID, Session> sessions = (Map<UUID, Session>) sessionsField.get(null);
        sessions.put(userId, session);
    }

    private void connectRestaurant(UUID restaurantId) throws Exception {
        Field sessionsField = RestaurantWebSocket.class.getDeclaredField("restaurantSessions");
        sessionsField.setAccessible(true);
        @SuppressWarnings("unchecked")
        Map<UUID, Set<Session>> sessions = (Map<UUID, Set<Session>>) sessionsField.get(null);
        sessions.computeIfAbsent(restaurantId, k -> new java.util.concurrent.CopyOnWriteArraySet<>()).add(session);
    }

    @Nested
    @DisplayName("User Order Status Notifications")
    class UserOrderStatusNotifications {

        @Test
        @DisplayName("Should send order status notification when user is connected")
        void shouldSendOrderStatusNotificationWhenUserConnected() throws Exception {
            // Given
            connectUser(USER_ID);
            String jsonNotification = "{\"type\":\"order_status_update\",\"orderId\":\"" + ORDER_ID + "\"}";
            when(objectMapper.writeValueAsString(any())).thenReturn(jsonNotification);

            // When
            notificationService.sendOrderStatusNotification(
                USER_ID, ORDER_ID, "READY", "Commande prete", "Votre commande est prete"
            );

            // Then
            verify(objectMapper).writeValueAsString(any(WebSocketNotificationService.OrderStatusNotification.class));
            verify(asyncRemote).sendText(jsonNotification);
        }

        @Test
        @DisplayName("Should skip order status notification when user is disconnected")
        void shouldSkipOrderStatusNotificationWhenUserDisconnected() throws Exception {
            // Given - User not connected

            // When
            notificationService.sendOrderStatusNotification(
                USER_ID, ORDER_ID, "READY", "Commande prete", "Votre commande est prete"
            );

            // Then
            verify(objectMapper, never()).writeValueAsString(any());
            verify(asyncRemote, never()).sendText(anyString());
        }

        @Test
        @DisplayName("Should handle JSON processing error gracefully")
        void shouldHandleJsonProcessingErrorGracefully() throws Exception {
            // Given
            connectUser(USER_ID);
            when(objectMapper.writeValueAsString(any())).thenThrow(new JsonProcessingException("JSON error") {});

            // When & Then - Should not throw
            org.junit.jupiter.api.Assertions.assertDoesNotThrow(() ->
                notificationService.sendOrderStatusNotification(
                    USER_ID, ORDER_ID, "READY", "Title", "Message"
                )
            );
        }
    }

    @Nested
    @DisplayName("User General Notifications")
    class UserGeneralNotifications {

        @Test
        @DisplayName("Should send general notification when user is connected")
        void shouldSendGeneralNotificationWhenUserConnected() throws Exception {
            // Given
            connectUser(USER_ID);
            String jsonNotification = "{\"type\":\"promotion\",\"title\":\"Promo\"}";
            when(objectMapper.writeValueAsString(any())).thenReturn(jsonNotification);

            // When
            notificationService.sendNotification(USER_ID, "promotion", "Promo", "50% de reduction");

            // Then
            verify(objectMapper).writeValueAsString(any(WebSocketNotificationService.GeneralNotification.class));
            verify(asyncRemote).sendText(jsonNotification);
        }

        @Test
        @DisplayName("Should skip general notification when user is disconnected")
        void shouldSkipGeneralNotificationWhenUserDisconnected() throws Exception {
            // Given - User not connected

            // When
            notificationService.sendNotification(USER_ID, "promotion", "Promo", "50% de reduction");

            // Then
            verify(objectMapper, never()).writeValueAsString(any());
        }
    }

    @Nested
    @DisplayName("Restaurant New Order Notifications")
    class RestaurantNewOrderNotifications {

        @Test
        @DisplayName("Should send new order notification to connected restaurant")
        void shouldSendNewOrderNotificationToConnectedRestaurant() throws Exception {
            // Given
            connectRestaurant(RESTAURANT_ID);
            String jsonNotification = "{\"type\":\"new_order\",\"orderId\":\"" + ORDER_ID + "\"}";
            when(objectMapper.writeValueAsString(any())).thenReturn(jsonNotification);

            // When
            notificationService.sendNewOrderToRestaurant(
                RESTAURANT_ID, ORDER_ID, "ORD-001", "John Doe", 25.50
            );

            // Then
            verify(objectMapper).writeValueAsString(any(WebSocketNotificationService.NewOrderNotification.class));
            verify(asyncRemote).sendText(jsonNotification);
        }

        @Test
        @DisplayName("Should skip new order notification for disconnected restaurant")
        void shouldSkipNewOrderNotificationForDisconnectedRestaurant() throws Exception {
            // Given - Restaurant not connected

            // When
            notificationService.sendNewOrderToRestaurant(
                RESTAURANT_ID, ORDER_ID, "ORD-001", "John Doe", 25.50
            );

            // Then
            verify(objectMapper, never()).writeValueAsString(any());
        }

        @Test
        @DisplayName("Should handle JSON error for new order notification")
        void shouldHandleJsonErrorForNewOrderNotification() throws Exception {
            // Given
            connectRestaurant(RESTAURANT_ID);
            when(objectMapper.writeValueAsString(any())).thenThrow(new JsonProcessingException("JSON error") {});

            // When & Then - Should not throw
            org.junit.jupiter.api.Assertions.assertDoesNotThrow(() ->
                notificationService.sendNewOrderToRestaurant(
                    RESTAURANT_ID, ORDER_ID, "ORD-001", "John Doe", 25.50
                )
            );
        }
    }

    @Nested
    @DisplayName("Restaurant Order Status Notifications")
    class RestaurantOrderStatusNotifications {

        @Test
        @DisplayName("Should send order status change to connected restaurant")
        void shouldSendOrderStatusChangeToConnectedRestaurant() throws Exception {
            // Given
            connectRestaurant(RESTAURANT_ID);
            String jsonNotification = "{\"type\":\"order_status_changed\",\"newStatus\":\"READY\"}";
            when(objectMapper.writeValueAsString(any())).thenReturn(jsonNotification);

            // When
            notificationService.sendOrderStatusToRestaurant(
                RESTAURANT_ID, ORDER_ID, "ORD-001", "PREPARING", "READY"
            );

            // Then
            verify(objectMapper).writeValueAsString(any(WebSocketNotificationService.RestaurantOrderStatusNotification.class));
            verify(asyncRemote).sendText(jsonNotification);
        }

        @Test
        @DisplayName("Should skip order status notification for disconnected restaurant")
        void shouldSkipOrderStatusNotificationForDisconnectedRestaurant() throws Exception {
            // Given - Restaurant not connected

            // When
            notificationService.sendOrderStatusToRestaurant(
                RESTAURANT_ID, ORDER_ID, "ORD-001", "PREPARING", "READY"
            );

            // Then
            verify(objectMapper, never()).writeValueAsString(any());
        }

        @Test
        @DisplayName("Should handle JSON error for order status notification")
        void shouldHandleJsonErrorForOrderStatusNotification() throws Exception {
            // Given
            connectRestaurant(RESTAURANT_ID);
            when(objectMapper.writeValueAsString(any())).thenThrow(new JsonProcessingException("JSON error") {});

            // When & Then - Should not throw
            org.junit.jupiter.api.Assertions.assertDoesNotThrow(() ->
                notificationService.sendOrderStatusToRestaurant(
                    RESTAURANT_ID, ORDER_ID, "ORD-001", "PREPARING", "READY"
                )
            );
        }
    }

    @Nested
    @DisplayName("Notification DTOs")
    class NotificationDTOs {

        @Test
        @DisplayName("Should create OrderStatusNotification with all fields")
        void shouldCreateOrderStatusNotificationWithAllFields() {
            // When
            var notification = new WebSocketNotificationService.OrderStatusNotification(
                "order_status_update", ORDER_ID, "READY", "Title", "Message", 1234567890L
            );

            // Then
            org.junit.jupiter.api.Assertions.assertEquals("order_status_update", notification.getType());
            org.junit.jupiter.api.Assertions.assertEquals(ORDER_ID, notification.getOrderId());
            org.junit.jupiter.api.Assertions.assertEquals("READY", notification.getOrderStatus());
            org.junit.jupiter.api.Assertions.assertEquals("Title", notification.getTitle());
            org.junit.jupiter.api.Assertions.assertEquals("Message", notification.getMessage());
            org.junit.jupiter.api.Assertions.assertEquals(1234567890L, notification.getTimestamp());
        }

        @Test
        @DisplayName("Should create GeneralNotification with all fields")
        void shouldCreateGeneralNotificationWithAllFields() {
            // When
            var notification = new WebSocketNotificationService.GeneralNotification(
                "promo", "Title", "Message", 1234567890L
            );

            // Then
            org.junit.jupiter.api.Assertions.assertEquals("promo", notification.getType());
            org.junit.jupiter.api.Assertions.assertEquals("Title", notification.getTitle());
            org.junit.jupiter.api.Assertions.assertEquals("Message", notification.getMessage());
            org.junit.jupiter.api.Assertions.assertEquals(1234567890L, notification.getTimestamp());
        }

        @Test
        @DisplayName("Should create NewOrderNotification with all fields")
        void shouldCreateNewOrderNotificationWithAllFields() {
            // When
            var notification = new WebSocketNotificationService.NewOrderNotification(
                "new_order", ORDER_ID, "ORD-001", "John Doe", 25.50, 1234567890L
            );

            // Then
            org.junit.jupiter.api.Assertions.assertEquals("new_order", notification.getType());
            org.junit.jupiter.api.Assertions.assertEquals(ORDER_ID, notification.getOrderId());
            org.junit.jupiter.api.Assertions.assertEquals("ORD-001", notification.getOrderNumber());
            org.junit.jupiter.api.Assertions.assertEquals("John Doe", notification.getCustomerName());
            org.junit.jupiter.api.Assertions.assertEquals(25.50, notification.getTotalAmount());
            org.junit.jupiter.api.Assertions.assertEquals(1234567890L, notification.getTimestamp());
        }

        @Test
        @DisplayName("Should create RestaurantOrderStatusNotification with all fields")
        void shouldCreateRestaurantOrderStatusNotificationWithAllFields() {
            // When
            var notification = new WebSocketNotificationService.RestaurantOrderStatusNotification(
                "order_status_changed", ORDER_ID, "ORD-001", "PREPARING", "READY", 1234567890L
            );

            // Then
            org.junit.jupiter.api.Assertions.assertEquals("order_status_changed", notification.getType());
            org.junit.jupiter.api.Assertions.assertEquals(ORDER_ID, notification.getOrderId());
            org.junit.jupiter.api.Assertions.assertEquals("ORD-001", notification.getOrderNumber());
            org.junit.jupiter.api.Assertions.assertEquals("PREPARING", notification.getPreviousStatus());
            org.junit.jupiter.api.Assertions.assertEquals("READY", notification.getNewStatus());
            org.junit.jupiter.api.Assertions.assertEquals(1234567890L, notification.getTimestamp());
        }
    }
}
