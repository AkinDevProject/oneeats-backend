package com.oneeats.restaurant.application.query;

import com.oneeats.restaurant.application.dto.RestaurantDTO;
import com.oneeats.restaurant.application.mapper.RestaurantApplicationMapper;
import com.oneeats.restaurant.domain.repository.IRestaurantRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class GetAllRestaurantsQueryHandler {
    
    @Inject
    IRestaurantRepository restaurantRepository;
    
    @Inject
    RestaurantApplicationMapper mapper;
    
    public List<RestaurantDTO> handle(GetAllRestaurantsQuery query) {
        return restaurantRepository.findAll().stream()
            .map(mapper::toDTO)
            .collect(Collectors.toList());
    }
}