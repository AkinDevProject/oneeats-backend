package com.oneeats.notification.infrastructure.websocket;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.logging.Logger;

/**
 * WebSocket endpoint pour les restaurants.
 * Permet de recevoir les notifications de nouvelles commandes et changements de statut en temps reel.
 *
 * URL: /ws/restaurant/{restaurantId}
 */
@ServerEndpoint("/ws/restaurant/{restaurantId}")
@ApplicationScoped
public class RestaurantWebSocket {

    private static final Logger LOGGER = Logger.getLogger(RestaurantWebSocket.class.getName());

    // Map pour stocker les sessions par restaurant (un restaurant peut avoir plusieurs sessions - plusieurs onglets/appareils)
    private static final Map<UUID, Set<Session>> restaurantSessions = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session, @PathParam("restaurantId") String restaurantId) {
        try {
            UUID restaurantUuid = UUID.fromString(restaurantId);

            // Ajouter la session au set de sessions du restaurant
            restaurantSessions.computeIfAbsent(restaurantUuid, k -> new CopyOnWriteArraySet<>()).add(session);

            int totalSessions = restaurantSessions.values().stream().mapToInt(Set::size).sum();
            LOGGER.info("🍽️ Restaurant WebSocket OPENED for restaurant: " + restaurantId +
                       " - Session ID: " + session.getId() +
                       " - Sessions for this restaurant: " + restaurantSessions.get(restaurantUuid).size() +
                       " - Total restaurant sessions: " + totalSessions);

            // Envoyer confirmation de connexion
            session.getAsyncRemote().sendText("{\"type\":\"connected\",\"restaurantId\":\"" + restaurantId + "\",\"message\":\"Restaurant WebSocket connected successfully\"}");

        } catch (IllegalArgumentException e) {
            LOGGER.warning("Invalid restaurantId format: " + restaurantId);
            try {
                session.close(new CloseReason(CloseReason.CloseCodes.CANNOT_ACCEPT, "Invalid restaurantId format"));
            } catch (IOException ex) {
                LOGGER.severe("Error closing invalid session: " + ex.getMessage());
            }
        }
    }

    @OnClose
    public void onClose(Session session, @PathParam("restaurantId") String restaurantId, CloseReason closeReason) {
        try {
            UUID restaurantUuid = UUID.fromString(restaurantId);
            Set<Session> sessions = restaurantSessions.get(restaurantUuid);

            if (sessions != null) {
                sessions.remove(session);
                // Nettoyer si plus de sessions pour ce restaurant
                if (sessions.isEmpty()) {
                    restaurantSessions.remove(restaurantUuid);
                }
            }

            LOGGER.info("🍽️ Restaurant WebSocket CLOSED for restaurant: " + restaurantId +
                       " - Session ID: " + session.getId() +
                       " - Reason: " + closeReason.getReasonPhrase());

        } catch (IllegalArgumentException e) {
            LOGGER.warning("Invalid restaurantId format on close: " + restaurantId);
        }
    }

    @OnError
    public void onError(Session session, @PathParam("restaurantId") String restaurantId, Throwable throwable) {
        LOGGER.severe("💥 Restaurant WebSocket ERROR for restaurant: " + restaurantId +
                     " - Session ID: " + session.getId() +
                     " - Error: " + throwable.getMessage());
        try {
            UUID restaurantUuid = UUID.fromString(restaurantId);
            Set<Session> sessions = restaurantSessions.get(restaurantUuid);
            if (sessions != null) {
                sessions.remove(session);
                if (sessions.isEmpty()) {
                    restaurantSessions.remove(restaurantUuid);
                }
            }
        } catch (IllegalArgumentException e) {
            LOGGER.warning("Invalid restaurantId format on error: " + restaurantId);
        }
    }

    @OnMessage
    public void onMessage(String message, @PathParam("restaurantId") String restaurantId, Session session) {
        LOGGER.info("📨 Received message from restaurant " + restaurantId + ": " + message);

        try {
            if (session.isOpen()) {
                // Repondre aux heartbeats
                if (message.contains("\"type\":\"heartbeat\"")) {
                    LOGGER.info("💓 Heartbeat received from restaurant: " + restaurantId);
                    session.getAsyncRemote().sendText("{\"type\":\"heartbeat\",\"timestamp\":" + System.currentTimeMillis() + "}");
                } else {
                    // Echo pour autres messages
                    session.getAsyncRemote().sendText("{\"type\":\"echo\",\"message\":\"" + message + "\"}");
                }
            }
        } catch (Exception e) {
            LOGGER.severe("Error processing message from restaurant " + restaurantId + ": " + e.getMessage());
        }
    }

    /**
     * Envoyer une notification a un restaurant specifique (toutes ses sessions)
     */
    public static void sendNotificationToRestaurant(UUID restaurantId, String notification) {
        Set<Session> sessions = restaurantSessions.get(restaurantId);

        if (sessions != null && !sessions.isEmpty()) {
            int sentCount = 0;
            for (Session session : sessions) {
                if (session.isOpen()) {
                    try {
                        session.getAsyncRemote().sendText(notification);
                        sentCount++;
                    } catch (Exception e) {
                        LOGGER.severe("Error sending notification to restaurant " + restaurantId + ": " + e.getMessage());
                        sessions.remove(session);
                    }
                } else {
                    sessions.remove(session);
                }
            }
            LOGGER.info("📤 Notification sent to restaurant " + restaurantId + " (" + sentCount + " sessions)");
        } else {
            LOGGER.info("No active WebSocket sessions for restaurant: " + restaurantId);
        }
    }

    /**
     * Verifier si un restaurant a des sessions actives
     */
    public static boolean isRestaurantConnected(UUID restaurantId) {
        Set<Session> sessions = restaurantSessions.get(restaurantId);
        return sessions != null && sessions.stream().anyMatch(Session::isOpen);
    }

    /**
     * Obtenir le nombre de sessions actives pour un restaurant
     */
    public static int getRestaurantSessionCount(UUID restaurantId) {
        Set<Session> sessions = restaurantSessions.get(restaurantId);
        if (sessions == null) return 0;
        return (int) sessions.stream().filter(Session::isOpen).count();
    }

    /**
     * Obtenir le nombre total de restaurants connectes
     */
    public static int getConnectedRestaurantsCount() {
        return (int) restaurantSessions.entrySet().stream()
            .filter(entry -> entry.getValue().stream().anyMatch(Session::isOpen))
            .count();
    }

    /**
     * Obtenir le nombre total de sessions restaurant
     */
    public static int getTotalSessionsCount() {
        return restaurantSessions.values().stream()
            .mapToInt(sessions -> (int) sessions.stream().filter(Session::isOpen).count())
            .sum();
    }
}
