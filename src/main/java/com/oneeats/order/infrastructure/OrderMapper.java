package com.oneeats.order.infrastructure;

import com.oneeats.order.api.CreateOrderRequest;
import com.oneeats.order.api.OrderDto;
import com.oneeats.order.domain.Order;
import com.oneeats.order.domain.OrderItem;
import com.oneeats.user.domain.User;
import com.oneeats.user.infrastructure.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.math.BigDecimal;
import java.util.List;

/**
 * Mapper pour convertir entre entités Order et DTOs
 */
@ApplicationScoped
public class OrderMapper {
    
    @Inject
    UserRepository userRepository;
    
    /**
     * Convertir une entité Order vers un DTO
     */
    public OrderDto toDto(Order order) {
        if (order == null) {
            return null;
        }
        
        // Récupérer les informations utilisateur
        User user = userRepository.findById(order.getUserId());
        String clientName = user != null ? user.getFirstName() + " " + user.getLastName() : "Client inconnu";
        String clientEmail = user != null ? user.getEmail() : "";
        
        List<OrderDto.OrderItemDto> itemDtos = order.getItems().stream()
            .map(this::toItemDto)
            .toList();
        
        return new OrderDto(
            order.getId(),
            order.getOrderNumber(),
            order.getUserId(),
            clientName,
            clientEmail,
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
        
        // Générer un numéro de commande (pour l'instant simple, à améliorer avec un service)
        String orderNumber = generateOrderNumber();
        
        // Créer la commande
        Order order = new Order(orderNumber, userId, request.restaurantId(), totalAmount, request.specialInstructions());
        
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
        // Récupérer les informations utilisateur
        User user = userRepository.findById(order.getUserId());
        String clientName = user != null ? user.getFirstName() + " " + user.getLastName() : "Client inconnu";
        String clientEmail = user != null ? user.getEmail() : "";
        
        // Version avec items pour l'affichage complet
        List<OrderDto.OrderItemDto> itemDtos = order.getItems().stream()
            .map(this::toItemDto)
            .toList();
            
        return new OrderDto(
            order.getId(),
            order.getOrderNumber(),
            order.getUserId(),
            clientName,
            clientEmail,
            order.getRestaurantId(),
            order.getStatus(),
            order.getTotalAmount(),
            order.getSpecialInstructions(),
            order.getCreatedAt(),
            order.getUpdatedAt(),
            order.getEstimatedPickupTime(),
            order.getActualPickupTime(),
            itemDtos, // Items inclus dans le résumé
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
    
    /**
     * Générer un numéro de commande simple (TODO: améliorer avec un service dédié)
     */
    private String generateOrderNumber() {
        // Pour l'instant, génération simple basée sur le timestamp
        // Dans une vraie application, utiliser un service avec séquence en base
        long timestamp = System.currentTimeMillis();
        return "CMD-" + String.format("%03d", timestamp % 1000);
    }
}