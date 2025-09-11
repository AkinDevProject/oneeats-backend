package com.oneeats.menu.domain.event;

import com.oneeats.shared.domain.event.IDomainEvent;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Événement déclenché lors du changement de disponibilité d'un item de menu
 */
public class MenuItemAvailabilityChangedEvent implements IDomainEvent {
    
    private final UUID menuItemId;
    private final UUID restaurantId;
    private final boolean isAvailable;
    private final LocalDateTime occurredOn;
    
    public MenuItemAvailabilityChangedEvent(UUID menuItemId, UUID restaurantId, boolean isAvailable) {
        this.menuItemId = menuItemId;
        this.restaurantId = restaurantId;
        this.isAvailable = isAvailable;
        this.occurredOn = LocalDateTime.now();
    }
    
    @Override
    public LocalDateTime occurredOn() {
        return occurredOn;
    }
    
    
    // Getters
    public UUID getMenuItemId() { return menuItemId; }
    public UUID getRestaurantId() { return restaurantId; }
    public boolean isAvailable() { return isAvailable; }
    
    public String toString() {
        return "MenuItemAvailabilityChangedEvent{" +
                "menuItemId=" + menuItemId +
                ", restaurantId=" + restaurantId +
                ", isAvailable=" + isAvailable +
                ", occurredOn=" + occurredOn +
                '}';
    }
}