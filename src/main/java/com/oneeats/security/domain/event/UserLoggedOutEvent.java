package com.oneeats.security.domain.event;

import com.oneeats.shared.domain.event.IDomainEvent;

import java.time.LocalDateTime;
import java.util.UUID;

public class UserLoggedOutEvent implements IDomainEvent {
    
    private final UUID sessionId;
    private final UUID userId;
    private final LocalDateTime occurredOn;

    public UserLoggedOutEvent(UUID sessionId, UUID userId) {
        this.sessionId = sessionId;
        this.userId = userId;
        this.occurredOn = LocalDateTime.now();
    }

    @Override
    public LocalDateTime occurredOn() {
        return occurredOn;
    }

    public UUID getSessionId() {
        return sessionId;
    }

    public UUID getUserId() {
        return userId;
    }
}