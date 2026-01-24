package com.oneeats.restaurant.application.command;

import java.util.UUID;

public record RejectRestaurantCommand(
    UUID restaurantId,
    String reason
) {}
