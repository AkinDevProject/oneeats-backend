package com.oneeats.menu.application.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * DTO pour les options de menu item dans les commandes
 */
public record MenuItemOptionCommandDTO(

    String id,

    @NotBlank(message = "Option name is required")
    @Size(min = 1, max = 100, message = "Option name must be between 1 and 100 characters")
    String name,

    @NotNull(message = "Option type is required")
    String type,

    Boolean isRequired,

    Integer maxChoices,

    Integer displayOrder,

    @Valid
    List<MenuItemChoiceCommandDTO> choices

) {

    public MenuItemOptionCommandDTO {
        // Valeurs par défaut
        isRequired = isRequired != null ? isRequired : false;
        maxChoices = maxChoices != null ? maxChoices : 1;
        displayOrder = displayOrder != null ? displayOrder : 0;
        choices = choices != null ? choices : List.of();

        // Validation du type
        if (type != null && !List.of("CHOICE", "EXTRA", "MODIFICATION", "COOKING", "SAUCE").contains(type.toUpperCase())) {
            throw new IllegalArgumentException("Invalid option type. Must be CHOICE, EXTRA, MODIFICATION, COOKING, or SAUCE");
        }

        // Une option doit avoir au moins un choix si elle est requise
        if (isRequired && choices.isEmpty()) {
            throw new IllegalArgumentException("Required option must have at least one choice");
        }
    }
}