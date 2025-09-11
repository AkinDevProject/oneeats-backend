package com.oneeats.restaurant.application.command;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;

public record CreateRestaurantCommand(
    @NotBlank String name,
    String description,
    @NotBlank String address,
    String phone,
    @Email String email,
    @NotBlank String cuisineType
) {}