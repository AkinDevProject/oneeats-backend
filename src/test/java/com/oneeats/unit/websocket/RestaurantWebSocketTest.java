package com.oneeats.unit.websocket;

import com.oneeats.notification.infrastructure.websocket.RestaurantWebSocket;
import jakarta.websocket.*;
import org.junit.jupiter.api.*;
import org.mockito.*;

import java.io.IOException;
import java.lang.reflect.Field;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires pour RestaurantWebSocket
 * Teste la logique de multi-sessions par restaurant
 *
 * Note: Ces tests manipulent l'etat statique de RestaurantWebSocket via reflection.
 * Pour eviter la pollution d'etat entre tests:
 * - @BeforeEach et @AfterEach nettoient la map statique
 * - Les tests sont executes sequentiellement (pas en parallele)
 */
@DisplayName("RestaurantWebSocket Unit Tests")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class RestaurantWebSocketTest {

    private RestaurantWebSocket webSocket;

    @Mock
    private Session session;

    @Mock
    private RemoteEndpoint.Async asyncRemote;

    private AutoCloseable mocks;

    private static final UUID VALID_RESTAURANT_ID = UUID.fromString("550e8400-e29b-41d4-a716-446655440000");
    private static final String VALID_RESTAURANT_ID_STRING = VALID_RESTAURANT_ID.toString();
    private static final String INVALID_RESTAURANT_ID = "not-a-uuid";

    @BeforeEach
    void setUp() throws Exception {
        mocks = MockitoAnnotations.openMocks(this);
        webSocket = new RestaurantWebSocket();

        when(session.getAsyncRemote()).thenReturn(asyncRemote);
        when(session.getId()).thenReturn("test-session-id");
        when(session.isOpen()).thenReturn(true);

        // Clear the static sessions map before each test
        clearSessionsMap();
    }

    @AfterEach
    void tearDown() throws Exception {
        clearSessionsMap();
        mocks.close();
    }

    /**
     * Utilise la reflection pour vider la map statique des sessions
     */
    @SuppressWarnings("unchecked")
    private void clearSessionsMap() throws Exception {
        Field sessionsField = RestaurantWebSocket.class.getDeclaredField("restaurantSessions");
        sessionsField.setAccessible(true);
        Map<UUID, Set<Session>> sessions = (Map<UUID, Set<Session>>) sessionsField.get(null);
        sessions.clear();
    }

    @Nested
    @DisplayName("Connection Lifecycle")
    class ConnectionLifecycle {

        @Test
        @DisplayName("Should add session to restaurant Set")
        void shouldAddSessionToRestaurantSet() {
            // When
            webSocket.onOpen(session, VALID_RESTAURANT_ID_STRING);

            // Then
            assertTrue(RestaurantWebSocket.isRestaurantConnected(VALID_RESTAURANT_ID));
            assertEquals(1, RestaurantWebSocket.getRestaurantSessionCount(VALID_RESTAURANT_ID));
            verify(asyncRemote).sendText(contains("\"type\":\"connected\""));
        }

        @Test
        @DisplayName("Should support multiple sessions per restaurant")
        void shouldSupportMultipleSessionsPerRestaurant() {
            // Given
            Session session2 = mock(Session.class);
            Session session3 = mock(Session.class);
            RemoteEndpoint.Async async2 = mock(RemoteEndpoint.Async.class);
            RemoteEndpoint.Async async3 = mock(RemoteEndpoint.Async.class);

            when(session2.getAsyncRemote()).thenReturn(async2);
            when(session2.isOpen()).thenReturn(true);
            when(session2.getId()).thenReturn("session-2");

            when(session3.getAsyncRemote()).thenReturn(async3);
            when(session3.isOpen()).thenReturn(true);
            when(session3.getId()).thenReturn("session-3");

            // When
            webSocket.onOpen(session, VALID_RESTAURANT_ID_STRING);
            webSocket.onOpen(session2, VALID_RESTAURANT_ID_STRING);
            webSocket.onOpen(session3, VALID_RESTAURANT_ID_STRING);

            // Then
            assertEquals(3, RestaurantWebSocket.getRestaurantSessionCount(VALID_RESTAURANT_ID));
            assertEquals(1, RestaurantWebSocket.getConnectedRestaurantsCount());
            assertEquals(3, RestaurantWebSocket.getTotalSessionsCount());
        }

        @Test
        @DisplayName("Should reject invalid restaurantId format")
        void shouldRejectInvalidRestaurantIdFormat() throws IOException {
            // When
            webSocket.onOpen(session, INVALID_RESTAURANT_ID);

            // Then
            assertEquals(0, RestaurantWebSocket.getConnectedRestaurantsCount());
            verify(session).close(argThat(closeReason ->
                closeReason.getCloseCode() == CloseReason.CloseCodes.CANNOT_ACCEPT
            ));
        }

        @Test
        @DisplayName("Should remove session on close")
        void shouldRemoveSessionOnClose() {
            // Given
            webSocket.onOpen(session, VALID_RESTAURANT_ID_STRING);
            assertTrue(RestaurantWebSocket.isRestaurantConnected(VALID_RESTAURANT_ID));

            // When
            webSocket.onClose(session, VALID_RESTAURANT_ID_STRING,
                new CloseReason(CloseReason.CloseCodes.NORMAL_CLOSURE, "User disconnected"));

            // Then
            assertFalse(RestaurantWebSocket.isRestaurantConnected(VALID_RESTAURANT_ID));
            assertEquals(0, RestaurantWebSocket.getRestaurantSessionCount(VALID_RESTAURANT_ID));
        }

        @Test
        @DisplayName("Should clean up Set when last session closes")
        void shouldCleanUpSetWhenLastSessionCloses() {
            // Given
            Session session2 = mock(Session.class);
            RemoteEndpoint.Async async2 = mock(RemoteEndpoint.Async.class);
            when(session2.getAsyncRemote()).thenReturn(async2);
            when(session2.isOpen()).thenReturn(true);

            webSocket.onOpen(session, VALID_RESTAURANT_ID_STRING);
            webSocket.onOpen(session2, VALID_RESTAURANT_ID_STRING);
            assertEquals(2, RestaurantWebSocket.getRestaurantSessionCount(VALID_RESTAURANT_ID));

            // When - Remove first session
            webSocket.onClose(session, VALID_RESTAURANT_ID_STRING,
                new CloseReason(CloseReason.CloseCodes.NORMAL_CLOSURE, "Disconnect"));

            // Then - Still connected with 1 session
            assertTrue(RestaurantWebSocket.isRestaurantConnected(VALID_RESTAURANT_ID));
            assertEquals(1, RestaurantWebSocket.getRestaurantSessionCount(VALID_RESTAURANT_ID));

            // When - Remove second session
            webSocket.onClose(session2, VALID_RESTAURANT_ID_STRING,
                new CloseReason(CloseReason.CloseCodes.NORMAL_CLOSURE, "Disconnect"));

            // Then - No longer connected
            assertFalse(RestaurantWebSocket.isRestaurantConnected(VALID_RESTAURANT_ID));
            assertEquals(0, RestaurantWebSocket.getRestaurantSessionCount(VALID_RESTAURANT_ID));
        }

        @Test
        @DisplayName("Should remove session on error")
        void shouldRemoveSessionOnError() {
            // Given
            webSocket.onOpen(session, VALID_RESTAURANT_ID_STRING);
            assertTrue(RestaurantWebSocket.isRestaurantConnected(VALID_RESTAURANT_ID));

            // When
            webSocket.onError(session, VALID_RESTAURANT_ID_STRING, new RuntimeException("Connection error"));

            // Then
            assertFalse(RestaurantWebSocket.isRestaurantConnected(VALID_RESTAURANT_ID));
            assertEquals(0, RestaurantWebSocket.getRestaurantSessionCount(VALID_RESTAURANT_ID));
        }
    }

    @Nested
    @DisplayName("Message Handling")
    class MessageHandling {

        @Test
        @DisplayName("Should respond to heartbeat")
        void shouldRespondToHeartbeat() {
            // Given
            webSocket.onOpen(session, VALID_RESTAURANT_ID_STRING);
            reset(asyncRemote);

            // When
            webSocket.onMessage("{\"type\":\"heartbeat\"}", VALID_RESTAURANT_ID_STRING, session);

            // Then
            verify(asyncRemote).sendText(argThat(message ->
                message.contains("\"type\":\"heartbeat\"") && message.contains("\"timestamp\":")
            ));
        }

        @Test
        @DisplayName("Should echo other messages")
        void shouldEchoOtherMessages() {
            // Given
            webSocket.onOpen(session, VALID_RESTAURANT_ID_STRING);
            reset(asyncRemote);

            // When
            webSocket.onMessage("Hello Restaurant", VALID_RESTAURANT_ID_STRING, session);

            // Then
            verify(asyncRemote).sendText(contains("\"type\":\"echo\""));
        }

        @Test
        @DisplayName("Should not send to closed session")
        void shouldNotSendToClosedSession() {
            // Given
            webSocket.onOpen(session, VALID_RESTAURANT_ID_STRING);
            reset(asyncRemote);
            when(session.isOpen()).thenReturn(false);

            // When
            webSocket.onMessage("{\"type\":\"heartbeat\"}", VALID_RESTAURANT_ID_STRING, session);

            // Then
            verify(asyncRemote, never()).sendText(anyString());
        }
    }

    @Nested
    @DisplayName("Notification Broadcasting")
    class NotificationBroadcasting {

        @Test
        @DisplayName("Should send notification to all restaurant sessions")
        void shouldSendNotificationToAllRestaurantSessions() {
            // Given
            Session session2 = mock(Session.class);
            Session session3 = mock(Session.class);
            RemoteEndpoint.Async async2 = mock(RemoteEndpoint.Async.class);
            RemoteEndpoint.Async async3 = mock(RemoteEndpoint.Async.class);

            when(session2.getAsyncRemote()).thenReturn(async2);
            when(session2.isOpen()).thenReturn(true);
            when(session3.getAsyncRemote()).thenReturn(async3);
            when(session3.isOpen()).thenReturn(true);

            webSocket.onOpen(session, VALID_RESTAURANT_ID_STRING);
            webSocket.onOpen(session2, VALID_RESTAURANT_ID_STRING);
            webSocket.onOpen(session3, VALID_RESTAURANT_ID_STRING);

            reset(asyncRemote, async2, async3);
            String notification = "{\"type\":\"new_order\",\"orderId\":\"123\"}";

            // When
            RestaurantWebSocket.sendNotificationToRestaurant(VALID_RESTAURANT_ID, notification);

            // Then
            verify(asyncRemote).sendText(notification);
            verify(async2).sendText(notification);
            verify(async3).sendText(notification);
        }

        @Test
        @DisplayName("Should skip notification for disconnected restaurant")
        void shouldSkipNotificationForDisconnectedRestaurant() {
            // Given - No connection established
            String notification = "{\"type\":\"new_order\",\"orderId\":\"123\"}";

            // When
            RestaurantWebSocket.sendNotificationToRestaurant(VALID_RESTAURANT_ID, notification);

            // Then - Should not throw and nothing to verify
            verify(asyncRemote, never()).sendText(anyString());
        }

        @Test
        @DisplayName("Should skip closed sessions during broadcast")
        void shouldSkipClosedSessionsDuringBroadcast() {
            // Given
            Session session2 = mock(Session.class);
            RemoteEndpoint.Async async2 = mock(RemoteEndpoint.Async.class);

            when(session2.getAsyncRemote()).thenReturn(async2);
            when(session2.isOpen()).thenReturn(true);

            webSocket.onOpen(session, VALID_RESTAURANT_ID_STRING);
            webSocket.onOpen(session2, VALID_RESTAURANT_ID_STRING);

            // Mark first session as closed
            when(session.isOpen()).thenReturn(false);
            reset(asyncRemote, async2);

            // When
            RestaurantWebSocket.sendNotificationToRestaurant(VALID_RESTAURANT_ID,
                "{\"type\":\"notification\"}");

            // Then
            verify(asyncRemote, never()).sendText(anyString()); // Closed session
            verify(async2).sendText(anyString()); // Open session
        }

        @Test
        @DisplayName("Should remove session on send exception during broadcast")
        void shouldRemoveSessionOnSendExceptionDuringBroadcast() {
            // Given
            webSocket.onOpen(session, VALID_RESTAURANT_ID_STRING);
            reset(asyncRemote);
            doThrow(new RuntimeException("Send failed")).when(asyncRemote).sendText(anyString());

            int initialCount = RestaurantWebSocket.getRestaurantSessionCount(VALID_RESTAURANT_ID);

            // When
            RestaurantWebSocket.sendNotificationToRestaurant(VALID_RESTAURANT_ID, "notification");

            // Then
            assertTrue(RestaurantWebSocket.getRestaurantSessionCount(VALID_RESTAURANT_ID) < initialCount);
        }
    }

    @Nested
    @DisplayName("Connection Status")
    class ConnectionStatus {

        @Test
        @DisplayName("Should detect connected restaurant")
        void shouldDetectConnectedRestaurant() {
            // Given
            webSocket.onOpen(session, VALID_RESTAURANT_ID_STRING);

            // When & Then
            assertTrue(RestaurantWebSocket.isRestaurantConnected(VALID_RESTAURANT_ID));
        }

        @Test
        @DisplayName("Should detect disconnected restaurant")
        void shouldDetectDisconnectedRestaurant() {
            // When & Then
            assertFalse(RestaurantWebSocket.isRestaurantConnected(VALID_RESTAURANT_ID));
        }

        @Test
        @DisplayName("Should return false if all sessions are closed")
        void shouldReturnFalseIfAllSessionsAreClosed() {
            // Given
            webSocket.onOpen(session, VALID_RESTAURANT_ID_STRING);
            when(session.isOpen()).thenReturn(false);

            // When & Then
            assertFalse(RestaurantWebSocket.isRestaurantConnected(VALID_RESTAURANT_ID));
        }

        @Test
        @DisplayName("Should count restaurant sessions")
        void shouldCountRestaurantSessions() {
            // Given
            assertEquals(0, RestaurantWebSocket.getRestaurantSessionCount(VALID_RESTAURANT_ID));

            Session session2 = mock(Session.class);
            RemoteEndpoint.Async async2 = mock(RemoteEndpoint.Async.class);
            when(session2.getAsyncRemote()).thenReturn(async2);
            when(session2.isOpen()).thenReturn(true);

            // When
            webSocket.onOpen(session, VALID_RESTAURANT_ID_STRING);
            webSocket.onOpen(session2, VALID_RESTAURANT_ID_STRING);

            // Then
            assertEquals(2, RestaurantWebSocket.getRestaurantSessionCount(VALID_RESTAURANT_ID));
        }

        @Test
        @DisplayName("Should count connected restaurants")
        void shouldCountConnectedRestaurants() {
            // Given
            UUID restaurant2Id = UUID.randomUUID();
            Session session2 = mock(Session.class);
            RemoteEndpoint.Async async2 = mock(RemoteEndpoint.Async.class);
            when(session2.getAsyncRemote()).thenReturn(async2);
            when(session2.isOpen()).thenReturn(true);

            // When
            webSocket.onOpen(session, VALID_RESTAURANT_ID_STRING);
            webSocket.onOpen(session2, restaurant2Id.toString());

            // Then
            assertEquals(2, RestaurantWebSocket.getConnectedRestaurantsCount());
        }

        @Test
        @DisplayName("Should count total sessions")
        void shouldCountTotalSessions() {
            // Given
            UUID restaurant2Id = UUID.randomUUID();

            Session session2 = mock(Session.class);
            Session session3 = mock(Session.class);
            RemoteEndpoint.Async async2 = mock(RemoteEndpoint.Async.class);
            RemoteEndpoint.Async async3 = mock(RemoteEndpoint.Async.class);

            when(session2.getAsyncRemote()).thenReturn(async2);
            when(session2.isOpen()).thenReturn(true);
            when(session3.getAsyncRemote()).thenReturn(async3);
            when(session3.isOpen()).thenReturn(true);

            // When - 2 sessions for restaurant 1, 1 session for restaurant 2
            webSocket.onOpen(session, VALID_RESTAURANT_ID_STRING);
            webSocket.onOpen(session2, VALID_RESTAURANT_ID_STRING);
            webSocket.onOpen(session3, restaurant2Id.toString());

            // Then
            assertEquals(3, RestaurantWebSocket.getTotalSessionsCount());
        }
    }
}
