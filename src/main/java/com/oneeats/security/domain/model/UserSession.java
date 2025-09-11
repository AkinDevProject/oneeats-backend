package com.oneeats.security.domain.model;

import com.oneeats.shared.domain.entity.BaseEntity;
import com.oneeats.security.domain.event.UserLoggedInEvent;
import com.oneeats.security.domain.event.UserLoggedOutEvent;

import java.time.LocalDateTime;
import java.util.UUID;

public class UserSession extends BaseEntity {
    
    private UUID userId;
    private String sessionToken;
    private SessionStatus status;
    private LocalDateTime expiresAt;
    private String userAgent;
    private String ipAddress;

    protected UserSession() {}

    public UserSession(UUID id, UUID userId, String sessionToken, SessionStatus status, 
                      LocalDateTime expiresAt, String userAgent, String ipAddress) {
        super(id);
        this.userId = userId;
        this.sessionToken = sessionToken;
        this.status = status;
        this.expiresAt = expiresAt;
        this.userAgent = userAgent;
        this.ipAddress = ipAddress;
    }

    public static UserSession create(UUID userId, String sessionToken, String userAgent, String ipAddress) {
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(24); // 24h session
        
        UserSession session = new UserSession(
            UUID.randomUUID(),
            userId,
            sessionToken,
            SessionStatus.ACTIVE,
            expiresAt,
            userAgent,
            ipAddress
        );
        
        session.addDomainEvent(new UserLoggedInEvent(
            session.getId(),
            session.getUserId(),
            session.getIpAddress()
        ));
        
        return session;
    }

    public void logout() {
        this.status = SessionStatus.LOGGED_OUT;
        this.addDomainEvent(new UserLoggedOutEvent(
            this.getId(),
            this.getUserId()
        ));
        this.markAsModified();
    }

    public void expire() {
        this.status = SessionStatus.EXPIRED;
        this.markAsModified();
    }

    public boolean isValid() {
        return status == SessionStatus.ACTIVE && 
               expiresAt.isAfter(LocalDateTime.now());
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    // Getters
    public UUID getUserId() { return userId; }
    public String getSessionToken() { return sessionToken; }
    public SessionStatus getStatus() { return status; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public String getUserAgent() { return userAgent; }
    public String getIpAddress() { return ipAddress; }
}