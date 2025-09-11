package com.oneeats.order.application.query;

import com.oneeats.order.application.dto.OrderDTO;
import com.oneeats.order.application.mapper.OrderApplicationMapper;
import com.oneeats.order.domain.model.Order;
import com.oneeats.order.domain.repository.IOrderRepository;
import com.oneeats.shared.domain.exception.EntityNotFoundException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class GetOrderQueryHandler {
    
    @Inject
    IOrderRepository orderRepository;
    
    @Inject
    OrderApplicationMapper mapper;
    
    public OrderDTO handle(GetOrderQuery query) {
        Order order = orderRepository.findById(query.id())
            .orElseThrow(() -> new EntityNotFoundException("Order", query.id()));
            
        return mapper.toDTO(order);
    }
}