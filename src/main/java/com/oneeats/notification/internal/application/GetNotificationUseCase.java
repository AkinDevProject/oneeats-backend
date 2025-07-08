package com.oneeats.notification.internal.application;

import com.oneeats.notification.api.model.NotificationDto;
import com.oneeats.notification.api.interface_.NotificationService;
import com.oneeats.notification.internal.entity.Notification;
import com.oneeats.notification.internal.mapper.NotificationMapper;
import java.util.Optional;
import java.util.UUID;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class GetNotificationUseCase {
    private final NotificationService notificationService;

    public GetNotificationUseCase(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    public Optional<NotificationDto> handle(UUID notificationId) {
        Optional<Notification> opt = notificationService.findById(notificationId);
        return opt.map(NotificationMapper::toDto);
    }
}
