package com.oneeats.admin.application.dto;

/**
 * Types d'alertes admin
 */
public enum AlertType {
    NEW_RESTAURANT,        // Nouveau restaurant en attente de validation
    RESTAURANT_BLOCKED,    // Restaurant bloqué
    USER_SUSPENDED,        // Utilisateur suspendu
    ORDER_CANCELLED,       // Commande annulée
    HIGH_ORDER_VOLUME,     // Volume de commandes élevé
    LOW_RESTAURANT_RATING, // Note restaurant basse
    SYSTEM_WARNING         // Alerte système générique
}
