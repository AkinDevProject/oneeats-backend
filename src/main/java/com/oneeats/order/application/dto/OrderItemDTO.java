package com.oneeats.order.application.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemDTO(
    UUID id,
    UUID menuItemId,
    String menuItemName,
    BigDecimal unitPrice,
    Integer quantity,
    String specialNotes,
    BigDecimal subtotal
) {}