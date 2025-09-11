package com.oneeats.admin.domain.event;

import com.oneeats.admin.domain.model.AdminRole;
import com.oneeats.shared.domain.event.IDomainEvent;
import com.oneeats.shared.domain.vo.Email;

import java.time.LocalDateTime;
import java.util.UUID;

public class AdminCreatedEvent implements IDomainEvent {
    
    private final UUID adminId;
    private final Email email;
    private final AdminRole role;
    private final LocalDateTime occurredOn;

    public AdminCreatedEvent(UUID adminId, Email email, AdminRole role) {
        this.adminId = adminId;
        this.email = email;
        this.role = role;
        this.occurredOn = LocalDateTime.now();
    }

    @Override
    public LocalDateTime occurredOn() {
        return occurredOn;
    }

    public UUID getAdminId() {
        return adminId;
    }

    public Email getEmail() {
        return email;
    }

    public AdminRole getRole() {
        return role;
    }
}