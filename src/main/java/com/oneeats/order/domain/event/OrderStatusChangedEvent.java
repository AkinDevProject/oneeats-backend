package com.oneeats.order.domain.event;

import com.oneeats.order.domain.model.OrderStatus;
import com.oneeats.shared.domain.event.IDomainEvent;

import java.time.LocalDateTime;
import java.util.UUID;

public class OrderStatusChangedEvent implements IDomainEvent {

    private final UUID orderId;
    private final UUID userId;
    private final UUID restaurantId;
    private final OrderStatus previousStatus;
    private final OrderStatus newStatus;
    private final LocalDateTime occurredOn;

    public OrderStatusChangedEvent(UUID orderId, UUID userId, UUID restaurantId, OrderStatus previousStatus, OrderStatus newStatus) {
        this.orderId = orderId;
        this.userId = userId;
        this.restaurantId = restaurantId;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.occurredOn = LocalDateTime.now();
    }

    @Override
    public LocalDateTime occurredOn() {
        return occurredOn;
    }

    public UUID getOrderId() {
        return orderId;
    }

    public OrderStatus getPreviousStatus() {
        return previousStatus;
    }

    public OrderStatus getNewStatus() {
        return newStatus;
    }

    public UUID getUserId() {
        return userId;
    }

    public UUID getRestaurantId() {
        return restaurantId;
    }
}