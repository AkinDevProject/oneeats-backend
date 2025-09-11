package com.oneeats.notification.domain.model;

import com.oneeats.shared.domain.entity.BaseEntity;
import com.oneeats.notification.domain.event.NotificationCreatedEvent;

import java.time.LocalDateTime;
import java.util.UUID;

public class Notification extends BaseEntity {
    
    private UUID recipientId;
    private NotificationType type;
    private String title;
    private String message;
    private NotificationStatus status;
    private LocalDateTime scheduledAt;
    private LocalDateTime sentAt;

    protected Notification() {}

    public Notification(UUID id, UUID recipientId, NotificationType type, String title, String message, 
                       NotificationStatus status, LocalDateTime scheduledAt) {
        super(id);
        this.recipientId = recipientId;
        this.type = type;
        this.title = title;
        this.message = message;
        this.status = status;
        this.scheduledAt = scheduledAt;
    }

    public static Notification create(UUID recipientId, NotificationType type, String title, String message) {
        Notification notification = new Notification(
            UUID.randomUUID(),
            recipientId,
            type,
            title,
            message,
            NotificationStatus.PENDING,
            LocalDateTime.now()
        );
        
        notification.addDomainEvent(new NotificationCreatedEvent(
            notification.getId(),
            notification.getRecipientId(),
            notification.getType()
        ));
        
        return notification;
    }

    public void markAsSent() {
        this.status = NotificationStatus.SENT;
        this.sentAt = LocalDateTime.now();
        this.markAsModified();
    }

    public void markAsFailed() {
        this.status = NotificationStatus.FAILED;
        this.markAsModified();
    }

    public void markAsRead() {
        this.status = NotificationStatus.READ;
        this.markAsModified();
    }

    // Getters
    public UUID getRecipientId() { return recipientId; }
    public NotificationType getType() { return type; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public NotificationStatus getStatus() { return status; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public LocalDateTime getSentAt() { return sentAt; }
}