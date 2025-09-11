package com.oneeats.security.domain.event;

import com.oneeats.shared.domain.event.IDomainEvent;

import java.time.LocalDateTime;
import java.util.UUID;

public class UserLoggedInEvent implements IDomainEvent {
    
    private final UUID sessionId;
    private final UUID userId;
    private final String ipAddress;
    private final LocalDateTime occurredOn;

    public UserLoggedInEvent(UUID sessionId, UUID userId, String ipAddress) {
        this.sessionId = sessionId;
        this.userId = userId;
        this.ipAddress = ipAddress;
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

    public String getIpAddress() {
        return ipAddress;
    }
}