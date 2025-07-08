package com.oneeats.order.api.cqrs.command;

import java.util.List;
import java.util.UUID;

public class CreateOrderCommand {
    private UUID clientId;
    private UUID restaurantId;
    private List<OrderItemCommand> items;
    private String mode;

    public static class OrderItemCommand {
        private UUID menuItemId;
        private int quantite;
        // Getters et setters
        public UUID getMenuItemId() { return menuItemId; }
        public void setMenuItemId(UUID menuItemId) { this.menuItemId = menuItemId; }
        public int getQuantite() { return quantite; }
        public void setQuantite(int quantite) { this.quantite = quantite; }
    }

    // Getters et setters
    public UUID getClientId() { return clientId; }
    public void setClientId(UUID clientId) { this.clientId = clientId; }
    public UUID getRestaurantId() { return restaurantId; }
    public void setRestaurantId(UUID restaurantId) { this.restaurantId = restaurantId; }
    public List<OrderItemCommand> getItems() { return items; }
    public void setItems(List<OrderItemCommand> items) { this.items = items; }
    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }
}

