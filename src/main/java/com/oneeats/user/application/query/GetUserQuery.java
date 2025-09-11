package com.oneeats.user.application.query;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record GetUserQuery(
    @NotNull UUID id
) {}