package com.oneeats.notification.api.cqrs.command;

import java.util.UUID;

public class SendNotificationCommand {
    private UUID destinataireId;
    private String type;
    private String message;

    public UUID getDestinataireId() { return destinataireId; }
    public void setDestinataireId(UUID destinataireId) { this.destinataireId = destinataireId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}

