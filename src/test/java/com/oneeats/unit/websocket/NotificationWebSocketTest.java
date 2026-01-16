package com.oneeats.unit.websocket;

import com.oneeats.notification.infrastructure.websocket.NotificationWebSocket;
import jakarta.websocket.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.TestMethodOrder;
import org.mockito.*;

import java.io.IOException;
import java.lang.reflect.Field;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires pour NotificationWebSocket
 * Teste la logique de connexion, heartbeat, et notifications utilisateur
 *
 * Note: Ces tests manipulent l'etat statique de NotificationWebSocket via reflection.
 * Pour eviter la pollution d'etat entre tests:
 * - @BeforeEach et @AfterEach nettoient la map statique
 * - Les tests sont executes sequentiellement (pas en parallele)
 * - Chaque test est isole grace au nettoyage systematique
 */
@DisplayName("NotificationWebSocket Unit Tests")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class NotificationWebSocketTest {

    private NotificationWebSocket webSocket;

    @Mock
    private Session session;

    @Mock
    private RemoteEndpoint.Async asyncRemote;

    private AutoCloseable mocks;

    private static final UUID VALID_USER_ID = UUID.fromString("550e8400-e29b-41d4-a716-446655440000");
    private static final String VALID_USER_ID_STRING = VALID_USER_ID.toString();
    private static final String INVALID_USER_ID = "not-a-uuid";

    @BeforeEach
    void setUp() throws Exception {
        mocks = MockitoAnnotations.openMocks(this);
        webSocket = new NotificationWebSocket();

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
        Field sessionsField = NotificationWebSocket.class.getDeclaredField("sessions");
        sessionsField.setAccessible(true);
        Map<UUID, Session> sessions = (Map<UUID, Session>) sessionsField.get(null);
        sessions.clear();
    }

    @Nested
    @DisplayName("Connection Lifecycle")
    class ConnectionLifecycle {

        @Test
        @DisplayName("Should add session on valid userId connection")
        void shouldAddSessionOnValidUserIdConnection() {
            // When
            webSocket.onOpen(session, VALID_USER_ID_STRING);

            // Then
            assertTrue(NotificationWebSocket.isUserConnected(VALID_USER_ID));
            assertEquals(1, NotificationWebSocket.getActiveConnectionsCount());
            verify(asyncRemote).sendText(contains("\"type\":\"connected\""));
        }

        @Test
        @DisplayName("Should reject invalid userId format")
        void shouldRejectInvalidUserIdFormat() throws IOException {
            // When
            webSocket.onOpen(session, INVALID_USER_ID);

            // Then
            assertEquals(0, NotificationWebSocket.getActiveConnectionsCount());
            verify(session).close(argThat(closeReason ->
                closeReason.getCloseCode() == CloseReason.CloseCodes.CANNOT_ACCEPT
            ));
        }

        @Test
        @DisplayName("Should remove session on close")
        void shouldRemoveSessionOnClose() {
            // Given
            webSocket.onOpen(session, VALID_USER_ID_STRING);
            assertTrue(NotificationWebSocket.isUserConnected(VALID_USER_ID));

            // When
            webSocket.onClose(session, VALID_USER_ID_STRING,
                new CloseReason(CloseReason.CloseCodes.NORMAL_CLOSURE, "User disconnected"));

            // Then
            assertFalse(NotificationWebSocket.isUserConnected(VALID_USER_ID));
            assertEquals(0, NotificationWebSocket.getActiveConnectionsCount());
        }

        @Test
        @DisplayName("Should remove session on error")
        void shouldRemoveSessionOnError() {
            // Given
            webSocket.onOpen(session, VALID_USER_ID_STRING);
            assertTrue(NotificationWebSocket.isUserConnected(VALID_USER_ID));

            // When
            webSocket.onError(session, VALID_USER_ID_STRING, new RuntimeException("Connection error"));

            // Then
            assertFalse(NotificationWebSocket.isUserConnected(VALID_USER_ID));
            assertEquals(0, NotificationWebSocket.getActiveConnectionsCount());
        }

        @Test
        @DisplayName("Should handle close with invalid userId gracefully")
        void shouldHandleCloseWithInvalidUserIdGracefully() {
            // When & Then - Should not throw
            assertDoesNotThrow(() ->
                webSocket.onClose(session, INVALID_USER_ID,
                    new CloseReason(CloseReason.CloseCodes.NORMAL_CLOSURE, "Disconnect"))
            );
        }

        @Test
        @DisplayName("Should handle error with invalid userId gracefully")
        void shouldHandleErrorWithInvalidUserIdGracefully() {
            // When & Then - Should not throw
            assertDoesNotThrow(() ->
                webSocket.onError(session, INVALID_USER_ID, new RuntimeException("Error"))
            );
        }
    }

    @Nested
    @DisplayName("Message Handling")
    class MessageHandling {

        @Test
        @DisplayName("Should respond to heartbeat")
        void shouldRespondToHeartbeat() {
            // Given
            webSocket.onOpen(session, VALID_USER_ID_STRING);
            reset(asyncRemote); // Clear the connection confirmation

            // When
            webSocket.onMessage("{\"type\":\"heartbeat\"}", VALID_USER_ID_STRING);

            // Then
            verify(asyncRemote).sendText(argThat(message ->
                message.contains("\"type\":\"heartbeat\"") && message.contains("\"timestamp\":")
            ));
        }

        @Test
        @DisplayName("Should echo other messages")
        void shouldEchoOtherMessages() {
            // Given
            webSocket.onOpen(session, VALID_USER_ID_STRING);
            reset(asyncRemote);

            // When
            webSocket.onMessage("Hello World", VALID_USER_ID_STRING);

            // Then
            verify(asyncRemote).sendText(contains("\"type\":\"echo\""));
        }

        @Test
        @DisplayName("Should handle message with invalid userId")
        void shouldHandleMessageWithInvalidUserId() {
            // When & Then - Should not throw
            assertDoesNotThrow(() ->
                webSocket.onMessage("test message", INVALID_USER_ID)
            );
        }

        @Test
        @DisplayName("Should not send message to closed session")
        void shouldNotSendMessageToClosedSession() {
            // Given
            webSocket.onOpen(session, VALID_USER_ID_STRING);
            reset(asyncRemote);
            when(session.isOpen()).thenReturn(false);

            // When
            webSocket.onMessage("{\"type\":\"heartbeat\"}", VALID_USER_ID_STRING);

            // Then
            verify(asyncRemote, never()).sendText(anyString());
        }
    }

    @Nested
    @DisplayName("Notification Sending")
    class NotificationSending {

        @Test
        @DisplayName("Should send notification to connected user")
        void shouldSendNotificationToConnectedUser() {
            // Given
            webSocket.onOpen(session, VALID_USER_ID_STRING);
            reset(asyncRemote);
            String notification = "{\"type\":\"order_status\",\"message\":\"Order ready\"}";

            // When
            NotificationWebSocket.sendNotificationToUser(VALID_USER_ID, notification);

            // Then
            verify(asyncRemote).sendText(notification);
        }

        @Test
        @DisplayName("Should skip notification for disconnected user")
        void shouldSkipNotificationForDisconnectedUser() {
            // Given - No connection established
            String notification = "{\"type\":\"order_status\",\"message\":\"Order ready\"}";

            // When
            NotificationWebSocket.sendNotificationToUser(VALID_USER_ID, notification);

            // Then
            verify(asyncRemote, never()).sendText(anyString());
        }

        @Test
        @DisplayName("Should skip notification for closed session")
        void shouldSkipNotificationForClosedSession() {
            // Given
            webSocket.onOpen(session, VALID_USER_ID_STRING);
            reset(asyncRemote);
            when(session.isOpen()).thenReturn(false);

            // When
            NotificationWebSocket.sendNotificationToUser(VALID_USER_ID, "notification");

            // Then
            verify(asyncRemote, never()).sendText(anyString());
        }

        @Test
        @DisplayName("Should remove session on send exception")
        void shouldRemoveSessionOnSendException() {
            // Given
            webSocket.onOpen(session, VALID_USER_ID_STRING);
            reset(asyncRemote);
            doThrow(new RuntimeException("Send failed")).when(asyncRemote).sendText(anyString());

            // When
            NotificationWebSocket.sendNotificationToUser(VALID_USER_ID, "notification");

            // Then
            assertFalse(NotificationWebSocket.isUserConnected(VALID_USER_ID));
        }
    }

    @Nested
    @DisplayName("Connection Status")
    class ConnectionStatus {

        @Test
        @DisplayName("Should return correct connection status when connected")
        void shouldReturnCorrectConnectionStatusWhenConnected() {
            // Given
            webSocket.onOpen(session, VALID_USER_ID_STRING);

            // When & Then
            assertTrue(NotificationWebSocket.isUserConnected(VALID_USER_ID));
        }

        @Test
        @DisplayName("Should return correct connection status when not connected")
        void shouldReturnCorrectConnectionStatusWhenNotConnected() {
            // When & Then
            assertFalse(NotificationWebSocket.isUserConnected(VALID_USER_ID));
        }

        @Test
        @DisplayName("Should return false for closed session")
        void shouldReturnFalseForClosedSession() {
            // Given
            webSocket.onOpen(session, VALID_USER_ID_STRING);
            when(session.isOpen()).thenReturn(false);

            // When & Then
            assertFalse(NotificationWebSocket.isUserConnected(VALID_USER_ID));
        }

        @Test
        @DisplayName("Should count active connections")
        void shouldCountActiveConnections() {
            // Given - Start with 0
            assertEquals(0, NotificationWebSocket.getActiveConnectionsCount());

            // When - Add one connection
            webSocket.onOpen(session, VALID_USER_ID_STRING);

            // Then
            assertEquals(1, NotificationWebSocket.getActiveConnectionsCount());
        }

        @Test
        @DisplayName("Should count multiple connections")
        void shouldCountMultipleConnections() throws Exception {
            // Given
            UUID userId2 = UUID.randomUUID();
            Session session2 = mock(Session.class);
            RemoteEndpoint.Async asyncRemote2 = mock(RemoteEndpoint.Async.class);
            when(session2.getAsyncRemote()).thenReturn(asyncRemote2);
            when(session2.isOpen()).thenReturn(true);

            // When
            webSocket.onOpen(session, VALID_USER_ID_STRING);
            webSocket.onOpen(session2, userId2.toString());

            // Then
            assertEquals(2, NotificationWebSocket.getActiveConnectionsCount());
        }
    }
}
