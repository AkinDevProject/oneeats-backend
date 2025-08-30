package com.oneeats.user.api;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO de réponse pour les utilisateurs
 * Exclut les données sensibles comme le mot de passe
 */
public record UserDto(
    UUID id,
    String email,
    String firstName,
    String lastName,
    String fullName,
    String phone,
    String address,
    boolean isActive,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}