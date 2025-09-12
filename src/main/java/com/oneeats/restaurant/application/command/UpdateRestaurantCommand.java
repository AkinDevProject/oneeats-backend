package com.oneeats.restaurant.application.command;

import com.oneeats.restaurant.application.dto.ScheduleDTO;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import java.util.UUID;

public record UpdateRestaurantCommand(
    UUID id,
    String name,
    String description,
    String address,
    String phone,
    @Email String email,
    String cuisineType,
    Boolean isOpen,
    ScheduleDTO schedule
) {}