package com.oneeats.restaurant.application.dto;

import com.oneeats.restaurant.domain.model.RestaurantStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record RestaurantDTO(
    UUID id,
    String name,
    String description,
    String address,
    String phone,
    String email,
    String cuisineType,
    Double rating,
    String imageUrl,
    RestaurantStatus status,
    boolean isOpen,
    ScheduleDTO schedule,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}