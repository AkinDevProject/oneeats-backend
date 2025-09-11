package com.oneeats.user.domain.event;

import com.oneeats.shared.domain.event.IDomainEvent;
import com.oneeats.shared.domain.vo.Email;

import java.time.LocalDateTime;
import java.util.UUID;

public class UserUpdatedEvent implements IDomainEvent {
    private final UUID userId;
    private final Email email;
    private final LocalDateTime occurredOn;
    
    public UserUpdatedEvent(UUID userId, Email email) {
        this.userId = userId;
        this.email = email;
        this.occurredOn = LocalDateTime.now();
    }
    
    @Override
    public LocalDateTime occurredOn() {
        return occurredOn;
    }
    
    
    public UUID getUserId() { return userId; }
    public Email getEmail() { return email; }
}