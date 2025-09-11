package com.oneeats.menu.domain.model;

/**
 * Types d'options pour les items de menu
 */
public enum MenuItemOptionType {
    
    /**
     * Choix unique obligatoire (ex: taille de pizza)
     */
    CHOICE("Choix unique"),
    
    /**
     * Choix multiple optionnel (ex: garnitures)
     */
    EXTRA("Supplément"),
    
    /**
     * Choix de cuisson (ex: cuisson de la viande)
     */
    COOKING("Cuisson"),
    
    /**
     * Choix de sauce
     */
    SAUCE("Sauce"),
    
    /**
     * Modification/personnalisation
     */
    MODIFICATION("Modification");
    
    private final String displayName;
    
    MenuItemOptionType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    /**
     * Vérifier si ce type d'option permet habituellement plusieurs choix
     */
    public boolean allowsMultipleChoices() {
        return this == EXTRA || this == MODIFICATION;
    }
    
    /**
     * Vérifier si ce type d'option est habituellement obligatoire
     */
    public boolean isTypicallyRequired() {
        return this == CHOICE || this == COOKING;
    }
}