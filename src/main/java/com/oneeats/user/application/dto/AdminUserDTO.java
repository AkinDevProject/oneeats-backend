package com.oneeats.user.application.dto;

import com.oneeats.user.domain.model.UserStatus;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Full user DTO for admin detail view
 * Includes order statistics and suspension info
 */
public record AdminUserDTO(
    UUID id,
    String firstName,
    String lastName,
    String email,
    String phone,
    String address,
    UserStatus status,
    String role,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    // Order statistics
    long orderCount,
    LocalDateTime lastOrderDate,
    // Suspension info
    String suspensionReason,
    LocalDateTime suspendedAt,
    LocalDateTime suspendedUntil
) {}
