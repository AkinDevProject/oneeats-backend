package com.oneeats.restaurant.application.query;

import com.oneeats.restaurant.application.dto.RestaurantDTO;
import com.oneeats.restaurant.application.mapper.RestaurantApplicationMapper;
import com.oneeats.restaurant.domain.model.Restaurant;
import com.oneeats.restaurant.domain.model.RestaurantStatus;
import com.oneeats.restaurant.domain.repository.IRestaurantRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class GetActiveRestaurantsQueryHandler {

    @Inject
    IRestaurantRepository restaurantRepository;

    @Inject
    RestaurantApplicationMapper mapper;

    public List<RestaurantDTO> handle(GetActiveRestaurantsQuery query) {
        List<Restaurant> restaurants = restaurantRepository.findByStatusAndIsActive(RestaurantStatus.APPROVED, true);

        return restaurants.stream()
            .map(mapper::toDTO)
            .collect(Collectors.toList());
    }
}