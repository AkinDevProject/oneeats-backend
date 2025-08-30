package com.oneeats.common.events;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Interface de base pour tous les événements métier
 * Utilisée avec CDI Events pour l'architecture event-driven
 */
public interface DomainEvent {
    
    /**
     * ID unique de l'événement
     */
    UUID getEventId();
    
    /**
     * Timestamp de création de l'événement
     */
    LocalDateTime getOccurredOn();
    
    /**
     * Type d'événement (utilisé pour le routage)
     */
    String getEventType();
    
    /**
     * Données de l'événement sérialisées en JSON
     */
    String getEventData();
}