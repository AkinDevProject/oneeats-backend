package com.oneeats.order.infrastructure.mapper;

import com.oneeats.order.domain.model.Order;
import com.oneeats.order.domain.model.OrderItem;
import com.oneeats.order.infrastructure.entity.OrderEntity;
import com.oneeats.order.infrastructure.entity.OrderItemEntity;
import com.oneeats.shared.domain.vo.Money;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Currency;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class OrderInfrastructureMapper {

    public Order toDomain(OrderEntity entity) {
        Currency currency = Currency.getInstance("EUR");
        
        Order order = new Order(
            entity.getId(),
            entity.getOrderNumber(),
            entity.getUserId(),
            entity.getRestaurantId(),
            new Money(entity.getTotalAmount(), currency),
            entity.getSpecialInstructions(),
            entity.getStatus()
        );
        
        // Convert items
        List<OrderItem> items = entity.getItems().stream()
            .map(this::toItemDomain)
            .collect(Collectors.toList());
            
        // Set items via reflection or add items one by one
        for (OrderItem item : items) {
            order.addItem(item);
        }
        
        return order;
    }

    public OrderEntity toEntity(Order order) {
        OrderEntity entity = new OrderEntity(
            order.getId(),
            order.getOrderNumber(),
            order.getUserId(),
            order.getRestaurantId(),
            order.getStatus(),
            order.getTotalAmount().getAmount(),
            order.getSpecialInstructions(),
            order.getEstimatedPickupTime(),
            order.getActualPickupTime(),
            order.getCreatedAt(),
            order.getUpdatedAt()
        );
        
        // Convert items
        List<OrderItemEntity> itemEntities = order.getItems().stream()
            .map(item -> toItemEntity(item, entity))
            .collect(Collectors.toList());
            
        entity.setItems(itemEntities);
        
        return entity;
    }
    
    private OrderItem toItemDomain(OrderItemEntity entity) {
        Currency currency = Currency.getInstance("EUR");
        
        return new OrderItem(
            entity.getId(),
            entity.getMenuItemId(),
            entity.getMenuItemName(),
            new Money(entity.getUnitPrice(), currency),
            entity.getQuantity(),
            entity.getSpecialNotes()
        );
    }
    
    private OrderItemEntity toItemEntity(OrderItem item, OrderEntity orderEntity) {
        OrderItemEntity entity = new OrderItemEntity(
            item.getId(),
            item.getMenuItemId(),
            item.getMenuItemName(),
            item.getUnitPrice().getAmount(),
            item.getQuantity(),
            item.getSpecialNotes(),
            item.getCreatedAt(),
            item.getUpdatedAt()
        );
        
        entity.setOrder(orderEntity);
        return entity;
    }
}