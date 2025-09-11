package com.oneeats.shared.domain.exception;

import java.util.UUID;

public class EntityNotFoundException extends DomainException {
    
    private final String entityType;
    private final Object entityId;
    
    public EntityNotFoundException(String entityType, Object id) {
        super(String.format("%s with id '%s' not found", entityType, id));
        this.entityType = entityType;
        this.entityId = id;
    }
    
    public EntityNotFoundException(String entityType, UUID id) {
        super(String.format("%s with id '%s' not found", entityType, id));
        this.entityType = entityType;
        this.entityId = id;
    }
    
    public EntityNotFoundException(String message) {
        super(message);
        this.entityType = "Unknown";
        this.entityId = null;
    }
    
    public String getEntityType() {
        return entityType;
    }
    
    public Object getEntityId() {
        return entityId;
    }
}