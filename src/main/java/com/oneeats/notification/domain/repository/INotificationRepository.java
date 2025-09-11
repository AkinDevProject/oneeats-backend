package com.oneeats.notification.domain.repository;

import com.oneeats.notification.domain.model.Notification;
import com.oneeats.notification.domain.model.NotificationStatus;
import com.oneeats.notification.domain.model.NotificationType;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface INotificationRepository {
    
    Optional<Notification> findById(UUID id);
    
    List<Notification> findAll();
    
    List<Notification> findByRecipientId(UUID recipientId);
    
    List<Notification> findByRecipientIdAndStatus(UUID recipientId, NotificationStatus status);
    
    List<Notification> findByType(NotificationType type);
    
    Notification save(Notification notification);
    
    void delete(Notification notification);
    
    long countUnreadByRecipientId(UUID recipientId);
}