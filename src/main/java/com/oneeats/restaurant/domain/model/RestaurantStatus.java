package com.oneeats.restaurant.domain.model;

public enum RestaurantStatus {
    PENDING,    // En attente de validation admin
    APPROVED,   // Validé par admin (peut ouvrir/fermer)
    BLOCKED     // Bloqué par admin (ne peut plus opérer)
}