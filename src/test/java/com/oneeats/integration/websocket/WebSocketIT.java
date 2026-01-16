package com.oneeats.integration.websocket;

import com.oneeats.integration.IntegrationTestProfile;
import io.quarkus.test.common.http.TestHTTPResource;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.TestProfile;
import jakarta.websocket.*;
import org.junit.jupiter.api.*;

import java.net.URI;
import java.util.UUID;
import java.util.concurrent.*;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests d'integration pour les endpoints WebSocket
 * Teste les connexions WebSocket reelles avec le serveur Quarkus
 *
 * Note: Ces tests utilisent des timeouts configurables pour eviter les tests flaky.
 * En cas de CI lent, augmenter TIMEOUT_SECONDS.
 */
@QuarkusTest
@TestProfile(IntegrationTestProfile.class)
@DisplayName("WebSocket Integration Tests")
class WebSocketIT {

    // F7 Fix: Timeout configurable pour eviter les tests flaky
    private static final int TIMEOUT_SECONDS = 10; // Augmente de 5 a 10 pour CI lent

    @TestHTTPResource("/")
    URI baseUri;

    private static final UUID VALID_USER_ID = UUID.fromString("550e8400-e29b-41d4-a716-446655440000");
    private static final UUID VALID_RESTAURANT_ID = UUID.fromString("660e8400-e29b-41d4-a716-446655440001");
    private static final String INVALID_UUID = "not-a-valid-uuid";

    private WebSocketContainer container;

    @BeforeEach
    void setUp() {
        container = ContainerProvider.getWebSocketContainer();
    }

    /**
     * Construit l'URI WebSocket pour les notifications utilisateur
     */
    private URI buildNotificationUri(String userId) {
        String wsBase = baseUri.toString().replace("http://", "ws://").replace("https://", "wss://");
        if (!wsBase.endsWith("/")) {
            wsBase += "/";
        }
        return URI.create(wsBase + "ws/notifications/" + userId);
    }

    /**
     * Construit l'URI WebSocket pour les restaurants
     */
    private URI buildRestaurantUri(String restaurantId) {
        String wsBase = baseUri.toString().replace("http://", "ws://").replace("https://", "wss://");
        if (!wsBase.endsWith("/")) {
            wsBase += "/";
        }
        return URI.create(wsBase + "ws/restaurant/" + restaurantId);
    }

    @Nested
    @DisplayName("User Notification WebSocket - Valid Connections")
    class UserNotificationWebSocket {

        @Test
        @DisplayName("Should connect to notification endpoint with valid userId")
        void shouldConnectToNotificationEndpointWithValidUserId() throws Exception {
            // Given
            URI uri = buildNotificationUri(VALID_USER_ID.toString());
            TestWebSocketClient client = new TestWebSocketClient();

            // When
            Session session = container.connectToServer(client, uri);

            // Then
            assertTrue(session.isOpen(), "Session should be open");
            assertTrue(client.awaitConnection(TIMEOUT_SECONDS, TimeUnit.SECONDS), "Should connect successfully");

            // F7 Fix: Verify connection confirmation with assertion
            String message = client.awaitMessage(TIMEOUT_SECONDS, TimeUnit.SECONDS);
            assertNotNull(message, "Should receive connection confirmation");
            assertTrue(message.contains("\"type\":\"connected\""), "Message should be connection confirmation");

            session.close();
        }

        @Test
        @DisplayName("Should receive heartbeat response")
        void shouldReceiveHeartbeatResponse() throws Exception {
            // Given
            URI uri = buildNotificationUri(VALID_USER_ID.toString());
            TestWebSocketClient client = new TestWebSocketClient();
            Session session = container.connectToServer(client, uri);

            // Wait for connection confirmation
            assertTrue(client.awaitConnection(TIMEOUT_SECONDS, TimeUnit.SECONDS), "Should connect");

            // F7 Fix: Consume and verify connection message
            String connMsg = client.awaitMessage(TIMEOUT_SECONDS, TimeUnit.SECONDS);
            assertNotNull(connMsg, "Should receive connection message first");

            // When - Send heartbeat
            session.getBasicRemote().sendText("{\"type\":\"heartbeat\"}");

            // Then - Should receive heartbeat response
            String response = client.awaitMessage(TIMEOUT_SECONDS, TimeUnit.SECONDS);
            assertNotNull(response, "Should receive heartbeat response");
            assertTrue(response.contains("\"type\":\"heartbeat\""), "Response should be heartbeat");
            assertTrue(response.contains("\"timestamp\":"), "Heartbeat should contain timestamp");

            session.close();
        }

