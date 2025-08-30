package com.oneeats.order.infrastructure;

import com.oneeats.order.api.CreateOrderRequest;
import com.oneeats.order.api.OrderDto;
import com.oneeats.order.domain.Order;
import com.oneeats.order.domain.OrderItem;
import jakarta.enterprise.context.ApplicationScoped;

import java.math.BigDecimal;
import java.util.List;

/**
 * Mapper pour convertir entre entités Order et DTOs
 */
@ApplicationScoped
public class OrderMapper {
    
    /**
     * Convertir une entité Order vers un DTO
     */
    public OrderDto toDto(Order order) {
        if (order == null) {
            return null;
        }
        
        List<OrderDto.OrderItemDto> itemDtos = order.getItems().stream()
            .map(this::toItemDto)
            .toList();
        
        return new OrderDto(
            order.getId(),
            order.getUserId(),
            order.getRestaurantId(),
            order.getStatus(),
            order.getTotalAmount(),
            order.getSpecialInstructions(),
            order.getCreatedAt(),
            order.getUpdatedAt(),
            order.getEstimatedPickupTime(),
            order.getActualPickupTime(),
            itemDtos,
            order.getItems().size(),
            order.getStatus().getDescription(),
            order.canBeCancelled(),
            order.isActive()
        );
    }
    
    /**
     * Convertir un OrderItem vers un DTO
     */
    public OrderDto.OrderItemDto toItemDto(OrderItem item) {
        if (item == null) {
            return null;
        }
        
        return new OrderDto.OrderItemDto(
            item.getId(),
            item.getMenuItemId(),
            item.getMenuItemName(),
            item.getUnitPrice(),
            item.getQuantity(),
            item.getSubtotal(),
            item.getSpecialNotes()
        );
    }
    
    /**
     * Convertir une liste d'entités vers une liste de DTOs
     */
    public List<OrderDto> toDtoList(List<Order> orders) {
        return orders.stream()
            .map(this::toDto)
            .toList();
    }
    
    /**
     * Créer une entité Order à partir d'une requête de création
     */
    public Order fromCreateRequest(CreateOrderRequest request, java.util.UUID userId) {
        // Calculer le montant total
        BigDecimal totalAmount = request.items().stream()
            .map(item -> item.unitPrice().multiply(BigDecimal.valueOf(item.quantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Créer la commande
        Order order = new Order(userId, request.restaurantId(), totalAmount, request.specialInstructions());
        
        // Ajouter les items
        request.items().forEach(itemRequest -> {
            OrderItem item = new OrderItem(
                itemRequest.menuItemId(),
                itemRequest.menuItemName(),
                itemRequest.unitPrice(),
                itemRequest.quantity()
            );
            if (itemRequest.specialNotes() != null) {
                item.addSpecialNotes(itemRequest.specialNotes());
            }
            order.addItem(item);
        });
        
        return order;
    }
    
    /**
     * Créer un OrderItem à partir d'une requête de création d'item
     */
    public OrderItem fromCreateItemRequest(CreateOrderRequest.CreateOrderItemRequest request) {
        OrderItem item = new OrderItem(
            request.menuItemId(),
            request.menuItemName(),
            request.unitPrice(),
            request.quantity()
        );
        
        if (request.specialNotes() != null && !request.specialNotes().trim().isEmpty()) {
            item.addSpecialNotes(request.specialNotes());
        }
        
        return item;
    }
    
    /**
     * Créer un résumé simple pour les listes
     */
    public OrderDto toSummaryDto(Order order) {
        // Version simplifiée sans les items pour les listes
        return new OrderDto(
            order.getId(),
            order.getUserId(),
            order.getRestaurantId(),
            order.getStatus(),
            order.getTotalAmount(),
            order.getSpecialInstructions(),
            order.getCreatedAt(),
            order.getUpdatedAt(),
            order.getEstimatedPickupTime(),
            order.getActualPickupTime(),
            List.of(), // Pas d'items dans le résumé
            order.getItems().size(),
            order.getStatus().getDescription(),
            order.canBeCancelled(),
            order.isActive()
        );
    }
    
    /**
     * Convertir une liste vers des résumés
     */
    public List<OrderDto> toSummaryDtoList(List<Order> orders) {
        return orders.stream()
            .map(this::toSummaryDto)
            .toList();
    }
}