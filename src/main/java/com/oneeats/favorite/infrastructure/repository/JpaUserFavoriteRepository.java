package com.oneeats.favorite.infrastructure.repository;

import com.oneeats.favorite.domain.model.UserFavorite;
import com.oneeats.favorite.domain.repository.IUserFavoriteRepository;
import com.oneeats.favorite.infrastructure.entity.UserFavoriteEntity;
import com.oneeats.favorite.infrastructure.mapper.UserFavoriteInfrastructureMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
public class JpaUserFavoriteRepository implements IUserFavoriteRepository {

    @Inject
    UserFavoriteInfrastructureMapper mapper;

    @Override
    @Transactional
    public UserFavorite save(UserFavorite favorite) {
        UserFavoriteEntity entity = mapper.toEntity(favorite);
        entity.persistAndFlush();
        return mapper.toDomain(entity);
    }

    @Override
    public Optional<UserFavorite> findById(UUID id) {
        return UserFavoriteEntity.<UserFavoriteEntity>findByIdOptional(id)
                .map(mapper::toDomain);
    }

    @Override
    public List<UserFavorite> findByUserId(UUID userId) {
        return UserFavoriteEntity.findByUserId(userId)
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<UserFavorite> findByUserIdAndRestaurantId(UUID userId, UUID restaurantId) {
        UserFavoriteEntity entity = UserFavoriteEntity.findByUserAndRestaurant(userId, restaurantId);
        return Optional.ofNullable(entity).map(mapper::toDomain);
    }

    @Override
    public boolean existsByUserIdAndRestaurantId(UUID userId, UUID restaurantId) {
        return UserFavoriteEntity.existsByUserAndRestaurant(userId, restaurantId);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        UserFavoriteEntity.deleteById(id);
    }

    @Override
    @Transactional
    public void deleteByUserIdAndRestaurantId(UUID userId, UUID restaurantId) {
        UserFavoriteEntity.deleteByUserAndRestaurant(userId, restaurantId);
    }

    @Override
    public long countByUserId(UUID userId) {
        return UserFavoriteEntity.countByUserId(userId);
    }

    @Override
    @Transactional
    public void deleteAllByUserId(UUID userId) {
        UserFavoriteEntity.deleteAllByUserId(userId);
    }
}