package com.oneeats.domain.order.internal.entity;

import com.oneeats.domain.menu.internal.entity.MenuItem;
import java.math.BigDecimal;
import java.util.UUID;

public class OrderItem {
    private UUID id;
    private MenuItem menuItem;
    private int quantite;
    private BigDecimal prixUnitaire;

    public OrderItem(UUID id, MenuItem menuItem, int quantite, BigDecimal prixUnitaire) {
        this.id = id;
        this.menuItem = menuItem;
        this.quantite = quantite;
        this.prixUnitaire = prixUnitaire;
    }

    // Getters et setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public MenuItem getMenuItem() { return menuItem; }
    public void setMenuItem(MenuItem menuItem) { this.menuItem = menuItem; }
    public int getQuantite() { return quantite; }
    public void setQuantite(int quantite) { this.quantite = quantite; }
    public BigDecimal getPrixUnitaire() { return prixUnitaire; }
    public void setPrixUnitaire(BigDecimal prixUnitaire) { this.prixUnitaire = prixUnitaire; }
}

