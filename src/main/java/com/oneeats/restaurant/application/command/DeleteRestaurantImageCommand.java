package com.oneeats.restaurant.application.command;

import java.util.UUID;

public record DeleteRestaurantImageCommand(UUID restaurantId) {
}