package com.oneeats.order.api.interface_;

import com.oneeats.order.internal.entity.Order;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository {
    Optional<Order> findById(UUID id);
    List<Order> findAll();
    void save(Order order);
    void deleteById(UUID id);
}

