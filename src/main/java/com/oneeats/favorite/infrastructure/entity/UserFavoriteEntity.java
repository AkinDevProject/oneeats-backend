package com.oneeats.favorite.infrastructure.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_favorites",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "restaurant_id"}))
public class UserFavoriteEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    public UUID id;

    @Column(name = "user_id", nullable = false)
    public UUID userId;

    @Column(name = "restaurant_id", nullable = false)
    public UUID restaurantId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    public LocalDateTime createdAt;

    // Constructeur par défaut requis par JPA
    public UserFavoriteEntity() {}

    // Constructeur avec paramètres
    public UserFavoriteEntity(UUID userId, UUID restaurantId) {
        this.userId = userId;
        this.restaurantId = restaurantId;
    }

    // Méthodes utilitaires Panache
    public static UserFavoriteEntity findByUserAndRestaurant(UUID userId, UUID restaurantId) {
        return find("userId = ?1 and restaurantId = ?2", userId, restaurantId).firstResult();
    }

    public static java.util.List<UserFavoriteEntity> findByUserId(UUID userId) {
        return list("userId", userId);
    }

    public static long countByUserId(UUID userId) {
        return count("userId", userId);
    }

    public static boolean existsByUserAndRestaurant(UUID userId, UUID restaurantId) {
        return count("userId = ?1 and restaurantId = ?2", userId, restaurantId) > 0;
    }

    public static void deleteByUserAndRestaurant(UUID userId, UUID restaurantId) {
        delete("userId = ?1 and restaurantId = ?2", userId, restaurantId);
    }

    public static void deleteAllByUserId(UUID userId) {
        delete("userId", userId);
    }
}