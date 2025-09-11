package com.oneeats.security.infrastructure.repository;

import com.oneeats.security.domain.model.AuthAttemptResult;
import com.oneeats.security.domain.model.AuthenticationAttempt;
import com.oneeats.security.domain.repository.IAuthenticationAttemptRepository;
import com.oneeats.security.infrastructure.entity.AuthenticationAttemptEntity;
import com.oneeats.security.infrastructure.mapper.AuthenticationAttemptMapper;
import com.oneeats.shared.domain.vo.Email;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
public class JpaAuthenticationAttemptRepository implements IAuthenticationAttemptRepository {

    @Inject
    AuthenticationAttemptMapper mapper;

    @Override
    public Optional<AuthenticationAttempt> findById(UUID id) {
        return AuthenticationAttemptEntity.find("id", id)
                .firstResultOptional()
                .map(entity -> mapper.toDomain((AuthenticationAttemptEntity) entity));
    }

    @Override
    public List<AuthenticationAttempt> findAll() {
        return AuthenticationAttemptEntity.<AuthenticationAttemptEntity>listAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<AuthenticationAttempt> findByEmail(Email email) {
        return AuthenticationAttemptEntity.<AuthenticationAttemptEntity>list("email", email.getValue()).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<AuthenticationAttempt> findByEmailAndTimeRange(Email email, LocalDateTime start, LocalDateTime end) {
        return AuthenticationAttemptEntity.<AuthenticationAttemptEntity>find(
                "email = ?1 and createdAt between ?2 and ?3", 
                email.getValue(), start, end).list().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<AuthenticationAttempt> findByIpAddress(String ipAddress) {
        return AuthenticationAttemptEntity.<AuthenticationAttemptEntity>list("ipAddress", ipAddress).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public AuthenticationAttempt save(AuthenticationAttempt attempt) {
        AuthenticationAttemptEntity entity = mapper.toEntity(attempt);
        entity.persistAndFlush();
        return mapper.toDomain(entity);
    }

    @Override
    public void delete(AuthenticationAttempt attempt) {
        AuthenticationAttemptEntity.deleteById(attempt.getId());
    }

    @Override
    public long countFailedAttemptsByEmailInLastHour(Email email) {
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        return AuthenticationAttemptEntity.count(
            "email = ?1 and result = ?2 and createdAt >= ?3",
            email.getValue(), AuthAttemptResult.FAILED, oneHourAgo
        );
    }

    @Override
    public long countFailedAttemptsByIpInLastHour(String ipAddress) {
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        return AuthenticationAttemptEntity.count(
            "ipAddress = ?1 and result = ?2 and createdAt >= ?3",
            ipAddress, AuthAttemptResult.FAILED, oneHourAgo
        );
    }
}