package com.oneeats.order.infrastructure.web;

import com.oneeats.order.domain.model.OrderStatus;
import jakarta.validation.constraints.NotNull;

/**
 * Classe pour la désérialisation de la requête de mise à jour du statut
 */
public class OrderStatusUpdateRequest {
    
    @NotNull
    private OrderStatus newStatus;
    
    public OrderStatusUpdateRequest() {}
    
    public OrderStatusUpdateRequest(OrderStatus newStatus) {
        this.newStatus = newStatus;
    }
    
    public OrderStatus getNewStatus() {
        return newStatus;
    }
    
    public void setNewStatus(OrderStatus newStatus) {
        this.newStatus = newStatus;
    }
}