package com.oneeats.notification.api.model;

import java.time.LocalDateTime;
import java.util.UUID;

public class NotificationDto {
    private UUID id;
    private UUID destinataireId;
    private String type;
    private String message;
    private LocalDateTime dateEnvoi;
    private boolean lu;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getDestinataireId() { return destinataireId; }
    public void setDestinataireId(UUID destinataireId) { this.destinataireId = destinataireId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public LocalDateTime getDateEnvoi() { return dateEnvoi; }
    public void setDateEnvoi(LocalDateTime dateEnvoi) { this.dateEnvoi = dateEnvoi; }
    public boolean isLu() { return lu; }
    public void setLu(boolean lu) { this.lu = lu; }
}

