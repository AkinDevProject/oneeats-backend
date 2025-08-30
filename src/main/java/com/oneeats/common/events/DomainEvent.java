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
    LocalDateTime getOccurredAt();
    
    /**
     * Type d'événement (utilisé pour le routage)
     */
    default String getEventType() {
        return this.getClass().getSimpleName();
    }
    
    /**
     * Données de l'événement sérialisées en JSON
     */
    default String getEventData() {
        return "{}"; // Implémentation par défaut
    }
}