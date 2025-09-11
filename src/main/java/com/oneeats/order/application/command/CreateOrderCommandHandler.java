package com.oneeats.order.application.command;

import com.oneeats.order.application.dto.OrderDTO;
import com.oneeats.order.application.mapper.OrderApplicationMapper;
import com.oneeats.order.domain.model.Order;
import com.oneeats.order.domain.model.OrderItem;
import com.oneeats.order.domain.repository.IOrderRepository;
import com.oneeats.order.domain.service.OrderDomainService;
import com.oneeats.shared.domain.vo.Money;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.Currency;

@ApplicationScoped
public class CreateOrderCommandHandler {

    @Inject
    IOrderRepository orderRepository;

    @Inject
    OrderDomainService orderDomainService;

    @Inject
    OrderApplicationMapper mapper;

    @Transactional
    public OrderDTO handle(CreateOrderCommand command) {
        String orderNumber = orderDomainService.generateOrderNumber();
        
        orderDomainService.validateOrderCreation(orderNumber);

        Money totalAmount = new Money(command.totalAmount(), Currency.getInstance("EUR"));
        
        Order order = Order.create(
            orderNumber,
            command.userId(),
            command.restaurantId(),
            totalAmount,
            command.specialInstructions()
        );

        // Add items to order
        for (var itemCommand : command.items()) {
            Money itemPrice = new Money(itemCommand.unitPrice(), Currency.getInstance("EUR"));
            OrderItem item = OrderItem.create(
                itemCommand.menuItemId(),
                itemCommand.menuItemName(),
                itemPrice,
                itemCommand.quantity(),
                itemCommand.specialNotes()
            );
            order.addItem(item);
        }

        Order savedOrder = orderRepository.save(order);
        return mapper.toDTO(savedOrder);
    }
}