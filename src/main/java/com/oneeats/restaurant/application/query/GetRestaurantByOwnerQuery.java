package com.oneeats.restaurant.application.query;

import java.util.UUID;

public record GetRestaurantByOwnerQuery(
    UUID ownerId
) {}