package com.oneeats.domain.notification.internal.entity;

import java.util.UUID;
import java.time.LocalDateTime;

public class Notification {
    private UUID id;
    private UUID destinataireId;
    private String type; // ex: NEW_ORDER, STATUS_UPDATE
    private String message;
    private LocalDateTime dateEnvoi;
    private boolean lu;

    public Notification(UUID id, UUID destinataireId, String type, String message, LocalDateTime dateEnvoi, boolean lu) {
        this.id = id;
        this.destinataireId = destinataireId;
        this.type = type;
        this.message = message;
        this.dateEnvoi = dateEnvoi;
        this.lu = lu;
    }

    // Getters et setters
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