        @Test
        @DisplayName("Should receive echo for other messages")
        void shouldReceiveEchoForOtherMessages() throws Exception {
            // Given
            URI uri = buildNotificationUri(VALID_USER_ID.toString());
            TestWebSocketClient client = new TestWebSocketClient();
            Session session = container.connectToServer(client, uri);

            assertTrue(client.awaitConnection(TIMEOUT_SECONDS, TimeUnit.SECONDS));
            assertNotNull(client.awaitMessage(TIMEOUT_SECONDS, TimeUnit.SECONDS), "Should receive connection message");

            // When - Send arbitrary message
            session.getBasicRemote().sendText("Hello Server");

            // Then - Should receive echo
            String response = client.awaitMessage(TIMEOUT_SECONDS, TimeUnit.SECONDS);
            assertNotNull(response, "Should receive echo response");
            assertTrue(response.contains("\"type\":\"echo\""), "Response should be echo");

            session.close();
        }
    }

    @Nested
    @DisplayName("User Notification WebSocket - Invalid UUID Rejection")
    class UserNotificationWebSocketInvalidUUID {

        @Test
        @DisplayName("Should reject connection with invalid UUID format")
        void shouldRejectConnectionWithInvalidUuidFormat() throws Exception {
            // Given
            URI uri = buildNotificationUri(INVALID_UUID);
            TestWebSocketClient client = new TestWebSocketClient();

            // When
            Session session = container.connectToServer(client, uri);

            // Then - Connection should be closed by server due to invalid UUID
            // Wait a bit for server to process and close
            Thread.sleep(500);

            // Either session is closed, or we received a close reason
            if (session.isOpen()) {
                // If still open, wait for close
                boolean closed = client.awaitClose(TIMEOUT_SECONDS, TimeUnit.SECONDS);
                assertTrue(closed || !session.isOpen(), "Session should be closed for invalid UUID");
            }

            // Verify client received close or error
            assertTrue(
                !client.isConnected() || client.getCloseReason() != null,
                "Client should be disconnected or have close reason"
            );
        }
    }

    @Nested
    @DisplayName("Restaurant WebSocket - Valid Connections")
    class RestaurantWebSocketTests {

        @Test
        @DisplayName("Should connect to restaurant endpoint with valid restaurantId")
        void shouldConnectToRestaurantEndpointWithValidRestaurantId() throws Exception {
            // Given
            URI uri = buildRestaurantUri(VALID_RESTAURANT_ID.toString());
            TestWebSocketClient client = new TestWebSocketClient();

            // When
            Session session = container.connectToServer(client, uri);

            // Then
            assertTrue(session.isOpen(), "Session should be open");
            assertTrue(client.awaitConnection(TIMEOUT_SECONDS, TimeUnit.SECONDS), "Should connect");

            // Verify connection confirmation received
            String message = client.awaitMessage(TIMEOUT_SECONDS, TimeUnit.SECONDS);
            assertNotNull(message, "Should receive connection confirmation");
            assertTrue(message.contains("\"type\":\"connected\""), "Should be connected message");
            assertTrue(message.contains("\"restaurantId\":\"" + VALID_RESTAURANT_ID + "\""),
                "Should contain restaurant ID");

            session.close();
        }

        @Test
        @DisplayName("Should receive heartbeat response on restaurant endpoint")
        void shouldReceiveHeartbeatResponseOnRestaurantEndpoint() throws Exception {
            // Given
            URI uri = buildRestaurantUri(VALID_RESTAURANT_ID.toString());
            TestWebSocketClient client = new TestWebSocketClient();
            Session session = container.connectToServer(client, uri);

            assertTrue(client.awaitConnection(TIMEOUT_SECONDS, TimeUnit.SECONDS));
            assertNotNull(client.awaitMessage(TIMEOUT_SECONDS, TimeUnit.SECONDS), "Should receive connection message");

            // When - Send heartbeat
            session.getBasicRemote().sendText("{\"type\":\"heartbeat\"}");

            // Then - Should receive heartbeat response
            String response = client.awaitMessage(TIMEOUT_SECONDS, TimeUnit.SECONDS);
            assertNotNull(response, "Should receive heartbeat response");
            assertTrue(response.contains("\"type\":\"heartbeat\""), "Response should be heartbeat");

            session.close();
        }

