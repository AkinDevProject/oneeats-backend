package com.oneeats.restaurant.application.command;

import java.util.UUID;

public record DeleteRestaurantCommand(
    UUID restaurantId
) {}