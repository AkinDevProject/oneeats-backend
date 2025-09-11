package com.oneeats.security.infrastructure.entity;

import com.oneeats.security.domain.model.AuthAttemptResult;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "authentication_attempts")
public class AuthenticationAttemptEntity extends PanacheEntityBase {

    @Id
    private UUID id;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")  
    private LocalDateTime updatedAt;

    @Column(name = "email", nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "result", nullable = false)
    private AuthAttemptResult result;

    @Column(name = "ip_address", nullable = false)
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    @Column(name = "failure_reason")
    private String failureReason;

    public AuthenticationAttemptEntity() {}

    public AuthenticationAttemptEntity(UUID id, String email, AuthAttemptResult result,
                                     String ipAddress, String userAgent, String failureReason,
                                     LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.email = email;
        this.result = result;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.failureReason = failureReason;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public AuthAttemptResult getResult() { return result; }
    public void setResult(AuthAttemptResult result) { this.result = result; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }

    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }
}