package com.oneeats.notification.domain.service;

import com.oneeats.notification.domain.repository.INotificationRepository;
import com.oneeats.shared.domain.exception.ValidationException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class NotificationDomainService {

    @Inject
    INotificationRepository notificationRepository;

    public void validateNotificationCreation(String title, String message) {
        if (title == null || title.trim().isEmpty()) {
            throw new ValidationException("Notification title cannot be empty");
        }
        
        if (message == null || message.trim().isEmpty()) {
            throw new ValidationException("Notification message cannot be empty");
        }
        
        if (title.length() > 200) {
            throw new ValidationException("Notification title cannot exceed 200 characters");
        }
        
        if (message.length() > 1000) {
            throw new ValidationException("Notification message cannot exceed 1000 characters");
        }
    }
}