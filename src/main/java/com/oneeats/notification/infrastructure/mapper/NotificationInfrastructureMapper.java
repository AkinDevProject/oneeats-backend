package com.oneeats.notification.infrastructure.mapper;

import com.oneeats.notification.domain.model.Notification;
import com.oneeats.notification.infrastructure.entity.NotificationEntity;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class NotificationInfrastructureMapper {

    public Notification toDomain(NotificationEntity entity) {
        return new Notification(
            entity.getId(),
            entity.getRecipientId(),
            entity.getType(),
            entity.getTitle(),
            entity.getMessage(),
            entity.getStatus(),
            entity.getScheduledAt()
        );
    }

    public NotificationEntity toEntity(Notification notification) {
        return new NotificationEntity(
            notification.getId(),
            notification.getRecipientId(),
            notification.getType(),
            notification.getTitle(),
            notification.getMessage(),
            notification.getStatus(),
            notification.getScheduledAt(),
            notification.getSentAt(),
            notification.getCreatedAt(),
            notification.getUpdatedAt()
        );
    }
}