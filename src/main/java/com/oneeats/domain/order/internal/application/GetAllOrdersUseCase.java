package com.oneeats.domain.order.internal.application;

import com.oneeats.domain.order.api.model.OrderDto;
import com.oneeats.domain.order.api.interface_.OrderRepository;
import com.oneeats.domain.order.internal.entity.Order;
import com.oneeats.domain.order.internal.mapper.OrderMapper;
import java.util.List;
import java.util.stream.Collectors;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class GetAllOrdersUseCase {
    private final OrderRepository orderRepository;

    public GetAllOrdersUseCase(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public List<OrderDto> handle() {
        List<Order> orders = orderRepository.findAll();
        return orders.stream().map(OrderMapper::toDto).collect(Collectors.toList());
    }
}
