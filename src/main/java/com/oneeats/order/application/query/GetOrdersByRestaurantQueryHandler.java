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
public class GetOrdersByRestaurantQueryHandler {
    
    @Inject
    IOrderRepository orderRepository;
    
    @Inject
    OrderApplicationMapper mapper;
    
    public List<OrderDTO> handle(GetOrdersByRestaurantQuery query) {
        List<Order> orders = orderRepository.findByRestaurantId(query.getRestaurantId());
        
        return orders.stream()
            .map(mapper::toDTO)
            .collect(Collectors.toList());
    }
}