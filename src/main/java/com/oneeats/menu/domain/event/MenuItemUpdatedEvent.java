package com.oneeats.menu.domain.event;

import com.oneeats.shared.domain.event.IDomainEvent;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Événement déclenché lors de la mise à jour d'un item de menu
 */
public class MenuItemUpdatedEvent implements IDomainEvent {
    
    private final UUID menuItemId;
    private final UUID restaurantId;
    private final LocalDateTime occurredOn;
    
    public MenuItemUpdatedEvent(UUID menuItemId, UUID restaurantId) {
        this.menuItemId = menuItemId;
        this.restaurantId = restaurantId;
        this.occurredOn = LocalDateTime.now();
    }
    
    @Override
    public LocalDateTime occurredOn() {
        return occurredOn;
    }
    
    
    // Getters
    public UUID getMenuItemId() { return menuItemId; }
    public UUID getRestaurantId() { return restaurantId; }
    
    public String toString() {
        return "MenuItemUpdatedEvent{" +
                "menuItemId=" + menuItemId +
                ", restaurantId=" + restaurantId +
                ", occurredOn=" + occurredOn +
                '}';
    }
}