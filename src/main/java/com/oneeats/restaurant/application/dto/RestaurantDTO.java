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
    String category,       // Mapping depuis cuisineType pour frontend
    Double rating,
    String imageUrl,
    RestaurantStatus status,
    boolean isOpen,
    boolean isActive,      // Ajouté pour correspondre au model Restaurant
    ScheduleDTO schedule,
    LocalDateTime registrationDate,  // Mapping depuis createdAt pour frontend
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    String rejectionReason,    // Raison du rejet (si statut REJECTED)
    LocalDateTime rejectedAt   // Date du rejet (si statut REJECTED)
) {}