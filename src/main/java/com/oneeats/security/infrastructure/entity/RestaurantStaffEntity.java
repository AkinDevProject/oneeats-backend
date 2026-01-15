package com.oneeats.security.infrastructure.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entite JPA pour la table restaurant_staff.
 * Gere les permissions des utilisateurs par restaurant.
 * Un utilisateur peut avoir differents roles dans differents restaurants.
 */
@Entity
@Table(name = "restaurant_staff", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "restaurant_id"})
})
public class RestaurantStaffEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "restaurant_id", nullable = false)
    private UUID restaurantId;

    @Enumerated(EnumType.STRING)
    @Column(name = "staff_role", nullable = false)
    private StaffRole staffRole;

    @Column(name = "permissions", columnDefinition = "jsonb")
    private String permissions;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public RestaurantStaffEntity() {
        this.createdAt = LocalDateTime.now();
    }

    public RestaurantStaffEntity(UUID userId, UUID restaurantId, StaffRole staffRole) {
        this.userId = userId;
        this.restaurantId = restaurantId;
        this.staffRole = staffRole;
        this.createdAt = LocalDateTime.now();
        this.permissions = getDefaultPermissionsForRole(staffRole);
    }

    /**
     * Roles possibles pour un membre du staff d'un restaurant
     */
    public enum StaffRole {
        OWNER,      // Proprietaire - tous les droits
        MANAGER,    // Manager - gestion quotidienne
        STAFF       // Employe - droits limites
    }

    /**
     * Retourne les permissions par defaut pour un role donne
     */
    private String getDefaultPermissionsForRole(StaffRole role) {
        return switch (role) {
            case OWNER -> """
                {
                    "view_orders": true,
                    "update_orders": true,
                    "view_menu": true,
                    "update_menu": true,
                    "view_stats": true,
                    "manage_staff": true,
                    "manage_settings": true,
                    "delete_restaurant": true
                }
                """;
            case MANAGER -> """
                {
                    "view_orders": true,
                    "update_orders": true,
                    "view_menu": true,
                    "update_menu": true,
                    "view_stats": true,
                    "manage_staff": false,
                    "manage_settings": false,
                    "delete_restaurant": false
                }
                """;
            case STAFF -> """
                {
                    "view_orders": true,
                    "update_orders": true,
                    "view_menu": true,
                    "update_menu": false,
                    "view_stats": false,
                    "manage_staff": false,
                    "manage_settings": false,
                    "delete_restaurant": false
                }
                """;
        };
    }

    // Getters et Setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public UUID getRestaurantId() {
        return restaurantId;
    }

    public void setRestaurantId(UUID restaurantId) {
        this.restaurantId = restaurantId;
    }

    public StaffRole getStaffRole() {
        return staffRole;
    }

    public void setStaffRole(StaffRole staffRole) {
        this.staffRole = staffRole;
    }

    public String getPermissions() {
        return permissions;
    }

    public void setPermissions(String permissions) {
        this.permissions = permissions;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
