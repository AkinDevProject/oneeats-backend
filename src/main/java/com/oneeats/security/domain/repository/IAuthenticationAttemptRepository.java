package com.oneeats.security.domain.repository;

import com.oneeats.security.domain.model.AuthenticationAttempt;
import com.oneeats.shared.domain.vo.Email;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IAuthenticationAttemptRepository {
    
    Optional<AuthenticationAttempt> findById(UUID id);
    
    List<AuthenticationAttempt> findAll();
    
    List<AuthenticationAttempt> findByEmail(Email email);
    
    List<AuthenticationAttempt> findByEmailAndTimeRange(Email email, LocalDateTime start, LocalDateTime end);
    
    List<AuthenticationAttempt> findByIpAddress(String ipAddress);
    
    AuthenticationAttempt save(AuthenticationAttempt attempt);
    
    void delete(AuthenticationAttempt attempt);
    
    long countFailedAttemptsByEmailInLastHour(Email email);
    
    long countFailedAttemptsByIpInLastHour(String ipAddress);
}