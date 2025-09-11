package com.oneeats.restaurant.domain.event;

import com.oneeats.shared.domain.event.IDomainEvent;
import com.oneeats.shared.domain.vo.Email;

import java.time.LocalDateTime;
import java.util.UUID;

public class RestaurantCreatedEvent implements IDomainEvent {
    
    private final UUID restaurantId;
    private final String restaurantName;
    private final Email email;
    private final LocalDateTime occurredOn;

    public RestaurantCreatedEvent(UUID restaurantId, String restaurantName, Email email) {
        this.restaurantId = restaurantId;
        this.restaurantName = restaurantName;
        this.email = email;
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

    public Email getEmail() {
        return email;
    }
}