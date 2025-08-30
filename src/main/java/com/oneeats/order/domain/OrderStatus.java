package com.oneeats.order.domain;

import java.util.Set;

/**
 * Statuts d'une commande avec state machine intégrée
 * MVP: En attente → En préparation → Prête → Récupérée → Annulée
 */
public enum OrderStatus {
    
    EN_ATTENTE("En attente de confirmation"),
    EN_PREPARATION("En préparation"),
    PRETE("Prête à récupérer"),
    RECUPEREE("Récupérée par le client"),
    ANNULEE("Commande annulée");
    
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
            case EN_ATTENTE -> Set.of(EN_PREPARATION, ANNULEE);
            case EN_PREPARATION -> Set.of(PRETE, ANNULEE);
            case PRETE -> Set.of(RECUPEREE, ANNULEE);
            case RECUPEREE -> Set.of(); // État final
            case ANNULEE -> Set.of(EN_PREPARATION); // Peut être réactivée
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
        return getAllowedTransitions().contains(ANNULEE);
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