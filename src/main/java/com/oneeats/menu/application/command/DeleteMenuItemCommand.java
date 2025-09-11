package com.oneeats.menu.application.command;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

/**
 * Commande pour supprimer un item de menu
 */
public record DeleteMenuItemCommand(
    
    @NotNull(message = "Menu item ID is required")
    UUID id
    
) {}