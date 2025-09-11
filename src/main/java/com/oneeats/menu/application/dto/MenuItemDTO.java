package com.oneeats.menu.application.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record MenuItemDTO(
    UUID id,
    UUID restaurantId,
    String name,
    String description,
    BigDecimal price,
    String category,
    String imageUrl,
    Boolean isAvailable,
    Integer preparationTimeMinutes,
    Boolean isVegetarian,
    Boolean isVegan,
    List<String> allergens,
    List<MenuItemOptionDTO> options,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}