package com.oneeats.order.domain.event;

import com.oneeats.shared.domain.event.IDomainEvent;

import java.time.LocalDateTime;
import java.util.UUID;

public class OrderCreatedEvent implements IDomainEvent {
    
    private final UUID orderId;
    private final String orderNumber;
    private final UUID userId;
    private final UUID restaurantId;
    private final LocalDateTime occurredOn;

    public OrderCreatedEvent(UUID orderId, String orderNumber, UUID userId, UUID restaurantId) {
        this.orderId = orderId;
        this.orderNumber = orderNumber;
        this.userId = userId;
        this.restaurantId = restaurantId;
        this.occurredOn = LocalDateTime.now();
    }

    @Override
    public LocalDateTime occurredOn() {
        return occurredOn;
    }

    public UUID getOrderId() {
        return orderId;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public UUID getUserId() {
        return userId;
    }

    public UUID getRestaurantId() {
        return restaurantId;
    }
}