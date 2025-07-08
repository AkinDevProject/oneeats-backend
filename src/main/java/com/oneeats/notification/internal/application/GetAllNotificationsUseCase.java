package com.oneeats.notification.internal.application;

import com.oneeats.notification.api.model.NotificationDto;
import com.oneeats.notification.api.interface_.NotificationService;
import com.oneeats.notification.internal.entity.Notification;
import com.oneeats.notification.internal.mapper.NotificationMapper;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class GetAllNotificationsUseCase {
    private final NotificationService notificationService;

    public GetAllNotificationsUseCase(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    public List<NotificationDto> handle(UUID destinataireId) {
        List<Notification> notifications = notificationService.findAllByDestinataire(destinataireId);
        return notifications.stream().map(NotificationMapper::toDto).collect(Collectors.toList());
    }

    public List<NotificationDto> handleAll() {
        List<Notification> notifications = notificationService.findAll();
        return notifications.stream().map(NotificationMapper::toDto).collect(Collectors.toList());
    }
}
