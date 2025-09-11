package com.oneeats.menu.domain.model;

import com.oneeats.shared.domain.entity.BaseEntity;
import com.oneeats.shared.domain.exception.ValidationException;
import com.oneeats.menu.domain.vo.Price;

/**
 * Entité MenuItemChoice - Choix spécifique pour une option de menu
 */
public class MenuItemChoice extends BaseEntity {
    
    private final String name;
    private final String description;
    private final Price additionalPrice;
    private final int displayOrder;
    private boolean isAvailable;
    
    public MenuItemChoice(String name, String description, Price additionalPrice, int displayOrder) {
        this.name = validateName(name);
        this.description = description;
        this.additionalPrice = additionalPrice != null ? additionalPrice : Price.of(0);
        this.displayOrder = displayOrder;
        this.isAvailable = true; // Disponible par défaut
    }
    
    // Factory method pour création simple
    public static MenuItemChoice create(String name, Price additionalPrice) {
        return new MenuItemChoice(name, null, additionalPrice, 0);
    }
    
    // Factory method pour création avec description
    public static MenuItemChoice create(String name, String description, Price additionalPrice, int displayOrder) {
        return new MenuItemChoice(name, description, additionalPrice, displayOrder);
    }
    
    // Méthodes métier
    
    /**
     * Rendre ce choix disponible
     */
    public void makeAvailable() {
        this.isAvailable = true;
    }
    
    /**
     * Rendre ce choix indisponible
     */
    public void makeUnavailable() {
        this.isAvailable = false;
    }
    
    /**
     * Vérifier si ce choix est gratuit
     */
    public boolean isFree() {
        return additionalPrice.isZero();
    }
    
    /**
     * Vérifier si ce choix a un coût additionnel
     */
    public boolean hasCost() {
        return !additionalPrice.isZero();
    }
    
    /**
     * Obtenir le texte d'affichage avec le prix
     */
    public String getDisplayText() {
        if (isFree()) {
            return name;
        } else {
            return name + " (+" + additionalPrice + ")";
        }
    }
    
    // Validation
    private String validateName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new ValidationException("Choice name cannot be null or empty");
        }
        if (name.length() > 100) {
            throw new ValidationException("Choice name cannot exceed 100 characters");
        }
        return name.trim();
    }
    
    // Getters
    public String getName() { return name; }
    public String getDescription() { return description; }
    public Price getAdditionalPrice() { return additionalPrice; }
    public int getDisplayOrder() { return displayOrder; }
    public boolean getIsAvailable() { return isAvailable; }
    
    @Override
    public String toString() {
        return "MenuItemChoice{" +
                "name='" + name + '\'' +
                ", additionalPrice=" + additionalPrice +
                ", available=" + isAvailable +
                '}';
    }
}