package com.oneeats.order.internal.entity;

import com.oneeats.user.internal.entity.User;
import com.oneeats.restaurant.internal.entity.Restaurant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class Order {
    private UUID id;
    private User client;
    private Restaurant restaurant;
    private List<OrderItem> items;
    private Statut statut;
    private Mode mode;
    private LocalDateTime dateCreation;
    private LocalDateTime dateMaj;

    public enum Statut { PENDING, ACCEPTED, REJECTED, COMPLETED }
    public enum Mode { EMPORTER, SUR_PLACE }

    public Order(UUID id, User client, Restaurant restaurant, List<OrderItem> items, Statut statut, Mode mode, LocalDateTime dateCreation, LocalDateTime dateMaj) {
        this.id = id;
        this.client = client;
        this.restaurant = restaurant;
        this.items = items;
        this.statut = statut;
        this.mode = mode;
        this.dateCreation = dateCreation;
        this.dateMaj = dateMaj;
    }

    // Getters et setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public User getClient() { return client; }
    public void setClient(User client) { this.client = client; }
    public Restaurant getRestaurant() { return restaurant; }
    public void setRestaurant(Restaurant restaurant) { this.restaurant = restaurant; }
    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
    public Statut getStatut() { return statut; }
    public void setStatut(Statut statut) { this.statut = statut; }
    public Mode getMode() { return mode; }
    public void setMode(Mode mode) { this.mode = mode; }
    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }
    public LocalDateTime getDateMaj() { return dateMaj; }
    public void setDateMaj(LocalDateTime dateMaj) { this.dateMaj = dateMaj; }
}

