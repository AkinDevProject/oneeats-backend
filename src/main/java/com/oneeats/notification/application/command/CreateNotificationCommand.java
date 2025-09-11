package com.oneeats.notification.application.command;

import com.oneeats.notification.domain.model.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateNotificationCommand(
    @NotNull UUID recipientId,
    @NotNull NotificationType type,
    @NotBlank String title,
    @NotBlank String message
) {}