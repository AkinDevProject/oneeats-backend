package com.oneeats.notification.application.mapper;

import com.oneeats.notification.application.dto.NotificationDTO;
import com.oneeats.notification.domain.model.Notification;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class NotificationApplicationMapper {
    
    public NotificationDTO toDTO(Notification notification) {
        return new NotificationDTO(
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