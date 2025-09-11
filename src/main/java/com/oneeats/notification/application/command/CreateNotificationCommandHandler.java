package com.oneeats.notification.application.command;

import com.oneeats.notification.application.dto.NotificationDTO;
import com.oneeats.notification.application.mapper.NotificationApplicationMapper;
import com.oneeats.notification.domain.model.Notification;
import com.oneeats.notification.domain.repository.INotificationRepository;
import com.oneeats.notification.domain.service.NotificationDomainService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class CreateNotificationCommandHandler {

    @Inject
    INotificationRepository notificationRepository;

    @Inject
    NotificationDomainService notificationDomainService;

    @Inject
    NotificationApplicationMapper mapper;

    @Transactional
    public NotificationDTO handle(CreateNotificationCommand command) {
        notificationDomainService.validateNotificationCreation(
            command.title(), 
            command.message()
        );

        Notification notification = Notification.create(
            command.recipientId(),
            command.type(),
            command.title(),
            command.message()
        );

        Notification savedNotification = notificationRepository.save(notification);
        return mapper.toDTO(savedNotification);
    }
}