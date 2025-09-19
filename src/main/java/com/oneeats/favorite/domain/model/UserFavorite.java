package com.oneeats.favorite.domain.model;

import com.oneeats.shared.domain.entity.BaseEntity;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

public class UserFavorite extends BaseEntity {
    private UUID userId;
    private UUID restaurantId;
    private LocalDateTime createdAt;

    // Constructeur privé pour forcer l'utilisation des factory methods
    private UserFavorite(UUID userId, UUID restaurantId) {
        this.userId = Objects.requireNonNull(userId, "User ID cannot be null");
        this.restaurantId = Objects.requireNonNull(restaurantId, "Restaurant ID cannot be null");
        this.createdAt = LocalDateTime.now();
    }

    // Factory method pour créer un nouveau favori
    public static UserFavorite create(UUID userId, UUID restaurantId) {
        return new UserFavorite(userId, restaurantId);
    }

    // Factory method pour reconstruction depuis la persistence
    public static UserFavorite fromPersistence(UUID id, UUID userId, UUID restaurantId, LocalDateTime createdAt) {
        UserFavorite favorite = new UserFavorite(userId, restaurantId);
        favorite.setId(id);
        favorite.createdAt = createdAt;
        return favorite;
    }

    // Getters
    public UUID getUserId() { return userId; }
    public UUID getRestaurantId() { return restaurantId; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserFavorite that = (UserFavorite) o;
        return Objects.equals(userId, that.userId) && Objects.equals(restaurantId, that.restaurantId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, restaurantId);
    }

    @Override
    public String toString() {
        return "UserFavorite{" +
                "id=" + getId() +
                ", userId=" + userId +
                ", restaurantId=" + restaurantId +
                ", createdAt=" + createdAt +
                '}';
    }
}