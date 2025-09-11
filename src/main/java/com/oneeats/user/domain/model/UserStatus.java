package com.oneeats.user.domain.model;

public enum UserStatus {
    ACTIVE,
    INACTIVE,
    SUSPENDED;
    
    public boolean isActive() {
        return this == ACTIVE;
    }
}