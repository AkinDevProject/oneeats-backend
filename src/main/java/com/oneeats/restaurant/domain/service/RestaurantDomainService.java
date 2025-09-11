package com.oneeats.restaurant.domain.service;

import com.oneeats.shared.domain.exception.ValidationException;
import com.oneeats.restaurant.domain.repository.IRestaurantRepository;
import com.oneeats.shared.domain.vo.Email;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class RestaurantDomainService {

    @Inject
    IRestaurantRepository restaurantRepository;

    public void validateRestaurantCreation(String name, String email, String cuisineType) {
        if (name == null || name.trim().isEmpty()) {
            throw new ValidationException("Restaurant name cannot be empty");
        }

        if (cuisineType == null || cuisineType.trim().isEmpty()) {
            throw new ValidationException("Cuisine type cannot be empty");
        }

        Email emailVO = new Email(email);
        if (restaurantRepository.existsByEmail(emailVO)) {
            throw new ValidationException("Restaurant with this email already exists");
        }
    }
}
