package com.oneeats.security;

/**
 * Définition des rôles de sécurité OneEats
 * Utilisés avec Keycloak pour l'autorisation
 */
public final class Roles {
    
    private Roles() {
        // Classe utilitaire - pas d'instanciation
    }
    
    /**
     * Rôle administrateur système
     * - Accès complet à toutes les fonctionnalités
     * - Gestion des utilisateurs et restaurants
     * - Accès aux métriques et logs
     */
    public static final String ADMIN = "admin";
    
    /**
     * Rôle utilisateur standard
     * - Passer des commandes
     * - Consulter l'historique de ses commandes
     * - Gérer son profil
     */
    public static final String USER = "user";
    
    /**
     * Rôle restaurant/partenaire
     * - Gérer les commandes de son restaurant
     * - Mettre à jour les statuts de commande
     * - Accès aux statistiques de son restaurant
     */
    public static final String RESTAURANT = "restaurant";
    
    /**
     * Rôle gestionnaire de restaurant
     * - Gestion complète du restaurant
     * - Gestion du personnel
     * - Accès aux rapports détaillés
     */
    public static final String RESTAURANT_MANAGER = "restaurant_manager";
    
    /**
     * Rôle support client
     * - Consultation des commandes
     * - Assistance aux utilisateurs
     * - Pas de modification des données sensibles
     */
    public static final String SUPPORT = "support";
}