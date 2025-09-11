package com.oneeats.security.domain.model;

import com.oneeats.shared.domain.entity.BaseEntity;
import com.oneeats.shared.domain.vo.Email;

import java.time.LocalDateTime;
import java.util.UUID;

public class AuthenticationAttempt extends BaseEntity {
    
    private Email email;
    private AuthAttemptResult result;
    private String ipAddress;
    private String userAgent;
    private String failureReason;

    protected AuthenticationAttempt() {}

    public AuthenticationAttempt(UUID id, Email email, AuthAttemptResult result, 
                               String ipAddress, String userAgent, String failureReason) {
        super(id);
        this.email = email;
        this.result = result;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.failureReason = failureReason;
    }

    public static AuthenticationAttempt successful(Email email, String ipAddress, String userAgent) {
        return new AuthenticationAttempt(
            UUID.randomUUID(),
            email,
            AuthAttemptResult.SUCCESS,
            ipAddress,
            userAgent,
            null
        );
    }

    public static AuthenticationAttempt failed(Email email, String ipAddress, String userAgent, String reason) {
        return new AuthenticationAttempt(
            UUID.randomUUID(),
            email,
            AuthAttemptResult.FAILED,
            ipAddress,
            userAgent,
            reason
        );
    }

    public boolean isSuccessful() {
        return result == AuthAttemptResult.SUCCESS;
    }

    // Getters
    public Email getEmail() { return email; }
    public AuthAttemptResult getResult() { return result; }
    public String getIpAddress() { return ipAddress; }
    public String getUserAgent() { return userAgent; }
    public String getFailureReason() { return failureReason; }
}