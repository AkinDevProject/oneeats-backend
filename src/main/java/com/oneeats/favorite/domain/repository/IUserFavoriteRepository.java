package com.oneeats.favorite.domain.repository;

import com.oneeats.favorite.domain.model.UserFavorite;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IUserFavoriteRepository {

    /**
     * Sauvegarde un favori
     */
    UserFavorite save(UserFavorite favorite);

    /**
     * Trouve un favori par son ID
     */
    Optional<UserFavorite> findById(UUID id);

    /**
     * Trouve tous les favoris d'un utilisateur
     */
    List<UserFavorite> findByUserId(UUID userId);

    /**
     * Trouve un favori spécifique par utilisateur et restaurant
     */
    Optional<UserFavorite> findByUserIdAndRestaurantId(UUID userId, UUID restaurantId);

    /**
     * Vérifie si un restaurant est dans les favoris d'un utilisateur
     */
    boolean existsByUserIdAndRestaurantId(UUID userId, UUID restaurantId);

    /**
     * Supprime un favori par son ID
     */
    void deleteById(UUID id);

    /**
     * Supprime un favori par utilisateur et restaurant
     */
    void deleteByUserIdAndRestaurantId(UUID userId, UUID restaurantId);

    /**
     * Compte le nombre de favoris d'un utilisateur
     */
    long countByUserId(UUID userId);

    /**
     * Supprime tous les favoris d'un utilisateur
     */
    void deleteAllByUserId(UUID userId);
}