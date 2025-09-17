package com.oneeats.order.domain.model;

import com.oneeats.shared.domain.entity.BaseEntity;
import com.oneeats.shared.domain.vo.Money;
import com.oneeats.order.domain.event.OrderCreatedEvent;
import com.oneeats.order.domain.event.OrderStatusChangedEvent;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

public class Order extends BaseEntity {
    
    private String orderNumber;
    private UUID userId;
    private UUID restaurantId;
    private OrderStatus status;
    private Money totalAmount;
    private String specialInstructions;
    private LocalDateTime estimatedPickupTime;
    private LocalDateTime actualPickupTime;
    private List<OrderItem> items = new ArrayList<>();
    
    // Constructeurs
    protected Order() {
        // JPA constructor
    }
    
    public Order(UUID id, String orderNumber, UUID userId, UUID restaurantId, Money totalAmount, String specialInstructions, OrderStatus status) {
        super(id);
        this.orderNumber = orderNumber;
        this.userId = userId;
        this.restaurantId = restaurantId;
        this.totalAmount = totalAmount;
        this.specialInstructions = specialInstructions;
        this.status = status;
    }

    public static Order create(String orderNumber, UUID userId, UUID restaurantId, Money totalAmount, String specialInstructions) {
        Order order = new Order(
            UUID.randomUUID(),
            orderNumber,
            userId,
            restaurantId,
            totalAmount,
            specialInstructions,
            OrderStatus.PENDING
        );
        
        order.addDomainEvent(new OrderCreatedEvent(
            order.getId(),
            order.getOrderNumber(),
            order.getUserId(),
            order.getRestaurantId()
        ));
        
        return order;
    }
    
    // Méthodes métier
    
    /**
     * Changer le statut de la commande avec validation des transitions
     */
    public void changeStatus(OrderStatus newStatus) {
        OrderStatus previousStatus = this.status;
        this.status = newStatus;
        
        switch (newStatus) {
            case READY -> {
                if (this.estimatedPickupTime == null) {
                    this.estimatedPickupTime = LocalDateTime.now().plusMinutes(5);
                }
            }
            case COMPLETED -> this.actualPickupTime = LocalDateTime.now();
        }

        this.markAsModified();
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
        BigDecimal total = items.stream()
            .map(item -> item.getSubtotal().getAmount())
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        this.totalAmount = new Money(total, this.totalAmount.getCurrency());
        this.markAsModified();
    }
    
    /**
     * Vérifie si la commande peut être annulée
     */
    public boolean canBeCancelled() {
        return this.status == OrderStatus.PENDING || this.status == OrderStatus.CONFIRMED;
    }
    
    public void cancel() {
        if (!canBeCancelled()) {
            throw new IllegalStateException("Order cannot be cancelled in current state");
        }
        changeStatus(OrderStatus.CANCELLED);
    }
    
    /**
     * Vérifie si la commande est en cours (ni annulée, ni récupérée)
     */
    public boolean isActive() {
        return this.status != OrderStatus.COMPLETED && this.status != OrderStatus.CANCELLED;
    }
    
    /**
     * Calculer le temps écoulé depuis la création
     */
    public long getMinutesSinceCreation() {
        return java.time.Duration.between(getCreatedAt(), LocalDateTime.now()).toMinutes();
    }
    
    // Getters
    public String getOrderNumber() {
        return orderNumber;
    }
    
    public UUID getUserId() {
        return userId;
    }
    
    public UUID getRestaurantId() {
        return restaurantId;
    }
    
    public OrderStatus getStatus() {
        return status;
    }
    
    public Money getTotalAmount() {
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
    
    public void setStatus(OrderStatus status) {
        this.status = status;
    }
    
    // Méthodes métier
    
    /**
     * Mettre à jour le statut de la commande avec validation métier
     */
    public void updateStatus(OrderStatus newStatus) {
        OrderStatus oldStatus = this.status;
        
        // Validation des transitions de statut
        if (!isValidStatusTransition(oldStatus, newStatus)) {
            throw new IllegalStateException(
                "Invalid status transition from " + oldStatus + " to " + newStatus);
        }
        
        this.status = newStatus;
        
        // Publier un événement de changement de statut
        addDomainEvent(new OrderStatusChangedEvent(this.getId(), this.userId, this.restaurantId, oldStatus, newStatus));
        
        // Actions spécifiques selon le nouveau statut
        if (newStatus == OrderStatus.COMPLETED) {
            this.actualPickupTime = LocalDateTime.now();
        }
    }
    
    /**
     * Vérifier si la transition de statut est valide
     */
    private boolean isValidStatusTransition(OrderStatus from, OrderStatus to) {
        if (from == null || to == null) {
            return false;
        }
        
        // Utiliser la logique de validation définie dans l'enum OrderStatus
        return from.canTransitionTo(to);
    }
}