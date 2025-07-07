package com.oneeats.domain.notification.internal.application;

import com.oneeats.domain.notification.api.cqrs.command.SendNotificationCommand;
import com.oneeats.domain.notification.api.interface_.NotificationService;
import com.oneeats.domain.notification.internal.entity.Notification;
import java.time.LocalDateTime;
import java.util.UUID;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * Cas d’usage pour l’envoi d’une notification à un utilisateur.
 * Orchestration de la création, de la validation et de la persistance de la notification via NotificationService.
 * Utilisé lors de l’envoi d’une notification pour une nouvelle commande, un changement de statut, etc.
 */
@ApplicationScoped
public class SendNotificationUseCase {
    private final NotificationService notificationService;

    public SendNotificationUseCase(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    public UUID handle(SendNotificationCommand command) {
        Notification notification = new Notification(
            UUID.randomUUID(),
            command.getDestinataireId(),
            command.getType(),
            command.getMessage(),
            LocalDateTime.now(),
            false
        );
        notificationService.send(notification);
        return notification.getId();
    }
}
