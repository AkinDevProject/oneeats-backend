package com.oneeats.order.domain.model;

import java.util.Set;

/**
 * Statuts d'une commande avec state machine intégrée
 * MVP: En attente → En préparation → Prête → Récupérée → Annulée
 */
public enum OrderStatus {
    
    PENDING("Pending confirmation"),
    CONFIRMED("Confirmed"),
    PREPARING("Being prepared"),
    READY("Ready for pickup"),
    COMPLETED("Completed"),
    CANCELLED("Cancelled");
    
    private final String description;
    
    OrderStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
    
    /**
     * Vérifie si une transition vers un nouveau statut est autorisée
     */
    public boolean canTransitionTo(OrderStatus newStatus) {
        Set<OrderStatus> allowed = getAllowedTransitions();
        return allowed.contains(newStatus);
    }
    
    /**
     * Obtient tous les statuts possibles depuis le statut actuel
     */
    public Set<OrderStatus> getAllowedTransitions() {
        return switch (this) {
            case PENDING -> Set.of(CONFIRMED, CANCELLED);
            case CONFIRMED -> Set.of(PREPARING, CANCELLED);
            case PREPARING -> Set.of(READY, CANCELLED);
            case READY -> Set.of(COMPLETED, CANCELLED);
            case COMPLETED -> Set.of();
            case CANCELLED -> Set.of();
        };
    }
    
    /**
     * Vérifie si le statut est final (aucune transition possible)
     */
    public boolean isFinal() {
        return getAllowedTransitions().isEmpty();
    }
    
    /**
     * Vérifie si une commande peut être annulée depuis ce statut
     */
    public boolean canBeCancelled() {
        return getAllowedTransitions().contains(CANCELLED);
    }
    
    /**
     * Exception levée lors de tentatives de transition invalides
     */
    public static class InvalidTransitionException extends RuntimeException {
        public InvalidTransitionException(OrderStatus from, OrderStatus to) {
            super(String.format("Transition invalide de '%s' vers '%s'", 
                from.getDescription(), to.getDescription()));
        }
    }
}