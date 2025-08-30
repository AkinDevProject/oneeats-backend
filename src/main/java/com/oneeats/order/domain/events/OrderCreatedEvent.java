package com.oneeats.order.domain.events;

import com.oneeats.common.domain.AbstractDomainEvent;
import com.oneeats.order.domain.Order;

import java.math.BigDecimal;
import java.util.Objects;
import java.util.UUID;

/**
 * Événement émis lors de la création d'une commande
 */
public class OrderCreatedEvent extends AbstractDomainEvent {
    
    private final UUID orderId;
    private final UUID userId;
    private final UUID restaurantId;
    private final BigDecimal totalAmount;
    private final String specialInstructions;
    private final int itemCount;
    
    public OrderCreatedEvent(Order order) {
        super();
        this.orderId = Objects.requireNonNull(order.getId(), "L'ID de la commande ne peut pas être null");
        this.userId = order.getUserId();
        this.restaurantId = order.getRestaurantId();
        this.totalAmount = order.getTotalAmount();
        this.specialInstructions = order.getSpecialInstructions();
        this.itemCount = order.getItems().size();
    }
    
    public UUID getOrderId() {
        return orderId;
    }
    
    public UUID getUserId() {
        return userId;
    }
    
    public UUID getRestaurantId() {
        return restaurantId;
    }
    
    public BigDecimal getTotalAmount() {
        return totalAmount;
    }
    
    public String getSpecialInstructions() {
        return specialInstructions;
    }
    
    public int getItemCount() {
        return itemCount;
    }
    
    @Override
    public String toString() {
        return String.format("OrderCreatedEvent{orderId=%s, userId=%s, restaurantId=%s, totalAmount=%s, itemCount=%d, eventId=%s, occurredAt=%s}", 
            orderId, userId, restaurantId, totalAmount, itemCount, getEventId(), getOccurredAt());
    }
}