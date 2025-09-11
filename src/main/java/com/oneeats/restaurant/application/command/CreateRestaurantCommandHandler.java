package com.oneeats.restaurant.application.command;

import com.oneeats.restaurant.application.dto.RestaurantDTO;
import com.oneeats.restaurant.application.mapper.RestaurantApplicationMapper;
import com.oneeats.restaurant.domain.model.Restaurant;
import com.oneeats.restaurant.domain.repository.IRestaurantRepository;
import com.oneeats.restaurant.domain.service.RestaurantDomainService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class CreateRestaurantCommandHandler {

    @Inject
    IRestaurantRepository restaurantRepository;

    @Inject
    RestaurantDomainService restaurantDomainService;

    @Inject
    RestaurantApplicationMapper mapper;

    @Transactional
    public RestaurantDTO handle(CreateRestaurantCommand command) {
        restaurantDomainService.validateRestaurantCreation(
            command.name(), 
            command.email(), 
            command.cuisineType()
        );

        Restaurant restaurant = Restaurant.create(
            command.name(),
            command.description(),
            command.address(),
            command.phone(),
            command.email(),
            command.cuisineType()
        );

        Restaurant savedRestaurant = restaurantRepository.save(restaurant);
        return mapper.toDTO(savedRestaurant);
    }
}