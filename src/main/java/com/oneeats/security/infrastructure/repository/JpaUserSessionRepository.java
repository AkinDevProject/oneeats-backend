package com.oneeats.security.infrastructure.repository;

import com.oneeats.security.domain.model.SessionStatus;
import com.oneeats.security.domain.model.UserSession;
import com.oneeats.security.domain.repository.IUserSessionRepository;
import com.oneeats.security.infrastructure.entity.UserSessionEntity;
import com.oneeats.security.infrastructure.mapper.UserSessionMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
public class JpaUserSessionRepository implements IUserSessionRepository {

    @Inject
    UserSessionMapper mapper;

    @Override
    public Optional<UserSession> findById(UUID id) {
        return UserSessionEntity.find("id", id)
                .firstResultOptional()
                .map(entity -> mapper.toDomain((UserSessionEntity) entity));
    }

    @Override
    public Optional<UserSession> findBySessionToken(String sessionToken) {
        return UserSessionEntity.find("sessionToken", sessionToken)
                .firstResultOptional()
                .map(entity -> mapper.toDomain((UserSessionEntity) entity));
    }

    @Override
    public List<UserSession> findByUserId(UUID userId) {
        return UserSessionEntity.<UserSessionEntity>list("userId", userId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserSession> findByUserIdAndStatus(UUID userId, SessionStatus status) {
        return UserSessionEntity.<UserSessionEntity>find("userId = ?1 and status = ?2", userId, status).list().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public UserSession save(UserSession session) {
        UserSessionEntity entity = mapper.toEntity(session);
        entity.persistAndFlush();
        return mapper.toDomain(entity);
    }

    @Override
    public void delete(UserSession session) {
        UserSessionEntity.deleteById(session.getId());
    }

    @Override
    public List<UserSession> findExpiredSessions() {
        LocalDateTime now = LocalDateTime.now();
        return UserSessionEntity.<UserSessionEntity>find(
                "status = ?1 and expiresAt <= ?2", 
                SessionStatus.ACTIVE, now).list().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteExpiredSessions() {
        LocalDateTime now = LocalDateTime.now();
        UserSessionEntity.delete("status = ?1 and expiresAt <= ?2", SessionStatus.ACTIVE, now);
    }
}