package com.oneeats.user.application.dto;

import com.oneeats.user.domain.model.UserStatus;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Lightweight user DTO for admin list view
 */
public record AdminUserListDTO(
    UUID id,
    String firstName,
    String lastName,
    String email,
    UserStatus status,
    String role,
    LocalDateTime createdAt
) {}
