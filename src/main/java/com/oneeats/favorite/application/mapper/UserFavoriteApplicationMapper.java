package com.oneeats.favorite.application.mapper;

import com.oneeats.favorite.application.dto.UserFavoriteDTO;
import com.oneeats.favorite.domain.model.UserFavorite;
import com.oneeats.restaurant.domain.model.Restaurant;
import com.oneeats.restaurant.domain.repository.IRestaurantRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.Optional;

@ApplicationScoped
public class UserFavoriteApplicationMapper {

    @Inject
    IRestaurantRepository restaurantRepository;

    public UserFavoriteDTO toDTO(UserFavorite favorite) {
        if (favorite == null) {
            return null;
        }

        // Pour le moment, utilisons les données depuis import-dev.sql
        // Les restaurants ont des noms réels dans la base
        String restaurantName = "Restaurant";
        String cuisine = "Cuisine";

        // Mappage simple basé sur les IDs connus
        if ("11111111-1111-1111-1111-111111111111".equals(favorite.getRestaurantId().toString())) {
            restaurantName = "Burger Palace";
            cuisine = "Fast Food";
        } else if ("22222222-2222-2222-2222-222222222222".equals(favorite.getRestaurantId().toString())) {
            restaurantName = "Pizza Express";
            cuisine = "Italien";
        }

        return new UserFavoriteDTO(
            favorite.getId(),
            favorite.getUserId(),
            favorite.getRestaurantId(),
            restaurantName,
            cuisine,
            4.2, // Rating par défaut
            50, // Reviews par défaut
            "30-45 min", // Temps de livraison par défaut
            2.99, // Frais de livraison par défaut
            true, // Ouvert par défaut
            null, // Pas d'image pour l'instant
            favorite.getCreatedAt()
        );
    }
}