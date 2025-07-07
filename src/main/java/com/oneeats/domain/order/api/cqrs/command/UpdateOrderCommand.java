package com.oneeats.domain.order.api.cqrs.command;

import java.util.List;
import java.util.UUID;

public class UpdateOrderCommand {
    private UUID id;
    private String statut;
    private String mode;
    private List<OrderItemUpdateCommand> items;

    public static class OrderItemUpdateCommand {
        private UUID id;
        private int quantite;
        // Getters et setters
        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public int getQuantite() { return quantite; }
        public void setQuantite(int quantite) { this.quantite = quantite; }
    }

    // Getters et setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }
    public List<OrderItemUpdateCommand> getItems() { return items; }
    public void setItems(List<OrderItemUpdateCommand> items) { this.items = items; }
}

