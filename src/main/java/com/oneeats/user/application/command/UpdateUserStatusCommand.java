package com.oneeats.user.application.command;

import com.oneeats.user.domain.model.UserStatus;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record UpdateUserStatusCommand(
    @NotNull UUID id,
    @NotNull UserStatus status
) {}