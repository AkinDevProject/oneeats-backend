package com.oneeats.order.application.dto;

import com.oneeats.order.domain.model.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record OrderDTO(
    UUID id,
    String orderNumber,
    UUID userId,
    UUID restaurantId,
    OrderStatus status,
    BigDecimal totalAmount,
    String specialInstructions,
    LocalDateTime estimatedPickupTime,
    LocalDateTime actualPickupTime,
    List<OrderItemDTO> items,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}