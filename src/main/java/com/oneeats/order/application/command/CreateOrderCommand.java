package com.oneeats.order.application.command;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CreateOrderCommand(
    @NotNull UUID userId,
    @NotNull UUID restaurantId,
    @NotNull BigDecimal totalAmount,
    String specialInstructions,
    @NotNull List<OrderItemCommand> items
) {}

record OrderItemCommand(
    @NotNull UUID menuItemId,
    @NotNull String menuItemName,
    @NotNull BigDecimal unitPrice,
    @NotNull Integer quantity,
    String specialNotes
) {}