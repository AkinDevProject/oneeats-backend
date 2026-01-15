package com.oneeats.security.infrastructure.repository;

import com.oneeats.security.infrastructure.entity.RestaurantStaffEntity;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository pour la gestion des membres du staff des restaurants.
 * Permet de recuperer les permissions d'un utilisateur pour un ou plusieurs restaurants.
 */
@ApplicationScoped
public class JpaRestaurantStaffRepository implements PanacheRepositoryBase<RestaurantStaffEntity, UUID> {

    /**
     * Trouve tous les restaurants geres par un utilisateur
     */
    public List<RestaurantStaffEntity> findByUserId(UUID userId) {
        return find("userId", userId).list();
    }

    /**
     * Trouve le role d'un utilisateur pour un restaurant specifique
     */
    public Optional<RestaurantStaffEntity> findByUserIdAndRestaurantId(UUID userId, UUID restaurantId) {
        return find("userId = ?1 and restaurantId = ?2", userId, restaurantId).firstResultOptional();
    }

    /**
     * Trouve tous les membres du staff d'un restaurant
     */
    public List<RestaurantStaffEntity> findByRestaurantId(UUID restaurantId) {
        return find("restaurantId", restaurantId).list();
    }

    /**
     * Verifie si un utilisateur a acces a un restaurant
     */
    public boolean hasAccessToRestaurant(UUID userId, UUID restaurantId) {
        return count("userId = ?1 and restaurantId = ?2", userId, restaurantId) > 0;
    }

    /**
     * Trouve tous les owners d'un restaurant
     */
    public List<RestaurantStaffEntity> findOwnersByRestaurantId(UUID restaurantId) {
        return find("restaurantId = ?1 and staffRole = ?2",
            restaurantId, RestaurantStaffEntity.StaffRole.OWNER).list();
    }

    /**
     * Supprime toutes les affiliations d'un utilisateur
     */
    public long deleteByUserId(UUID userId) {
        return delete("userId", userId);
    }

    /**
     * Supprime toutes les affiliations d'un restaurant
     */
    public long deleteByRestaurantId(UUID restaurantId) {
        return delete("restaurantId", restaurantId);
    }
}
