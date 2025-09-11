package com.oneeats.order.infrastructure.entity;

import com.oneeats.order.domain.model.OrderStatus;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")
public class OrderEntity extends PanacheEntityBase {

    @Id
    private UUID id;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")  
    private LocalDateTime updatedAt;
    
    @Version
    @Column(name = "version")
    private Integer version;

    @Column(name = "order_number", nullable = false, unique = true)
    private String orderNumber;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "restaurant_id", nullable = false)
    private UUID restaurantId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OrderStatus status;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "special_instructions", length = 500)
    private String specialInstructions;

    @Column(name = "estimated_pickup_time")
    private LocalDateTime estimatedPickupTime;

    @Column(name = "actual_pickup_time")
    private LocalDateTime actualPickupTime;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<OrderItemEntity> items = new ArrayList<>();

    public OrderEntity() {}

    public OrderEntity(UUID id, String orderNumber, UUID userId, UUID restaurantId, OrderStatus status,
                      BigDecimal totalAmount, String specialInstructions, LocalDateTime estimatedPickupTime,
                      LocalDateTime actualPickupTime, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.orderNumber = orderNumber;
        this.userId = userId;
        this.restaurantId = restaurantId;
        this.status = status;
        this.totalAmount = totalAmount;
        this.specialInstructions = specialInstructions;
        this.estimatedPickupTime = estimatedPickupTime;
        this.actualPickupTime = actualPickupTime;
    }

    // Getters and Setters
    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
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

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getSpecialInstructions() {
        return specialInstructions;
    }

    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }

    public LocalDateTime getEstimatedPickupTime() {
        return estimatedPickupTime;
    }

    public void setEstimatedPickupTime(LocalDateTime estimatedPickupTime) {
        this.estimatedPickupTime = estimatedPickupTime;
    }

    public LocalDateTime getActualPickupTime() {
        return actualPickupTime;
    }

    public void setActualPickupTime(LocalDateTime actualPickupTime) {
        this.actualPickupTime = actualPickupTime;
    }

    public List<OrderItemEntity> getItems() {
        return items;
    }

    public void setItems(List<OrderItemEntity> items) {
        this.items = items;
    }
    
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
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
    
    public Integer getVersion() {
        return version;
    }
    
    public void setVersion(Integer version) {
        this.version = version;
    }
}