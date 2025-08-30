package com.oneeats.user.api;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Requête de création d'utilisateur
 */
public record CreateUserRequest(
    
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    String email,
    
    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 6, message = "Le mot de passe doit faire au moins 6 caractères")
    String password,
    
    @NotBlank(message = "Le prénom est obligatoire")
    String firstName,
    
    @NotBlank(message = "Le nom est obligatoire")
    String lastName,
    
    String phone,
    
    String address
    
) {}