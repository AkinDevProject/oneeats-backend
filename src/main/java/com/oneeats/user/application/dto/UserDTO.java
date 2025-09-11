package com.oneeats.user.application.dto;

import com.oneeats.user.domain.model.UserStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserDTO(
    UUID id,
    String firstName,
    String lastName,
    String email,
    UserStatus status,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}