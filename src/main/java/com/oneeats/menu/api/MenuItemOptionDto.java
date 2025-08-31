package com.oneeats.menu.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO pour les options d'articles de menu exposées via l'API REST
 */
public record MenuItemOptionDto(
    UUID id,
    
    @NotNull(message = "L'ID de l'article de menu est obligatoire")
    UUID menuItemId,
    
    @NotBlank(message = "Le nom de l'option est obligatoire")
    String name,
    
    @NotNull(message = "Le type d'option est obligatoire")
    String type, // 'choice', 'remove', 'extra'
    
    Boolean isRequired,
    
    Integer maxChoices,
    
    Integer displayOrder,
    
    List<MenuItemChoiceDto> choices,
    
    LocalDateTime createdAt,
    
    LocalDateTime updatedAt
) {
    
    // Constructeur de convenance pour création sans ID
    public MenuItemOptionDto(UUID menuItemId, String name, String type, 
                           Boolean isRequired, Integer maxChoices) {
        this(null, menuItemId, name, type, isRequired, maxChoices, 
             0, List.of(), null, null);
    }
}