package com.oneeats.menu.infrastructure.persistence.entity;

import com.oneeats.menu.domain.model.MenuItemOptionType;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

/**
 * Entité JPA pour MenuItemOption - Couche infrastructure
 */
@Entity
@Table(name = "menu_item_option")
public class MenuItemOptionEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItemEntity menuItem;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "option_type", nullable = false)
    private MenuItemOptionType type;
    
    @Column(name = "is_required", nullable = false)
    private Boolean isRequired = false;
    
    @Column(name = "max_choices")
    private Integer maxChoices;
    
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;
    
    @OneToMany(mappedBy = "option", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private Set<MenuItemChoiceEntity> choices = new LinkedHashSet<>();
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @Version
    @Column(name = "version")
    private Integer version;
    
    // Constructeurs
    public MenuItemOptionEntity() {}
    
    public MenuItemOptionEntity(MenuItemEntity menuItem, String name, String description,
                               MenuItemOptionType type, Boolean isRequired, Integer maxChoices, Integer displayOrder) {
        this.menuItem = menuItem;
        this.name = name;
        this.description = description;
        this.type = type;
        this.isRequired = isRequired;
        this.maxChoices = maxChoices;
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
    
    public MenuItemEntity getMenuItem() { return menuItem; }
    public void setMenuItem(MenuItemEntity menuItem) { this.menuItem = menuItem; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public MenuItemOptionType getType() { return type; }
    public void setType(MenuItemOptionType type) { this.type = type; }
    
    public Boolean getIsRequired() { return isRequired; }
    public void setIsRequired(Boolean isRequired) { this.isRequired = isRequired; }
    
    public Integer getMaxChoices() { return maxChoices; }
    public void setMaxChoices(Integer maxChoices) { this.maxChoices = maxChoices; }
    
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    
    public Set<MenuItemChoiceEntity> getChoices() { return choices; }
    public void setChoices(Set<MenuItemChoiceEntity> choices) { this.choices = choices; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }
}