package com.oneeats.domain.order.internal.application;

import com.oneeats.domain.order.api.cqrs.command.UpdateOrderCommand;
import com.oneeats.domain.order.api.interface_.OrderRepository;
import com.oneeats.domain.order.internal.entity.Order;
import com.oneeats.domain.order.internal.entity.OrderItem;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class UpdateOrderUseCase {
    private final OrderRepository orderRepository;

    public UpdateOrderUseCase(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public boolean handle(UpdateOrderCommand command) {
        Optional<Order> optOrder = orderRepository.findById(command.getId());
        if (optOrder.isEmpty()) {
            return false;
        }
        Order order = optOrder.get();
        if (command.getStatut() != null) {
            order.setStatut(Order.Statut.valueOf(command.getStatut()));
        }
        if (command.getMode() != null) {
            order.setMode(Order.Mode.valueOf(command.getMode()));
        }
        if (command.getItems() != null) {
            List<UpdateOrderCommand.OrderItemUpdateCommand> itemCmds = command.getItems();
            for (UpdateOrderCommand.OrderItemUpdateCommand itemCmd : itemCmds) {
                for (OrderItem item : order.getItems()) {
                    if (item.getId().equals(itemCmd.getId())) {
                        item.setQuantite(itemCmd.getQuantite());
                    }
                }
            }
        }
        orderRepository.save(order);
        return true;
    }
}
