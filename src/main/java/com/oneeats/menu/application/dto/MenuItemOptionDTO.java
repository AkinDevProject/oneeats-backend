package com.oneeats.menu.application.dto;

import com.oneeats.menu.domain.model.MenuItemOptionType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record MenuItemOptionDTO(
    UUID id,
    String name,
    String description,
    MenuItemOptionType type,
    Boolean isRequired,
    Integer maxChoices,
    Integer displayOrder,
    List<MenuItemChoiceDTO> choices,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}