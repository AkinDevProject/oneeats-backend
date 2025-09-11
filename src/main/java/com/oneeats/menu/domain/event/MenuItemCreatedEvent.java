package com.oneeats.menu.domain.event;

import com.oneeats.shared.domain.event.IDomainEvent;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Événement déclenché lors de la création d'un item de menu
 */
public class MenuItemCreatedEvent implements IDomainEvent {
    
    private final UUID menuItemId;
    private final UUID restaurantId;
    private final String name;
    private final BigDecimal price;
    private final String category;
    private final LocalDateTime occurredOn;
    
    public MenuItemCreatedEvent(UUID menuItemId, UUID restaurantId, String name, 
                               BigDecimal price, String category) {
        this.menuItemId = menuItemId;
        this.restaurantId = restaurantId;
        this.name = name;
        this.price = price;
        this.category = category;
        this.occurredOn = LocalDateTime.now();
    }
    
    @Override
    public LocalDateTime occurredOn() {
        return occurredOn;
    }
    
    // Getters
    public UUID getMenuItemId() { return menuItemId; }
    public UUID getRestaurantId() { return restaurantId; }
    public String getName() { return name; }
    public BigDecimal getPrice() { return price; }
    public String getCategory() { return category; }
    
    public String toString() {
        return "MenuItemCreatedEvent{" +
                "menuItemId=" + menuItemId +
                ", restaurantId=" + restaurantId +
                ", name='" + name + '\'' +
                ", price=" + price +
                ", category='" + category + '\'' +
                ", occurredOn=" + occurredOn +
                '}';
    }
}