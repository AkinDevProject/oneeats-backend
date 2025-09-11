package com.oneeats.security.infrastructure.mapper;

import com.oneeats.security.domain.model.AuthenticationAttempt;
import com.oneeats.security.infrastructure.entity.AuthenticationAttemptEntity;
import com.oneeats.shared.domain.vo.Email;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class AuthenticationAttemptMapper {

    public AuthenticationAttempt toDomain(AuthenticationAttemptEntity entity) {
        if (entity == null) return null;
        
        return new AuthenticationAttempt(
            entity.getId(),
            new Email(entity.getEmail()),
            entity.getResult(),
            entity.getIpAddress(),
            entity.getUserAgent(),
            entity.getFailureReason()
        );
    }

    public AuthenticationAttemptEntity toEntity(AuthenticationAttempt domain) {
        if (domain == null) return null;
        
        return new AuthenticationAttemptEntity(
            domain.getId(),
            domain.getEmail().getValue(),
            domain.getResult(),
            domain.getIpAddress(),
            domain.getUserAgent(),
            domain.getFailureReason(),
            domain.getCreatedAt(),
            domain.getUpdatedAt()
        );
    }
}