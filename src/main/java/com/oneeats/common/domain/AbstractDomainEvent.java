package com.oneeats.common.domain;

import com.oneeats.common.events.DomainEvent;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Classe abstraite de base pour tous les événements de domaine
 */
public abstract class AbstractDomainEvent implements DomainEvent {
    
    private final UUID eventId;
    private final LocalDateTime occurredAt;
    
    protected AbstractDomainEvent() {
        this.eventId = UUID.randomUUID();
        this.occurredAt = LocalDateTime.now();
    }
    
    @Override
    public UUID getEventId() {
        return eventId;
    }
    
    @Override
    public LocalDateTime getOccurredAt() {
        return occurredAt;
    }
    
    public String toString() {
        return String.format("%s{eventId=%s, occurredAt=%s}", 
            this.getClass().getSimpleName(), eventId, occurredAt);
    }
}