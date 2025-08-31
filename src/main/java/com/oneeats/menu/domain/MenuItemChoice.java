package com.oneeats.menu.domain;

import com.oneeats.common.domain.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;

import java.math.BigDecimal;
import java.util.Objects;

/**
 * Entité MenuItemChoice - Choix disponible pour une option d'article de menu
 */
@Entity
@Table(name = "menu_item_choice")
public class MenuItemChoice extends BaseEntity {
    
    @NotNull(message = "L'option de menu est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_option_id", nullable = false)
    private MenuItemOption menuItemOption;
    
    @NotBlank(message = "Le nom du choix est obligatoire")
    @Column(nullable = false)
    private String name;
    
    @DecimalMin(value = "0.0", message = "Le prix ne peut pas être négatif")
    @Column(precision = 10, scale = 2)
    private BigDecimal price = BigDecimal.ZERO;
    
    @Column(name = "display_order")
    private Integer displayOrder = 0;
    
    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable = true;
    
    // Constructeur protégé pour JPA
    protected MenuItemChoice() {}
    
    // Constructeur métier
    public MenuItemChoice(MenuItemOption menuItemOption, String name, BigDecimal price) {
        this.menuItemOption = Objects.requireNonNull(menuItemOption, "L'option de menu ne peut pas être null");
        this.name = Objects.requireNonNull(name, "Le nom ne peut pas être null");
        this.price = price != null ? price : BigDecimal.ZERO;
        
        // Validation métier
        if (this.price.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Le prix ne peut pas être négatif");
        }
    }
    
    // Constructeur de convenance pour choix sans prix
    public MenuItemChoice(MenuItemOption menuItemOption, String name) {
        this(menuItemOption, name, BigDecimal.ZERO);
    }
    
    // Méthodes métier
    public void updateInfo(String name, BigDecimal price) {
        this.name = Objects.requireNonNull(name, "Le nom ne peut pas être null");
        this.price = price != null ? price : BigDecimal.ZERO;
        
        if (this.price.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Le prix ne peut pas être négatif");
        }
    }
    
    public void makeAvailable() {
        this.isAvailable = true;
    }
    
    public void makeUnavailable() {
        this.isAvailable = false;
    }
    
    public boolean isFree() {
        return price.compareTo(BigDecimal.ZERO) == 0;
    }
    
    public boolean isExtra() {
        return price.compareTo(BigDecimal.ZERO) > 0;
    }
    
    // Getters
    public MenuItemOption getMenuItemOption() { return menuItemOption; }
    public String getName() { return name; }
    public BigDecimal getPrice() { return price; }
    public Integer getDisplayOrder() { return displayOrder; }
    public Boolean getIsAvailable() { return isAvailable; }
    
    // Setters pour JPA et migration
    public void setMenuItemOption(MenuItemOption menuItemOption) { this.menuItemOption = menuItemOption; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
}