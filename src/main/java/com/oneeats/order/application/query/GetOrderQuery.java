package com.oneeats.order.application.query;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record GetOrderQuery(
    @NotNull UUID id
) {}