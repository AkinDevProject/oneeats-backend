package com.oneeats.restaurant.application.command;

import com.oneeats.restaurant.application.dto.RestaurantDTO;
import com.oneeats.restaurant.application.mapper.RestaurantApplicationMapper;
import com.oneeats.restaurant.domain.model.Restaurant;
import com.oneeats.restaurant.domain.repository.IRestaurantRepository;
import com.oneeats.shared.infrastructure.service.FileStorageService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class DeleteRestaurantImageCommandHandler {

    @Inject
    IRestaurantRepository restaurantRepository;

    @Inject
    FileStorageService fileStorageService;

    @Inject
    RestaurantApplicationMapper mapper;

    @Transactional
    public RestaurantDTO handle(DeleteRestaurantImageCommand command) {
        // Find restaurant
        Restaurant restaurant = restaurantRepository.findById(command.restaurantId())
            .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        // Delete old image if exists and it's a local file (not external URL)
        if (restaurant.getImageUrl() != null && 
            !restaurant.getImageUrl().startsWith("http://") && 
            !restaurant.getImageUrl().startsWith("https://")) {
            fileStorageService.deleteFile(restaurant.getImageUrl());
        }

        // Remove image URL from restaurant
        restaurant.setImageUrl(null);
        Restaurant savedRestaurant = restaurantRepository.save(restaurant);

        return mapper.toDTO(savedRestaurant);
    }
}