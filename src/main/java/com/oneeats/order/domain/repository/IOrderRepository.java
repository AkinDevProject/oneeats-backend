package com.oneeats.order.domain.repository;

import com.oneeats.order.domain.model.Order;
import com.oneeats.order.domain.model.OrderStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IOrderRepository {
    
    Optional<Order> findById(UUID id);
    
    Optional<Order> findByOrderNumber(String orderNumber);
    
    List<Order> findAll();
    
    List<Order> findByUserId(UUID userId);
    
    List<Order> findByRestaurantId(UUID restaurantId);
    
    List<Order> findByStatus(OrderStatus status);

    List<Order> findActiveByRestaurantId(UUID restaurantId);

    Order save(Order order);
    
    void delete(Order order);
    
    boolean existsByOrderNumber(String orderNumber);
}