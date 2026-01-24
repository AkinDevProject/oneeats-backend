package com.oneeats.security.application.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO pour les requetes d'inscription utilisateur.
 */
public record RegisterRequestDTO(
    @NotBlank(message = "Le prenom est requis")
    @Size(min = 1, max = 100, message = "Le prenom doit contenir entre 1 et 100 caracteres")
    String firstName,

    @Size(max = 100, message = "Le nom doit contenir au maximum 100 caracteres")
    String lastName,

    @NotBlank(message = "L'email est requis")
    @Email(message = "Format d'email invalide")
    String email,

    @NotBlank(message = "Le mot de passe est requis")
    @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caracteres")
    String password
) {}
