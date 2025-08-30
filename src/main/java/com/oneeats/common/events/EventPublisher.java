package com.oneeats.common.events;

import com.oneeats.common.domain.BaseEntity;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Event;
import jakarta.inject.Inject;

/**
 * Éditeur d'événements utilisant CDI Events
 */
@ApplicationScoped
public class EventPublisher {
    
    @Inject
    Event<DomainEvent> eventPublisher;
    
    /**
     * Publier un événement de domaine
     */
    public void publish(DomainEvent event) {
        if (event != null) {
            eventPublisher.fire(event);
        }
    }
    
    /**
     * Publier un événement généré par une entité
     */
    public void publishFrom(BaseEntity entity, DomainEvent event) {
        if (entity != null && event != null) {
            publish(event);
        }
    }
}