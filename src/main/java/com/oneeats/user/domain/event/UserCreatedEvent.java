package com.oneeats.user.domain.event;

import com.oneeats.shared.domain.event.IDomainEvent;
import com.oneeats.shared.domain.vo.Email;

import java.time.LocalDateTime;
import java.util.UUID;

public class UserCreatedEvent implements IDomainEvent {
    private final UUID userId;
    private final Email email;
    private final String fullName;
    private final LocalDateTime occurredOn;
    
    public UserCreatedEvent(UUID userId, Email email, String fullName) {
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.occurredOn = LocalDateTime.now();
    }
    
    @Override
    public LocalDateTime occurredOn() {
        return occurredOn;
    }
    
    
    public UUID getUserId() { return userId; }
    public Email getEmail() { return email; }
    public String getFullName() { return fullName; }
}