package com.oneeats.domain.restaurant.internal.client;

import com.oneeats.domain.restaurant.api.interface_.RestaurantRepository;
import com.oneeats.domain.restaurant.internal.entity.Restaurant;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@ApplicationScoped
public class InMemoryRestaurantRepository implements RestaurantRepository {
    private final Map<UUID, Restaurant> store = new ConcurrentHashMap<>();

    @Override
    public Optional<Restaurant> findById(UUID id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public List<Restaurant> findAll() {
        return new ArrayList<>(store.values());
    }

    @Override
    public void save(Restaurant restaurant) {
        store.put(restaurant.getId(), restaurant);
    }

    @Override
    public void deleteById(UUID id) {
        store.remove(id);
    }
}

