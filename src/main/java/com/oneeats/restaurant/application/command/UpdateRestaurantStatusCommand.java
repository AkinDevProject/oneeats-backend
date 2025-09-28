package com.oneeats.restaurant.application.command;

import com.oneeats.restaurant.domain.model.RestaurantStatus;
import java.util.UUID;

public record UpdateRestaurantStatusCommand(
    UUID restaurantId,
    RestaurantStatus status
) {}