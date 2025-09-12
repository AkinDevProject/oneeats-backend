package com.oneeats.restaurant.application.command;

import com.oneeats.restaurant.application.dto.RestaurantDTO;
import com.oneeats.restaurant.application.mapper.RestaurantApplicationMapper;
import com.oneeats.restaurant.domain.model.Restaurant;
import com.oneeats.restaurant.domain.repository.IRestaurantRepository;
import com.oneeats.shared.infrastructure.service.FileStorageService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.io.IOException;

@ApplicationScoped
public class UploadRestaurantImageCommandHandler {

    @Inject
    IRestaurantRepository restaurantRepository;

    @Inject
    FileStorageService fileStorageService;

    @Inject
    RestaurantApplicationMapper mapper;

    @Transactional
    public RestaurantDTO handle(UploadRestaurantImageCommand command) {
        // Find restaurant
        Restaurant restaurant = restaurantRepository.findById(command.restaurantId())
            .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        try {
            // Delete old image if exists and it's a local file (not external URL)
            if (restaurant.getImageUrl() != null && 
                !restaurant.getImageUrl().startsWith("http://") && 
                !restaurant.getImageUrl().startsWith("https://")) {
                fileStorageService.deleteFile(restaurant.getImageUrl());
            }

            // Save new image
            String imageUrl = fileStorageService.saveRestaurantImage(
                command.inputStream(),
                command.filename(),
                command.fileSize()
            );

            // Update restaurant
            restaurant.setImageUrl(imageUrl);
            Restaurant savedRestaurant = restaurantRepository.save(restaurant);

            return mapper.toDTO(savedRestaurant);

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image: " + e.getMessage(), e);
        }
    }
}