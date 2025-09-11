package com.oneeats.menu.domain.vo;

import com.oneeats.shared.domain.exception.ValidationException;
import java.util.Objects;

/**
 * Value Object pour la catégorie d'un item de menu
 */
public class Category {
    private final String value;
    
    public Category(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new ValidationException("Category cannot be null or empty");
        }
        
        String trimmed = value.trim().toUpperCase();
        if (!isValidCategory(trimmed)) {
            throw new ValidationException("Invalid category: " + value);
        }
        
        this.value = trimmed;
    }
    
    // Catégories prédéfinies - peut être étendu
    private boolean isValidCategory(String category) {
        return category.matches("^[A-Z_]+$") && category.length() <= 50;
    }
    
    public static Category of(String value) {
        return new Category(value);
    }
    
    // Catégories communes
    public static Category pizza() {
        return new Category("PIZZA");
    }
    
    public static Category burger() {
        return new Category("BURGER");
    }
    
    public static Category pasta() {
        return new Category("PASTA");
    }
    
    public static Category dessert() {
        return new Category("DESSERT");
    }
    
    public static Category beverage() {
        return new Category("BEVERAGE");
    }
    
    public String getValue() {
        return value;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Category category = (Category) o;
        return Objects.equals(value, category.value);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(value);
    }
    
    @Override
    public String toString() {
        return value;
    }
}