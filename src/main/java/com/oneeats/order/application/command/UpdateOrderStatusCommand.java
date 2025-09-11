package com.oneeats.order.application.command;

import com.oneeats.order.domain.model.OrderStatus;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * Commande pour mettre à jour le statut d'une commande
 */
public class UpdateOrderStatusCommand {
    
    @NotNull
    private UUID orderId;
    
    @NotNull
    private OrderStatus newStatus;
    
    public UpdateOrderStatusCommand() {}
    
    public UpdateOrderStatusCommand(UUID orderId, OrderStatus newStatus) {
        this.orderId = orderId;
        this.newStatus = newStatus;
    }
    
    public UUID getOrderId() {
        return orderId;
    }
    
    public void setOrderId(UUID orderId) {
        this.orderId = orderId;
    }
    
    public OrderStatus getNewStatus() {
        return newStatus;
    }
    
    public void setNewStatus(OrderStatus newStatus) {
        this.newStatus = newStatus;
    }
}