        @Test
        @DisplayName("Should support multiple simultaneous connections to same restaurant")
        void shouldSupportMultipleSimultaneousConnections() throws Exception {
            // Given
            URI uri = buildRestaurantUri(VALID_RESTAURANT_ID.toString());
            TestWebSocketClient client1 = new TestWebSocketClient();
            TestWebSocketClient client2 = new TestWebSocketClient();

            // When
            Session session1 = container.connectToServer(client1, uri);
            Session session2 = container.connectToServer(client2, uri);

            // Then
            assertTrue(session1.isOpen(), "Session 1 should be open");
            assertTrue(session2.isOpen(), "Session 2 should be open");
            assertTrue(client1.awaitConnection(TIMEOUT_SECONDS, TimeUnit.SECONDS), "Client 1 should connect");
            assertTrue(client2.awaitConnection(TIMEOUT_SECONDS, TimeUnit.SECONDS), "Client 2 should connect");

            // Both should receive connection confirmations
            assertNotNull(client1.awaitMessage(TIMEOUT_SECONDS, TimeUnit.SECONDS), "Client 1 should receive message");
            assertNotNull(client2.awaitMessage(TIMEOUT_SECONDS, TimeUnit.SECONDS), "Client 2 should receive message");

            session1.close();
            session2.close();
        }
    }

    @Nested
    @DisplayName("Restaurant WebSocket - Invalid UUID Rejection")
    class RestaurantWebSocketInvalidUUID {

        @Test
        @DisplayName("Should reject connection with invalid restaurant UUID format")
        void shouldRejectConnectionWithInvalidRestaurantUuidFormat() throws Exception {
            // Given
            URI uri = buildRestaurantUri(INVALID_UUID);
            TestWebSocketClient client = new TestWebSocketClient();

            // When
            Session session = container.connectToServer(client, uri);

            // Then - Connection should be closed by server
            Thread.sleep(500);

            if (session.isOpen()) {
                boolean closed = client.awaitClose(TIMEOUT_SECONDS, TimeUnit.SECONDS);
                assertTrue(closed || !session.isOpen(), "Session should be closed for invalid UUID");
            }
        }
    }

    /**
     * Client WebSocket de test pour recevoir les messages
     */
    @ClientEndpoint
    public static class TestWebSocketClient {
        private final BlockingQueue<String> messages = new LinkedBlockingQueue<>();
        private final CountDownLatch connectionLatch = new CountDownLatch(1);
        private final CountDownLatch closeLatch = new CountDownLatch(1);
        private volatile boolean connected = false;
        private volatile Throwable error;
        private volatile CloseReason closeReason;

        @OnOpen
        public void onOpen(Session session) {
            connected = true;
            connectionLatch.countDown();
        }

        @OnMessage
        public void onMessage(String message) {
            messages.add(message);
        }

        @OnError
        public void onError(Session session, Throwable throwable) {
            error = throwable;
            connectionLatch.countDown();
            closeLatch.countDown();
        }

        @OnClose
        public void onClose(Session session, CloseReason reason) {
            connected = false;
            closeReason = reason;
            closeLatch.countDown();
        }

        public boolean awaitConnection(long timeout, TimeUnit unit) throws InterruptedException {
            return connectionLatch.await(timeout, unit) && connected && error == null;
        }

        public boolean awaitClose(long timeout, TimeUnit unit) throws InterruptedException {
            return closeLatch.await(timeout, unit);
        }

        public String awaitMessage(long timeout, TimeUnit unit) throws InterruptedException {
            return messages.poll(timeout, unit);
        }

        public boolean isConnected() {
            return connected;
        }

        public Throwable getError() {
            return error;
        }

        public CloseReason getCloseReason() {
            return closeReason;
        }
    }
}
