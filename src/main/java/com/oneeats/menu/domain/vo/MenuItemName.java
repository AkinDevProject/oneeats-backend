package com.oneeats.menu.domain.vo;

import com.oneeats.shared.domain.exception.ValidationException;
import java.util.Objects;

/**
 * Value Object pour le nom d'un item de menu
 */
public class MenuItemName {
    private static final int MIN_LENGTH = 2;
    private static final int MAX_LENGTH = 100;
    
    private final String value;
    
    public MenuItemName(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new ValidationException("Menu item name cannot be null or empty");
        }
        
        String trimmed = value.trim();
        if (trimmed.length() < MIN_LENGTH) {
            throw new ValidationException("Menu item name must be at least " + MIN_LENGTH + " characters");
        }
        if (trimmed.length() > MAX_LENGTH) {
            throw new ValidationException("Menu item name cannot exceed " + MAX_LENGTH + " characters");
        }
        
        this.value = trimmed;
    }
    
    public String getValue() {
        return value;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MenuItemName that = (MenuItemName) o;
        return Objects.equals(value, that.value);
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