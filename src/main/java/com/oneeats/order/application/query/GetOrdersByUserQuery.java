package com.oneeats.order.application.query;

import java.util.UUID;

/**
 * Query pour récupérer les commandes d'un utilisateur
 */
public class GetOrdersByUserQuery {
    private final UUID userId;

    public GetOrdersByUserQuery(UUID userId) {
        this.userId = userId;
    }

    public UUID getUserId() {
        return userId;
    }
}