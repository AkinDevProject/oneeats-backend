package com.oneeats.order.domain.model;

import com.oneeats.shared.domain.entity.BaseEntity;
import com.oneeats.shared.domain.vo.Money;

import java.math.BigDecimal;
import java.util.Objects;
import java.util.UUID;

public class OrderItem extends BaseEntity {
    
    private Order order;
    private UUID menuItemId;
    private String menuItemName;
    private Money unitPrice;
    private Integer quantity;
    private String specialNotes;
    
    // Constructeurs
    protected OrderItem() {
        // JPA constructor
    }
    
    public OrderItem(UUID id, UUID menuItemId, String menuItemName, Money unitPrice, Integer quantity, String specialNotes) {
        super(id);
        this.menuItemId = menuItemId;
        this.menuItemName = menuItemName;
        this.unitPrice = unitPrice;
        this.quantity = quantity;
        this.specialNotes = specialNotes;
    }

    public static OrderItem create(UUID menuItemId, String menuItemName, Money unitPrice, Integer quantity, String specialNotes) {
        if (quantity < 1) {
            throw new IllegalArgumentException("Quantity must be at least 1");
        }
        
        return new OrderItem(
            UUID.randomUUID(),
            menuItemId,
            menuItemName,
            unitPrice,
            quantity,
            specialNotes
        );
    }
    
    // Méthodes métier
    
    /**
     * Calculer le sous-total (prix unitaire * quantité)
     */
    public Money getSubtotal() {
        BigDecimal subtotalAmount = unitPrice.getAmount().multiply(BigDecimal.valueOf(quantity));
        return new Money(subtotalAmount, unitPrice.getCurrency());
    }
    
    /**
     * Modifier la quantité
     */
    public void updateQuantity(Integer newQuantity) {
        if (newQuantity == null || newQuantity < 1) {
            throw new IllegalArgumentException("Quantity must be at least 1");
        }
        this.quantity = newQuantity;
        this.markAsModified();
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
    
    public Money getUnitPrice() {
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