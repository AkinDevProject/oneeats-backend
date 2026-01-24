package com.oneeats.security.application.dto;

/**
 * DTO pour les reponses d'inscription reussie.
 * Contient les tokens JWT pour authentification immediate.
 */
public record RegisterResponseDTO(
    String access_token,
    String refresh_token,
    int expires_in,
    String token_type,
    String user_id
) {
    public static RegisterResponseDTO of(
        String accessToken,
        String refreshToken,
        int expiresIn,
        String userId
    ) {
        return new RegisterResponseDTO(
            accessToken,
            refreshToken,
            expiresIn,
            "Bearer",
            userId
        );
    }
}
