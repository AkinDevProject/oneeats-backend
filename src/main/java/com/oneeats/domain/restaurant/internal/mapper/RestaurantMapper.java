package com.oneeats.domain.restaurant.internal.mapper;

import com.oneeats.domain.restaurant.internal.entity.Restaurant;
import com.oneeats.domain.restaurant.api.model.RestaurantDto;

public class RestaurantMapper {
    public static RestaurantDto toDto(Restaurant restaurant) {
        if (restaurant == null) return null;
        RestaurantDto dto = new RestaurantDto();
        dto.setId(restaurant.getId());
        dto.setNom(restaurant.getNom());
        dto.setDescription(restaurant.getDescription());
        dto.setAdresse(restaurant.getAdresse());
        dto.setTelephone(restaurant.getTelephone());
        dto.setEmail(restaurant.getEmail());
        dto.setStatutValidation(restaurant.getStatutValidation());
        dto.setProprietaireId(restaurant.getProprietaire() != null ? restaurant.getProprietaire().getId() : null);
        return dto;
    }
}

