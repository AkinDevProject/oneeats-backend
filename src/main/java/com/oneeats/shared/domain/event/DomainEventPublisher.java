package com.oneeats.shared.domain.event;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Event;
import jakarta.inject.Inject;

@ApplicationScoped
public class DomainEventPublisher {

    @Inject
    Event<IDomainEvent> eventBus;

    public void publish(IDomainEvent event) {
        eventBus.fire(event);
    }
    
    public void publishEvent(IDomainEvent event) {
        publish(event);
    }
}