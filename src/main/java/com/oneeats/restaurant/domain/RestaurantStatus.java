package com.oneeats.restaurant.domain;

/**
 * Statut d'un restaurant dans le système
 */
public enum RestaurantStatus {
    /**
     * Restaurant en attente d'approbation par l'admin
     */
    PENDING,
    
    /**
     * Restaurant approuvé et peut recevoir des commandes
     */
    APPROVED,
    
    /**
     * Restaurant bloqué par l'admin
     */
    BLOCKED
}