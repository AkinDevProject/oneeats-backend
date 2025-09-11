package com.oneeats.notification.application.dto;

import com.oneeats.notification.domain.model.NotificationStatus;
import com.oneeats.notification.domain.model.NotificationType;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationDTO(
    UUID id,
    UUID recipientId,
    NotificationType type,
    String title,
    String message,
    NotificationStatus status,
    LocalDateTime scheduledAt,
    LocalDateTime sentAt,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}