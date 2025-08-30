package com.oneeats.restaurant.api;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO pour les données de restaurant exposées via l'API REST
 */
public record RestaurantDto(
    UUID id,
    
    @NotBlank(message = "Le nom du restaurant est obligatoire")
    String name,
    
    String description,
    
    @NotBlank(message = "L'adresse est obligatoire")
    String address,
    
    String phone,
    
    @Email(message = "L'email doit être valide")
    @NotBlank(message = "L'email est obligatoire")
    String email,
    
    @NotBlank(message = "Le type de cuisine est obligatoire")
    String cuisineType,
    
    String imageUrl,
    
    @NotNull(message = "Le statut d'ouverture est obligatoire")
    Boolean isOpen,
    
    @NotNull(message = "Le statut d'activation est obligatoire")
    Boolean isActive,
    
    @NotNull(message = "La note est obligatoire")
    Double rating,
    
    LocalDateTime createdAt,
    
    LocalDateTime updatedAt
) {
    
    // Constructeur de convenance pour création sans ID
    public RestaurantDto(String name, String description, String address, 
                        String phone, String email, String cuisineType) {
        this(null, name, description, address, phone, email, cuisineType, 
             null, false, true, 0.0, null, null);
    }
    
    // Constructeur pour mise à jour
    public RestaurantDto withId(UUID id) {
        return new RestaurantDto(id, name, description, address, phone, email, 
                               cuisineType, imageUrl, isOpen, isActive, rating, 
                               createdAt, updatedAt);
    }
    
    // Constructeur pour mise à jour des informations de base
    public RestaurantDto withUpdatedInfo(String name, String description, 
                                       String address, String phone, String email) {
        return new RestaurantDto(id, name, description, address, phone, email, 
                               cuisineType, imageUrl, isOpen, isActive, rating, 
                               createdAt, updatedAt);
    }
}