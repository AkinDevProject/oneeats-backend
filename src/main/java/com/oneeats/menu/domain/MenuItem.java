package com.oneeats.menu.domain;

import com.oneeats.common.domain.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Entité MenuItem - Article de menu d'un restaurant
 * Aggregate root pour le domaine Menu
 */
@Entity
@Table(name = "menu_item")
public class MenuItem extends BaseEntity {
    
    @NotNull(message = "L'ID du restaurant est obligatoire")
    @Column(name = "restaurant_id", nullable = false)
    private UUID restaurantId;
    
    @NotBlank(message = "Le nom de l'article est obligatoire")
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @NotNull(message = "Le prix est obligatoire")
    @DecimalMin(value = "0.0", inclusive = false, message = "Le prix doit être positif")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    
    @NotBlank(message = "La catégorie est obligatoire")
    @Column(nullable = false)
    private String category;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable = true;
    
    @Column(name = "is_vegetarian", nullable = false)
    private Boolean isVegetarian = false;
    
    @Column(name = "is_vegan", nullable = false)
    private Boolean isVegan = false;
    
    @Column(name = "allergens")
    private String allergens; // Liste des allergènes séparés par des virgules
    
    @Column(name = "preparation_time_minutes")
    private Integer preparationTimeMinutes;
    
    // Constructeur protégé pour JPA
    protected MenuItem() {}
    
    // Constructeur métier
    public MenuItem(UUID restaurantId, String name, String description, BigDecimal price, String category) {
        this.restaurantId = restaurantId;
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
    }
    
    // Méthodes métier
    public void updateInfo(String name, String description, BigDecimal price, String category) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
    }
    
    public void makeAvailable() {
        this.isAvailable = true;
    }
    
    public void makeUnavailable() {
        this.isAvailable = false;
    }
    
    public void updateDietaryInfo(boolean isVegetarian, boolean isVegan, String allergens) {
        this.isVegetarian = isVegetarian;
        this.isVegan = isVegan;
        this.allergens = allergens;
        
        // Si vegan, alors automatiquement végétarien
        if (isVegan && !isVegetarian) {
            this.isVegetarian = true;
        }
    }
    
    public void setPreparationTime(int minutes) {
        if (minutes < 0) {
            throw new IllegalArgumentException("Le temps de préparation ne peut pas être négatif");
        }
        this.preparationTimeMinutes = minutes;
    }
    
    public boolean isOrderable() {
        return isAvailable;
    }
    
    // Getters
    public UUID getRestaurantId() { return restaurantId; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public BigDecimal getPrice() { return price; }
    public String getCategory() { return category; }
    public String getImageUrl() { return imageUrl; }
    public Boolean getIsAvailable() { return isAvailable; }
    public Boolean getIsVegetarian() { return isVegetarian; }
    public Boolean getIsVegan() { return isVegan; }
    public String getAllergens() { return allergens; }
    public Integer getPreparationTimeMinutes() { return preparationTimeMinutes; }
    
    // Setters pour propriétés modifiables
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}