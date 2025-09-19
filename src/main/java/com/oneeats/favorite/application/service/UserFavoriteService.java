package com.oneeats.favorite.application.service;

import com.oneeats.favorite.domain.model.UserFavorite;
import com.oneeats.favorite.domain.repository.IUserFavoriteRepository;
import com.oneeats.restaurant.domain.repository.IRestaurantRepository;
import com.oneeats.user.domain.repository.IUserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class UserFavoriteService {

    @Inject
    IUserFavoriteRepository favoriteRepository;

    @Inject
    IUserRepository userRepository;

    @Inject
    IRestaurantRepository restaurantRepository;

    /**
     * Ajoute un restaurant aux favoris d'un utilisateur
     */
    @Transactional
    public UserFavorite addFavorite(UUID userId, UUID restaurantId) {
        // Vérifications métier
        if (!userRepository.findById(userId).isPresent()) {
            throw new IllegalArgumentException("User not found: " + userId);
        }

        if (!restaurantRepository.findById(restaurantId).isPresent()) {
            throw new IllegalArgumentException("Restaurant not found: " + restaurantId);
        }

        // Vérifier si pas déjà en favori
        if (favoriteRepository.existsByUserIdAndRestaurantId(userId, restaurantId)) {
            throw new IllegalStateException("Restaurant is already in user's favorites");
        }

        // Créer et sauvegarder le favori
        UserFavorite favorite = UserFavorite.create(userId, restaurantId);
        return favoriteRepository.save(favorite);
    }

    /**
     * Retire un restaurant des favoris d'un utilisateur
     */
    @Transactional
    public void removeFavorite(UUID userId, UUID restaurantId) {
        if (!favoriteRepository.existsByUserIdAndRestaurantId(userId, restaurantId)) {
            throw new IllegalArgumentException("Favorite not found for user " + userId + " and restaurant " + restaurantId);
        }

        favoriteRepository.deleteByUserIdAndRestaurantId(userId, restaurantId);
    }

    /**
     * Récupère tous les favoris d'un utilisateur
     */
    public List<UserFavorite> getUserFavorites(UUID userId) {
        // Commenté temporairement pour debug
        // if (!userRepository.findById(userId).isPresent()) {
        //     throw new IllegalArgumentException("User not found: " + userId);
        // }

        return favoriteRepository.findByUserId(userId);
    }

    /**
     * Vérifie si un restaurant est dans les favoris d'un utilisateur
     */
    public boolean isFavorite(UUID userId, UUID restaurantId) {
        return favoriteRepository.existsByUserIdAndRestaurantId(userId, restaurantId);
    }

    /**
     * Compte le nombre de favoris d'un utilisateur
     */
    public long countUserFavorites(UUID userId) {
        return favoriteRepository.countByUserId(userId);
    }

    /**
     * Toggle favori - ajoute si pas présent, retire si présent
     */
    @Transactional
    public boolean toggleFavorite(UUID userId, UUID restaurantId) {
        if (favoriteRepository.existsByUserIdAndRestaurantId(userId, restaurantId)) {
            removeFavorite(userId, restaurantId);
            return false; // Retiré
        } else {
            addFavorite(userId, restaurantId);
            return true; // Ajouté
        }
    }
}