package com.oneeats.menu.infrastructure.persistence.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entité JPA pour MenuItemChoice - Couche infrastructure
 */
@Entity
@Table(name = "menu_item_choice")
public class MenuItemChoiceEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_option_id", nullable = false)
    private MenuItemOptionEntity option;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "additional_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal additionalPrice = BigDecimal.ZERO;
    
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;
    
    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable = true;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @Version
    @Column(name = "version")
    private Integer version;
    
    // Constructeurs
    public MenuItemChoiceEntity() {}
    
    public MenuItemChoiceEntity(MenuItemOptionEntity option, String name, String description,
                               BigDecimal additionalPrice, Integer displayOrder) {
        this.option = option;
        this.name = name;
        this.description = description;
        this.additionalPrice = additionalPrice != null ? additionalPrice : BigDecimal.ZERO;
        this.displayOrder = displayOrder;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Méthodes de lifecycle JPA
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Getters et Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    
    public MenuItemOptionEntity getOption() { return option; }
    public void setOption(MenuItemOptionEntity option) { this.option = option; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public BigDecimal getAdditionalPrice() { return additionalPrice; }
    public void setAdditionalPrice(BigDecimal additionalPrice) { this.additionalPrice = additionalPrice; }
    
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    
    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }
}