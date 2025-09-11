package com.oneeats.security.application.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record AuthenticationResponseDTO(
    UUID sessionId,
    String sessionToken,
    UUID userId,
    String userEmail,
    LocalDateTime expiresAt,
    boolean success,
    String message
) {
    
    public static AuthenticationResponseDTO success(UUID sessionId, String sessionToken, 
                                                   UUID userId, String userEmail, LocalDateTime expiresAt) {
        return new AuthenticationResponseDTO(
            sessionId, sessionToken, userId, userEmail, expiresAt, true, "Authentication successful"
        );
    }
    
    public static AuthenticationResponseDTO failure(String message) {
        return new AuthenticationResponseDTO(
            null, null, null, null, null, false, message
        );
    }
}