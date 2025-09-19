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

        // Récupérer les vraies données du restaurant depuis la base de données
        Optional<Restaurant> restaurantOpt = restaurantRepository.findById(favorite.getRestaurantId());

        if (restaurantOpt.isPresent()) {
            Restaurant restaurant = restaurantOpt.get();

            return new UserFavoriteDTO(
                favorite.getId(),
                favorite.getUserId(),
                favorite.getRestaurantId(),
                restaurant.getName(),
                restaurant.getCuisineType().toString(),
                restaurant.getRating(),
                50, // Reviews par défaut (TODO: ajouter le système de reviews)
                "30-45 min", // Temps de livraison par défaut (TODO: calculer selon la distance)
                2.99, // Frais de livraison par défaut (TODO: calculer selon la distance)
                restaurant.canAcceptOrders(),
                restaurant.getImageUrl(),
                favorite.getCreatedAt()
            );
        } else {
            // Fallback si le restaurant n'existe plus
            return new UserFavoriteDTO(
                favorite.getId(),
                favorite.getUserId(),
                favorite.getRestaurantId(),
                "Restaurant supprimé",
                "Non disponible",
                0.0,
                0,
                "Non disponible",
                0.0,
                false,
                null,
                favorite.getCreatedAt()
            );
        }
    }
}