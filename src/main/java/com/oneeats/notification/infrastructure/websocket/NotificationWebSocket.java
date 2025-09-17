package com.oneeats.notification.infrastructure.websocket;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;

@ServerEndpoint("/ws/notifications/{userId}")
@ApplicationScoped
public class NotificationWebSocket {

    private static final Logger LOGGER = Logger.getLogger(NotificationWebSocket.class.getName());

    // Map to store user sessions
    private static final Map<UUID, Session> sessions = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session, @PathParam("userId") String userId) {
        try {
            UUID userUuid = UUID.fromString(userId);
            sessions.put(userUuid, session);
            LOGGER.info("🔌 WebSocket connection OPENED for user: " + userId +
                       " - Session ID: " + session.getId() +
                       " - Total active sessions: " + sessions.size());

            // Send connection confirmation
            session.getAsyncRemote().sendText("{\"type\":\"connected\",\"message\":\"WebSocket connected successfully\"}");
            LOGGER.info("✅ Confirmation message sent to user: " + userId);
        } catch (IllegalArgumentException e) {
            LOGGER.warning("Invalid userId format: " + userId);
            try {
                session.close(new CloseReason(CloseReason.CloseCodes.CANNOT_ACCEPT, "Invalid userId format"));
            } catch (IOException ex) {
                LOGGER.severe("Error closing invalid session: " + ex.getMessage());
            }
        }
    }

    @OnClose
    public void onClose(Session session, @PathParam("userId") String userId, CloseReason closeReason) {
        try {
            UUID userUuid = UUID.fromString(userId);
            sessions.remove(userUuid);
            LOGGER.warning("❌ WebSocket connection CLOSED for user: " + userId +
                          " - Session ID: " + session.getId() +
                          " - Reason: " + closeReason.getReasonPhrase() +
                          " - Code: " + closeReason.getCloseCode() +
                          " - Active sessions remaining: " + sessions.size());
        } catch (IllegalArgumentException e) {
            LOGGER.warning("Invalid userId format on close: " + userId);
        }
    }

    @OnError
    public void onError(Session session, @PathParam("userId") String userId, Throwable throwable) {
        LOGGER.severe("💥 WebSocket ERROR for user: " + userId +
                     " - Session ID: " + session.getId() +
                     " - Error: " + throwable.getMessage() +
                     " - Stack trace: ");
        try {
            UUID userUuid = UUID.fromString(userId);
            sessions.remove(userUuid);
        } catch (IllegalArgumentException e) {
            LOGGER.warning("Invalid userId format on error: " + userId);
        }
    }

    @OnMessage
    public void onMessage(String message, @PathParam("userId") String userId) {
        LOGGER.info("📨 Received message from user " + userId + ": " + message);

        try {
            UUID userUuid = UUID.fromString(userId);
            Session session = sessions.get(userUuid);

            if (session != null && session.isOpen()) {
                // Parse le message pour détecter les heartbeats
                if (message.contains("\"type\":\"heartbeat\"")) {
                    LOGGER.info("💓 Heartbeat received from user: " + userId);
                    // Répondre au heartbeat
                    session.getAsyncRemote().sendText("{\"type\":\"heartbeat\",\"timestamp\":" + System.currentTimeMillis() + "}");
                } else {
                    // Echo back other messages
                    session.getAsyncRemote().sendText("{\"type\":\"echo\",\"message\":\"" + message + "\"}");
                }
            }
        } catch (IllegalArgumentException e) {
            LOGGER.warning("Invalid userId format in message: " + userId);
        } catch (Exception e) {
            LOGGER.severe("Error processing message from user " + userId + ": " + e.getMessage());
        }
    }

    /**
     * Send notification to a specific user
     */
    public static void sendNotificationToUser(UUID userId, String notification) {
        Session session = sessions.get(userId);
        if (session != null && session.isOpen()) {
            try {
                session.getAsyncRemote().sendText(notification);
                LOGGER.info("Notification sent to user: " + userId);
            } catch (Exception e) {
                LOGGER.severe("Error sending notification to user " + userId + ": " + e.getMessage());
                // Remove invalid session
                sessions.remove(userId);
            }
        } else {
            LOGGER.info("No active WebSocket session found for user: " + userId);
        }
    }

    /**
     * Get the number of active connections
     */
    public static int getActiveConnectionsCount() {
        return sessions.size();
    }

    /**
     * Check if a user has an active WebSocket connection
     */
    public static boolean isUserConnected(UUID userId) {
        Session session = sessions.get(userId);
        return session != null && session.isOpen();
    }
}
