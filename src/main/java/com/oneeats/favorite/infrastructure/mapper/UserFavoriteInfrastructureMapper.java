package com.oneeats.favorite.infrastructure.mapper;

import com.oneeats.favorite.domain.model.UserFavorite;
import com.oneeats.favorite.infrastructure.entity.UserFavoriteEntity;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class UserFavoriteInfrastructureMapper {

    public UserFavoriteEntity toEntity(UserFavorite favorite) {
        if (favorite == null) {
            return null;
        }

        UserFavoriteEntity entity = new UserFavoriteEntity();
        entity.id = favorite.getId();
        entity.userId = favorite.getUserId();
        entity.restaurantId = favorite.getRestaurantId();
        entity.createdAt = favorite.getCreatedAt();

        return entity;
    }

    public UserFavorite toDomain(UserFavoriteEntity entity) {
        if (entity == null) {
            return null;
        }

        return UserFavorite.fromPersistence(
            entity.id,
            entity.userId,
            entity.restaurantId,
            entity.createdAt
        );
    }
}