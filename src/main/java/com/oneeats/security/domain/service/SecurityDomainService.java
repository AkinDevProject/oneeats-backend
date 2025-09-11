package com.oneeats.security.domain.service;

import com.oneeats.security.domain.repository.IAuthenticationAttemptRepository;
import com.oneeats.security.domain.repository.IUserSessionRepository;
import com.oneeats.shared.domain.vo.Email;
import com.oneeats.shared.domain.exception.ValidationException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.security.SecureRandom;
import java.util.Base64;

@ApplicationScoped
public class SecurityDomainService {

    @Inject
    IAuthenticationAttemptRepository authAttemptRepository;

    @Inject
    IUserSessionRepository sessionRepository;

    private static final int MAX_FAILED_ATTEMPTS_PER_HOUR = 5;
    private static final int MAX_FAILED_ATTEMPTS_PER_IP_HOUR = 20;

    public String generateSessionToken() {
        SecureRandom random = new SecureRandom();
        byte[] tokenBytes = new byte[32];
        random.nextBytes(tokenBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    }

    public void validateAuthenticationAttempt(Email email, String ipAddress) {
        long failedAttemptsForEmail = authAttemptRepository.countFailedAttemptsByEmailInLastHour(email);
        if (failedAttemptsForEmail >= MAX_FAILED_ATTEMPTS_PER_HOUR) {
            throw new ValidationException("Too many failed login attempts for this email. Please try again later.");
        }

        long failedAttemptsForIp = authAttemptRepository.countFailedAttemptsByIpInLastHour(ipAddress);
        if (failedAttemptsForIp >= MAX_FAILED_ATTEMPTS_PER_IP_HOUR) {
            throw new ValidationException("Too many failed login attempts from this IP address. Please try again later.");
        }
    }

    public boolean isSessionTokenValid(String sessionToken) {
        if (sessionToken == null || sessionToken.trim().isEmpty()) {
            return false;
        }
        
        return sessionRepository.findBySessionToken(sessionToken)
            .map(session -> session.isValid())
            .orElse(false);
    }

    public void cleanupExpiredSessions() {
        sessionRepository.deleteExpiredSessions();
    }
}