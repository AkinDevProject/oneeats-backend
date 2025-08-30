package com.oneeats.order.domain;

import com.oneeats.common.domain.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * Entité commande avec logique métier intégrée
 */
@Entity
@Table(name = "orders")
public class Order extends BaseEntity {
    
    @NotNull
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    
    @NotNull
    @Column(name = "restaurant_id", nullable = false)
    private UUID restaurantId;
    
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OrderStatus status;
    
    @NotNull
    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;
    
    @Size(max = 500)
    @Column(name = "special_instructions", length = 500)
    private String specialInstructions;
    
    @Column(name = "estimated_pickup_time")
    private LocalDateTime estimatedPickupTime;
    
    @Column(name = "actual_pickup_time")
    private LocalDateTime actualPickupTime;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();
    
    // Constructeurs
    protected Order() {
        // JPA constructor
    }
    
    public Order(UUID userId, UUID restaurantId, BigDecimal totalAmount, String specialInstructions) {
        this.userId = Objects.requireNonNull(userId, "L'ID utilisateur ne peut pas être null");
        this.restaurantId = Objects.requireNonNull(restaurantId, "L'ID restaurant ne peut pas être null");
        this.totalAmount = Objects.requireNonNull(totalAmount, "Le montant total ne peut pas être null");
        this.specialInstructions = specialInstructions;
        this.status = OrderStatus.EN_ATTENTE;
        
        if (totalAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Le montant total doit être positif");
        }
    }
    
    // Méthodes métier
    
    /**
     * Changer le statut de la commande avec validation des transitions
     */
    public void changeStatus(OrderStatus newStatus) {
        if (!this.status.canTransitionTo(newStatus)) {
            throw new OrderStatus.InvalidTransitionException(this.status, newStatus);
        }
        
        this.status = newStatus;
        
        // Logique métier selon le nouveau statut
        switch (newStatus) {
            case PRETE -> {
                if (this.estimatedPickupTime == null) {
                    this.estimatedPickupTime = LocalDateTime.now().plusMinutes(5);
                }
            }
            case RECUPEREE -> this.actualPickupTime = LocalDateTime.now();
        }
    }
    
    /**
     * Ajouter un item à la commande
     */
    public void addItem(OrderItem item) {
        Objects.requireNonNull(item, "L'item ne peut pas être null");
        item.setOrder(this);
        this.items.add(item);
        recalculateTotal();
    }
    
    /**
     * Supprimer un item de la commande
     */
    public void removeItem(OrderItem item) {
        if (this.items.remove(item)) {
            item.setOrder(null);
            recalculateTotal();
        }
    }
    
    /**
     * Recalculer le montant total
     */
    private void recalculateTotal() {
        this.totalAmount = items.stream()
            .map(OrderItem::getSubtotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    /**
     * Vérifie si la commande peut être annulée
     */
    public boolean canBeCancelled() {
        return this.status.canBeCancelled();
    }
    
    /**
     * Annuler la commande
     */
    public void cancel() {
        if (!canBeCancelled()) {
            throw new IllegalStateException("Cette commande ne peut pas être annulée dans son état actuel");
        }
        changeStatus(OrderStatus.ANNULEE);
    }
    
    /**
     * Vérifie si la commande est en cours (ni annulée, ni récupérée)
     */
    public boolean isActive() {
        return !this.status.isFinal();
    }
    
    /**
     * Calculer le temps écoulé depuis la création
     */
    public long getMinutesSinceCreation() {
        return java.time.Duration.between(getCreatedAt(), LocalDateTime.now()).toMinutes();
    }
    
    // Getters
    public UUID getUserId() {
        return userId;
    }
    
    public UUID getRestaurantId() {
        return restaurantId;
    }
    
    public OrderStatus getStatus() {
        return status;
    }
    
    public BigDecimal getTotalAmount() {
        return totalAmount;
    }
    
    public String getSpecialInstructions() {
        return specialInstructions;
    }
    
    public LocalDateTime getEstimatedPickupTime() {
        return estimatedPickupTime;
    }
    
    public LocalDateTime getActualPickupTime() {
        return actualPickupTime;
    }
    
    public List<OrderItem> getItems() {
        return List.copyOf(items); // Immutable view
    }
    
    // Setters pour JPA
    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }
    
    public void setEstimatedPickupTime(LocalDateTime estimatedPickupTime) {
        this.estimatedPickupTime = estimatedPickupTime;
    }
}