package com.oneeats.admin.application.dto;

import com.oneeats.admin.domain.model.AdminRole;
import com.oneeats.admin.domain.model.AdminStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record AdminDTO(
    UUID id,
    String firstName,
    String lastName,
    String email,
    AdminRole role,
    AdminStatus status,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}