package com.oneeats.order.domain.events;

import com.oneeats.common.domain.AbstractDomainEvent;
import com.oneeats.order.domain.OrderStatus;

import java.util.Objects;
import java.util.UUID;

/**
 * Événement émis lors du changement de statut d'une commande
 */
public class OrderStatusChangedEvent extends AbstractDomainEvent {
    
    private final UUID orderId;
    private final UUID userId;
    private final UUID restaurantId;
    private final OrderStatus previousStatus;
    private final OrderStatus newStatus;
    
    public OrderStatusChangedEvent(UUID orderId, UUID userId, UUID restaurantId, 
                                 OrderStatus previousStatus, OrderStatus newStatus) {
        super();
        this.orderId = Objects.requireNonNull(orderId, "L'ID de la commande ne peut pas être null");
        this.userId = Objects.requireNonNull(userId, "L'ID utilisateur ne peut pas être null");
        this.restaurantId = Objects.requireNonNull(restaurantId, "L'ID restaurant ne peut pas être null");
        this.previousStatus = Objects.requireNonNull(previousStatus, "Le statut précédent ne peut pas être null");
        this.newStatus = Objects.requireNonNull(newStatus, "Le nouveau statut ne peut pas être null");
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
    
    public OrderStatus getPreviousStatus() {
        return previousStatus;
    }
    
    public OrderStatus getNewStatus() {
        return newStatus;
    }
    
    /**
     * Vérifie si la commande vient d'être confirmée (passage en préparation)
     */
    public boolean isOrderConfirmed() {
        return previousStatus == OrderStatus.EN_ATTENTE && newStatus == OrderStatus.EN_PREPARATION;
    }
    
    /**
     * Vérifie si la commande est prête à récupérer
     */
    public boolean isOrderReady() {
        return newStatus == OrderStatus.PRETE;
    }
    
    /**
     * Vérifie si la commande a été annulée
     */
    public boolean isOrderCancelled() {
        return newStatus == OrderStatus.ANNULEE;
    }
    
    /**
     * Vérifie si la commande a été récupérée
     */
    public boolean isOrderCompleted() {
        return newStatus == OrderStatus.RECUPEREE;
    }
    
    @Override
    public String toString() {
        return String.format("OrderStatusChangedEvent{orderId=%s, userId=%s, restaurantId=%s, %s -> %s, eventId=%s, occurredAt=%s}", 
            orderId, userId, restaurantId, previousStatus, newStatus, getEventId(), getOccurredAt());
    }
}