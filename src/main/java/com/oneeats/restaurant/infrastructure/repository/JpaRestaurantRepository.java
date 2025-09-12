package com.oneeats.restaurant.infrastructure.repository;

import com.oneeats.restaurant.domain.model.Restaurant;
import com.oneeats.restaurant.domain.model.RestaurantStatus;
import com.oneeats.restaurant.domain.repository.IRestaurantRepository;
import com.oneeats.restaurant.infrastructure.entity.RestaurantEntity;
import com.oneeats.restaurant.infrastructure.mapper.RestaurantInfrastructureMapper;
import com.oneeats.shared.domain.vo.Email;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
public class JpaRestaurantRepository implements IRestaurantRepository {

    @Inject
    RestaurantInfrastructureMapper mapper;

    @Override
    public Optional<Restaurant> findById(UUID id) {
        return RestaurantEntity.find("id", id)
                .firstResultOptional()
                .map(entity -> mapper.toDomain((RestaurantEntity) entity));
    }

    @Override
    public Optional<Restaurant> findByEmail(Email email) {
        return RestaurantEntity.find("email", email.getValue())
                .firstResultOptional()
                .map(entity -> mapper.toDomain((RestaurantEntity) entity));
    }

    @Override
    public List<Restaurant> findAll() {
        return RestaurantEntity.<RestaurantEntity>listAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Restaurant> findByStatus(RestaurantStatus status) {
        return RestaurantEntity.<RestaurantEntity>find("status", status).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Restaurant> findByCuisineType(String cuisineType) {
        return RestaurantEntity.<RestaurantEntity>find("cuisineType", cuisineType).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Restaurant save(Restaurant restaurant) {
        // Vérifier si l'entité existe déjà
        Optional<RestaurantEntity> existingEntity = RestaurantEntity.findByIdOptional(restaurant.getId());
        
        RestaurantEntity entity;
        if (existingEntity.isPresent()) {
            // Mettre à jour l'entité existante
            entity = existingEntity.get();
            // Mapper les champs du domaine vers l'entité existante
            entity.setName(restaurant.getName());
            entity.setDescription(restaurant.getDescription());
            entity.setAddress(restaurant.getAddress());
            entity.setPhone(restaurant.getPhone());
            entity.setEmail(restaurant.getEmail().getValue());
            entity.setCuisineType(restaurant.getCuisineType());
            entity.setRating(restaurant.getRating());
            entity.setImageUrl(restaurant.getImageUrl());
            // Mapper le statut vers les boolean flags
            boolean isOpen = restaurant.getStatus() == RestaurantStatus.OPEN;
            boolean isActive = restaurant.getStatus() == RestaurantStatus.ACTIVE || restaurant.getStatus() == RestaurantStatus.OPEN;
            entity.setIsOpen(isOpen);
            entity.setIsActive(isActive);
            entity.flush();
        } else {
            // Créer une nouvelle entité
            entity = mapper.toEntity(restaurant);
            entity.persistAndFlush();
        }
        
        return mapper.toDomain(entity);
    }

    @Override
    public void delete(Restaurant restaurant) {
        RestaurantEntity.deleteById(restaurant.getId());
    }

    @Override
    public boolean existsByEmail(Email email) {
        return RestaurantEntity.count("email", email.getValue()) > 0;
    }
}