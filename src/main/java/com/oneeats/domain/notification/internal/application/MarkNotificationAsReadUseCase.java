package com.oneeats.domain.notification.internal.application;

import com.oneeats.domain.notification.api.cqrs.command.MarkNotificationAsReadCommand;
import com.oneeats.domain.notification.api.interface_.NotificationService;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class MarkNotificationAsReadUseCase {
    private final NotificationService notificationService;

    public MarkNotificationAsReadUseCase(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    public void handle(MarkNotificationAsReadCommand command) {
        notificationService.markAsRead(command.getNotificationId());
    }
}
