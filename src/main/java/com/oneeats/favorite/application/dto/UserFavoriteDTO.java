package com.oneeats.favorite.application.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserFavoriteDTO(
    UUID id,
    UUID userId,
    UUID restaurantId,
    // Données enrichies du restaurant
    String restaurantName,
    String restaurantCuisine,
    Double restaurantRating,
    Integer restaurantReviewCount,
    String restaurantDeliveryTime,
    Double restaurantDeliveryFee,
    Boolean restaurantIsOpen,
    String restaurantImageUrl,
    LocalDateTime createdAt
) {}

// DTO pour les requêtes d'ajout/suppression
record AddFavoriteRequest(UUID restaurantId) {}
record FavoriteResponse(boolean isFavorite, String message) {}