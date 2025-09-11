package com.oneeats.notification.domain.event;

import com.oneeats.notification.domain.model.NotificationType;
import com.oneeats.shared.domain.event.IDomainEvent;

import java.time.LocalDateTime;
import java.util.UUID;

public class NotificationCreatedEvent implements IDomainEvent {
    
    private final UUID notificationId;
    private final UUID recipientId;
    private final NotificationType type;
    private final LocalDateTime occurredOn;

    public NotificationCreatedEvent(UUID notificationId, UUID recipientId, NotificationType type) {
        this.notificationId = notificationId;
        this.recipientId = recipientId;
        this.type = type;
        this.occurredOn = LocalDateTime.now();
    }

    @Override
    public LocalDateTime occurredOn() {
        return occurredOn;
    }

    public UUID getNotificationId() {
        return notificationId;
    }

    public UUID getRecipientId() {
        return recipientId;
    }

    public NotificationType getType() {
        return type;
    }
}