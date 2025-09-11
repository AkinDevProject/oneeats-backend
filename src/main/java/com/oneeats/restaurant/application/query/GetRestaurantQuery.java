package com.oneeats.restaurant.application.query;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record GetRestaurantQuery(
    @NotNull UUID id
) {}