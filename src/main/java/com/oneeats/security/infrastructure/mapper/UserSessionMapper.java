package com.oneeats.security.infrastructure.mapper;

import com.oneeats.security.domain.model.UserSession;
import com.oneeats.security.infrastructure.entity.UserSessionEntity;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class UserSessionMapper {

    public UserSession toDomain(UserSessionEntity entity) {
        if (entity == null) return null;
        
        return new UserSession(
            entity.getId(),
            entity.getUserId(),
            entity.getSessionToken(),
            entity.getStatus(),
            entity.getExpiresAt(),
            entity.getUserAgent(),
            entity.getIpAddress()
        );
    }

    public UserSessionEntity toEntity(UserSession domain) {
        if (domain == null) return null;
        
        return new UserSessionEntity(
            domain.getId(),
            domain.getUserId(),
            domain.getSessionToken(),
            domain.getStatus(),
            domain.getExpiresAt(),
            domain.getUserAgent(),
            domain.getIpAddress(),
            domain.getCreatedAt(),
            domain.getUpdatedAt()
        );
    }
}