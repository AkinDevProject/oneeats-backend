package com.oneeats.order.domain;

import com.oneeats.common.domain.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.Objects;
import java.util.UUID;

/**
 * Item d'une commande
 */
@Entity
@Table(name = "order_items")
public class OrderItem extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
    
    @NotNull
    @Column(name = "menu_item_id", nullable = false)
    private UUID menuItemId;
    
    @NotNull
    @Column(name = "menu_item_name", nullable = false, length = 200)
    private String menuItemName;
    
    @NotNull
    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;
    
    @Min(1)
    @Column(name = "quantity", nullable = false)
    private Integer quantity;
    
    @Column(name = "special_notes", length = 200)
    private String specialNotes;
    
    // Constructeurs
    protected OrderItem() {
        // JPA constructor
    }
    
    public OrderItem(UUID menuItemId, String menuItemName, BigDecimal unitPrice, Integer quantity) {
        this.menuItemId = Objects.requireNonNull(menuItemId, "L'ID du menu item ne peut pas être null");
        this.menuItemName = Objects.requireNonNull(menuItemName, "Le nom du menu item ne peut pas être null");
        this.unitPrice = Objects.requireNonNull(unitPrice, "Le prix unitaire ne peut pas être null");
        this.quantity = Objects.requireNonNull(quantity, "La quantité ne peut pas être null");
        
        if (unitPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Le prix unitaire doit être positif");
        }
        if (quantity < 1) {
            throw new IllegalArgumentException("La quantité doit être au moins 1");
        }
    }
    
    // Méthodes métier
    
    /**
     * Calculer le sous-total (prix unitaire * quantité)
     */
    public BigDecimal getSubtotal() {
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }
    
    /**
     * Modifier la quantité
     */
    public void updateQuantity(Integer newQuantity) {
        if (newQuantity == null || newQuantity < 1) {
            throw new IllegalArgumentException("La quantité doit être au moins 1");
        }
        this.quantity = newQuantity;
    }
    
    /**
     * Ajouter une note spéciale
     */
    public void addSpecialNotes(String notes) {
        this.specialNotes = notes;
    }
    
    // Getters
    public Order getOrder() {
        return order;
    }
    
    public UUID getMenuItemId() {
        return menuItemId;
    }
    
    public String getMenuItemName() {
        return menuItemName;
    }
    
    public BigDecimal getUnitPrice() {
        return unitPrice;
    }
    
    public Integer getQuantity() {
        return quantity;
    }
    
    public String getSpecialNotes() {
        return specialNotes;
    }
    
    // Setters pour JPA et relations
    public void setOrder(Order order) {
        this.order = order;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof OrderItem)) return false;
        if (!super.equals(o)) return false;
        OrderItem orderItem = (OrderItem) o;
        return Objects.equals(menuItemId, orderItem.menuItemId) && 
               Objects.equals(order, orderItem.order);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), menuItemId, order);
    }
    
    @Override
    public String toString() {
        return String.format("OrderItem{id=%s, menuItemName='%s', quantity=%d, unitPrice=%s}", 
            getId(), menuItemName, quantity, unitPrice);
    }
}