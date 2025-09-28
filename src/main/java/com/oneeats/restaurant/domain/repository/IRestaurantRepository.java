package com.oneeats.restaurant.domain.repository;

import com.oneeats.restaurant.domain.model.Restaurant;
import com.oneeats.restaurant.domain.model.RestaurantStatus;
import com.oneeats.shared.domain.vo.Email;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IRestaurantRepository {
    
    Optional<Restaurant> findById(UUID id);
    
    Optional<Restaurant> findByEmail(Email email);
    
    List<Restaurant> findAll();
    
    List<Restaurant> findByStatus(RestaurantStatus status);
    
    List<Restaurant> findByCuisineType(String cuisineType);

    List<Restaurant> findByStatusAndIsActive(RestaurantStatus status, boolean isActive);

    Optional<Restaurant> findByOwnerId(UUID ownerId);

    Restaurant save(Restaurant restaurant);

    void delete(Restaurant restaurant);

    boolean existsByEmail(Email email);
}