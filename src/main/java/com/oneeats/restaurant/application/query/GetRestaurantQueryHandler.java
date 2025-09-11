package com.oneeats.restaurant.application.query;

import com.oneeats.restaurant.application.dto.RestaurantDTO;
import com.oneeats.restaurant.application.mapper.RestaurantApplicationMapper;
import com.oneeats.restaurant.domain.model.Restaurant;
import com.oneeats.restaurant.domain.repository.IRestaurantRepository;
import com.oneeats.shared.domain.exception.EntityNotFoundException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class GetRestaurantQueryHandler {
    
    @Inject
    IRestaurantRepository restaurantRepository;
    
    @Inject
    RestaurantApplicationMapper mapper;
    
    public RestaurantDTO handle(GetRestaurantQuery query) {
        Restaurant restaurant = restaurantRepository.findById(query.id())
            .orElseThrow(() -> new EntityNotFoundException("Restaurant", query.id()));
            
        return mapper.toDTO(restaurant);
    }
}