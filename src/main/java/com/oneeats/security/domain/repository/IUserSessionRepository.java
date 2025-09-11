package com.oneeats.security.domain.repository;

import com.oneeats.security.domain.model.UserSession;
import com.oneeats.security.domain.model.SessionStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IUserSessionRepository {
    
    Optional<UserSession> findById(UUID id);
    
    Optional<UserSession> findBySessionToken(String sessionToken);
    
    List<UserSession> findByUserId(UUID userId);
    
    List<UserSession> findByUserIdAndStatus(UUID userId, SessionStatus status);
    
    UserSession save(UserSession session);
    
    void delete(UserSession session);
    
    List<UserSession> findExpiredSessions();
    
    void deleteExpiredSessions();
}