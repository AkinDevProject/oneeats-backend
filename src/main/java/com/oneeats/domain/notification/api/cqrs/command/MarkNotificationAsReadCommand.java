package com.oneeats.domain.notification.api.cqrs.command;

import java.util.UUID;

public class MarkNotificationAsReadCommand {
    private UUID notificationId;

    public UUID getNotificationId() { return notificationId; }
    public void setNotificationId(UUID notificationId) { this.notificationId = notificationId; }
}

