package com.oneeats.order.api;

import com.oneeats.order.domain.OrderStatus;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO pour les commandes
 */
public record OrderDto(
    UUID id,
    UUID userId,
    UUID restaurantId,
    OrderStatus status,
    BigDecimal totalAmount,
    String specialInstructions,
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime createdAt,
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime updatedAt,
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime estimatedPickupTime,
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime actualPickupTime,
    
    List<OrderItemDto> items,
    
    // Métadonnées utiles
    int itemCount,
    String statusDescription,
    boolean canBeCancelled,
    boolean isActive
) {
    
    /**
     * Record pour les items d'une commande
     */
    public record OrderItemDto(
        UUID id,
        UUID menuItemId,
        String menuItemName,
        BigDecimal unitPrice,
        Integer quantity,
        BigDecimal subtotal,
        String specialNotes
    ) {}
}