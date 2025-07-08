package com.oneeats.order.internal.application;

import com.oneeats.order.api.model.OrderDto;
import com.oneeats.order.api.interface_.OrderRepository;
import com.oneeats.order.internal.entity.Order;
import com.oneeats.order.internal.mapper.OrderMapper;
import java.util.Optional;
import java.util.UUID;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class GetOrderUseCase {
    private final OrderRepository orderRepository;

    public GetOrderUseCase(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public Optional<OrderDto> handle(UUID orderId) {
        Optional<Order> optOrder = orderRepository.findById(orderId);
        return optOrder.map(OrderMapper::toDto);
    }
}
