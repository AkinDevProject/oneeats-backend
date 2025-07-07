package com.oneeats.domain.notification.internal.application;

import com.oneeats.domain.notification.api.interface_.NotificationService;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class DeleteNotificationUseCase {
    private final NotificationService notificationService;

    public DeleteNotificationUseCase(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    public boolean handle(UUID id) {
        Optional<?> notif = notificationService.findById(id);
        if (notif.isPresent()) {
            notificationService.deleteById(id);
            return true;
        }
        return false;
    }
}
