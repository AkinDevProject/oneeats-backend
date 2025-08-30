package com.oneeats.restaurant.domain;

import com.oneeats.common.domain.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;

/**
 * Entité Restaurant - Partenaire restaurant de l'application
 * Aggregate root pour le domaine Restaurant
 */
@Entity
@Table(name = "restaurant")
public class Restaurant extends BaseEntity {
    
    @NotBlank(message = "Le nom du restaurant est obligatoire")
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @NotBlank(message = "L'adresse est obligatoire")
    @Column(nullable = false)
    private String address;
    
    @Column
    private String phone;
    
    @Column
    private String email;
    
    @NotBlank(message = "Le type de cuisine est obligatoire")
    @Column(name = "cuisine_type", nullable = false)
    private String cuisineType;
    
    @DecimalMin(value = "0.0", message = "La note doit être positive")
    @DecimalMax(value = "5.0", message = "La note ne peut pas dépasser 5.0")
    @Column(nullable = false)
    private Double rating = 0.0;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Column(name = "is_open", nullable = false)
    private Boolean isOpen = false;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    // Constructeur protégé pour JPA
    protected Restaurant() {}
    
    // Constructeur métier
    public Restaurant(String name, String description, String address, String cuisineType) {
        this.name = name;
        this.description = description;
        this.address = address;
        this.cuisineType = cuisineType;
    }
    
    // Méthodes métier
    public void updateInfo(String name, String description, String address, String phone, String email) {
        this.name = name;
        this.description = description;
        this.address = address;
        this.phone = phone;
        this.email = email;
    }
    
    public void openRestaurant() {
        if (!isActive) {
            throw new IllegalStateException("Impossible d'ouvrir un restaurant inactif");
        }
        this.isOpen = true;
    }
    
    public void closeRestaurant() {
        this.isOpen = false;
    }
    
    public void activate() {
        this.isActive = true;
    }
    
    public void deactivate() {
        this.isActive = false;
        this.isOpen = false; // Fermer automatiquement si désactivé
    }
    
    public void updateRating(double newRating) {
        if (newRating < 0.0 || newRating > 5.0) {
            throw new IllegalArgumentException("La note doit être entre 0 et 5");
        }
        this.rating = newRating;
    }
    
    public boolean canAcceptOrders() {
        return isActive && isOpen;
    }
    
    // Getters
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getAddress() { return address; }
    public String getPhone() { return phone; }
    public String getEmail() { return email; }
    public String getCuisineType() { return cuisineType; }
    public Double getRating() { return rating; }
    public String getImageUrl() { return imageUrl; }
    public Boolean getIsOpen() { return isOpen; }
    public Boolean getIsActive() { return isActive; }
    
    // Setters pour propriétés modifiables
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setCuisineType(String cuisineType) { this.cuisineType = cuisineType; }
}