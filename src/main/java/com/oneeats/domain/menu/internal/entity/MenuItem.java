package com.oneeats.domain.menu.internal.entity;

import java.util.UUID;
import com.oneeats.domain.restaurant.internal.entity.Restaurant;
import java.math.BigDecimal;

public class MenuItem {
    private UUID id;
    private String nom;
    private String description;
    private BigDecimal prix;
    private boolean disponible;
    private String categorie;
    private Restaurant restaurant;

    public MenuItem(UUID id, String nom, String description, BigDecimal prix, boolean disponible, String categorie, Restaurant restaurant) {
        this.id = id;
        this.nom = nom;
        this.description = description;
        this.prix = prix;
        this.disponible = disponible;
        this.categorie = categorie;
        this.restaurant = restaurant;
    }

    // Getters et setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getPrix() { return prix; }
    public void setPrix(BigDecimal prix) { this.prix = prix; }
    public boolean isDisponible() { return disponible; }
    public void setDisponible(boolean disponible) { this.disponible = disponible; }
    public String getCategorie() { return categorie; }
    public void setCategorie(String categorie) { this.categorie = categorie; }
    public Restaurant getRestaurant() { return restaurant; }
    public void setRestaurant(Restaurant restaurant) { this.restaurant = restaurant; }
}

