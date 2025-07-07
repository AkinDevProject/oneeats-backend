package com.oneeats.domain.restaurant.api.interface_;

import com.oneeats.domain.restaurant.internal.entity.Restaurant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RestaurantRepository {
    Optional<Restaurant> findById(UUID id);
    List<Restaurant> findAll();
    void save(Restaurant restaurant);
    void deleteById(UUID id);
}

