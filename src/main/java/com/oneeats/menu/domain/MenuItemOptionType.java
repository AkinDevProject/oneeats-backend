package com.oneeats.menu.domain;

/**
 * Types d'options pour les articles de menu
 */
public enum MenuItemOptionType {
    /**
     * Choix unique ou multiple (ex: choix de sauce, de garniture)
     */
    CHOICE("choice"),
    
    /**
     * Ingrédients à retirer (ex: sans oignons, sans fromage)
     */
    REMOVE("remove"),
    
    /**
     * Suppléments payants (ex: fromage en plus, bacon)
     */
    EXTRA("extra");
    
    private final String value;
    
    MenuItemOptionType(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
    
    public static MenuItemOptionType fromValue(String value) {
        for (MenuItemOptionType type : values()) {
            if (type.value.equals(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Type d'option inconnu: " + value);
    }
    
    /**
     * Indique si ce type d'option peut avoir des prix
     */
    public boolean canHavePrice() {
        return this == EXTRA;
    }
    
    /**
     * Indique si ce type d'option peut être multiple
     */
    public boolean canBeMultiple() {
        return this == CHOICE || this == REMOVE;
    }
}