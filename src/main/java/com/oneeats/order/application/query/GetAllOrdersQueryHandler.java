package com.oneeats.order.application.query;

import com.oneeats.order.application.dto.OrderDTO;
import com.oneeats.order.application.mapper.OrderApplicationMapper;
import com.oneeats.order.domain.model.Order;
import com.oneeats.order.domain.repository.IOrderRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class GetAllOrdersQueryHandler {

    @Inject
    IOrderRepository orderRepository;

    @Inject
    OrderApplicationMapper mapper;

    public List<OrderDTO> handle(GetAllOrdersQuery query) {
        List<Order> orders = orderRepository.findAll();

        return orders.stream()
            .map(mapper::toDTO)
            .collect(Collectors.toList());
    }
}