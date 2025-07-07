package com.oneeats.domain.order.api.model;

import java.math.BigDecimal;
import java.util.UUID;

public class OrderItemDto {
    private UUID id;
    private UUID menuItemId;
    private int quantite;
    private BigDecimal prixUnitaire;

    // Getters et setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getMenuItemId() { return menuItemId; }
    public void setMenuItemId(UUID menuItemId) { this.menuItemId = menuItemId; }
    public int getQuantite() { return quantite; }
    public void setQuantite(int quantite) { this.quantite = quantite; }
    public BigDecimal getPrixUnitaire() { return prixUnitaire; }
    public void setPrixUnitaire(BigDecimal prixUnitaire) { this.prixUnitaire = prixUnitaire; }
}

