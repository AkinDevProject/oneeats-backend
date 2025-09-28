package com.oneeats.restaurant.domain.event;

import com.oneeats.shared.domain.event.IDomainEvent;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Événement de domaine émis lorsqu'un restaurant est approuvé par un admin
 */
public class RestaurantApprovedEvent implements IDomainEvent {

    private final UUID restaurantId;
    private final String restaurantName;
    private final LocalDateTime occurredOn;

    public RestaurantApprovedEvent(UUID restaurantId, String restaurantName) {
        this.restaurantId = restaurantId;
        this.restaurantName = restaurantName;
        this.occurredOn = LocalDateTime.now();
    }

    @Override
    public LocalDateTime occurredOn() {
        return occurredOn;
    }

    public UUID getRestaurantId() {
        return restaurantId;
    }

    public String getRestaurantName() {
        return restaurantName;
    }
}