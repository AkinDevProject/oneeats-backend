package com.oneeats.domain.order.api.model;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class OrderDto {
    private UUID id;
    private UUID clientId;
    private UUID restaurantId;
    private List<OrderItemDto> items;
    private String statut;
    private String mode;
    private LocalDateTime dateCreation;
    private LocalDateTime dateMaj;

    // Getters et setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getClientId() { return clientId; }
    public void setClientId(UUID clientId) { this.clientId = clientId; }
    public UUID getRestaurantId() { return restaurantId; }
    public void setRestaurantId(UUID restaurantId) { this.restaurantId = restaurantId; }
    public List<OrderItemDto> getItems() { return items; }
    public void setItems(List<OrderItemDto> items) { this.items = items; }
    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }
    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }
    public LocalDateTime getDateMaj() { return dateMaj; }
    public void setDateMaj(LocalDateTime dateMaj) { this.dateMaj = dateMaj; }
}

