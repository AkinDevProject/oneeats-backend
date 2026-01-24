package com.oneeats.restaurant.application.command;

import java.util.UUID;

public record BlockRestaurantCommand(
    UUID restaurantId,
    String reason
) {}
