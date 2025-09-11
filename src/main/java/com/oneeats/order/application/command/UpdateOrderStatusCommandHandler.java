package com.oneeats.order.application.command;

import com.oneeats.order.application.dto.OrderDTO;
import com.oneeats.order.application.mapper.OrderApplicationMapper;
import com.oneeats.order.domain.model.Order;
import com.oneeats.order.domain.repository.IOrderRepository;
import com.oneeats.shared.domain.exception.EntityNotFoundException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class UpdateOrderStatusCommandHandler {
    
    @Inject
    IOrderRepository orderRepository;
    
    @Inject
    OrderApplicationMapper mapper;
    
    @Transactional
    public OrderDTO handle(UpdateOrderStatusCommand command) {
        Order order = orderRepository.findById(command.getOrderId())
            .orElseThrow(() -> new EntityNotFoundException("Order", command.getOrderId()));
        
        // Mettre à jour le statut
        order.updateStatus(command.getNewStatus());
        
        // Sauvegarder
        Order updatedOrder = orderRepository.save(order);
        
        return mapper.toDTO(updatedOrder);
    }
}