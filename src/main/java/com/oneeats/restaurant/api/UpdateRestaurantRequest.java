package com.oneeats.restaurant.api;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO pour les requêtes de mise à jour de restaurant
 */
public record UpdateRestaurantRequest(
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
    String cuisineType
) {}