package com.oneeats.order.application.command;

import com.oneeats.order.application.dto.OrderDTO;
import com.oneeats.order.application.mapper.OrderApplicationMapper;
import com.oneeats.order.domain.model.Order;
import com.oneeats.order.domain.repository.IOrderRepository;
import com.oneeats.shared.domain.exception.EntityNotFoundException;
import com.oneeats.shared.domain.event.DomainEventPublisher;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.logging.Logger;

@ApplicationScoped
public class UpdateOrderStatusCommandHandler {

    private static final Logger LOGGER = Logger.getLogger(UpdateOrderStatusCommandHandler.class.getName());

    @Inject
    IOrderRepository orderRepository;

    @Inject
    OrderApplicationMapper mapper;

    @Inject
    DomainEventPublisher domainEventPublisher;
    
    @Transactional
    public OrderDTO handle(UpdateOrderStatusCommand command) {
        LOGGER.info("🔄 UpdateOrderStatusCommandHandler appelé pour order: " + command.getOrderId() + " vers statut: " + command.getNewStatus());

        Order order = orderRepository.findById(command.getOrderId())
            .orElseThrow(() -> new EntityNotFoundException("Order", command.getOrderId()));

        // Mettre à jour le statut
        order.updateStatus(command.getNewStatus());

        // Publier les événements domaine AVANT de sauvegarder
        LOGGER.info("🔔 Nombre d'événements à publier: " + order.getDomainEvents().size());
        order.getDomainEvents().forEach(event -> {
            LOGGER.info("🚀 Publication de l'événement: " + event.getClass().getSimpleName());
            domainEventPublisher.publish(event);
        });
        order.clearDomainEvents();

        // Sauvegarder
        Order updatedOrder = orderRepository.save(order);

        return mapper.toDTO(updatedOrder);
    }
}