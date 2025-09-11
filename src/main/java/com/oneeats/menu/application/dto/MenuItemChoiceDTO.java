package com.oneeats.menu.application.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record MenuItemChoiceDTO(
    UUID id,
    String name,
    String description,
    BigDecimal additionalPrice,
    Integer displayOrder,
    Boolean isAvailable,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}