package com.oneeats.menu.domain.service;

import com.oneeats.menu.domain.model.MenuItem;
import com.oneeats.menu.domain.vo.Price;
import java.util.List;
import java.util.UUID;

/**
 * Interface du service de domaine pour MenuItem
 * Contient la logique métier complexe qui ne peut pas être encapsulée dans une seule entité
 */
public interface IMenuItemDomainService {
    
    /**
     * Valider la création d'un item de menu
     */
    void validateMenuItemCreation(UUID restaurantId, String name, Price price, String category);
    
    /**
     * Valider la mise à jour d'un item de menu
     */
    void validateMenuItemUpdate(MenuItem menuItem, String name, Price price, String category);
    
    /**
     * Vérifier si un item peut être supprimé
     */
    boolean canDeleteMenuItem(MenuItem menuItem);
    
    /**
     * Calculer le prix moyen des items d'un restaurant
     */
    Price calculateAveragePrice(List<MenuItem> menuItems);
    
    /**
     * Suggérer des items similaires
     */
    List<MenuItem> findSimilarItems(MenuItem menuItem, int limit);
    
    /**
     * Vérifier la cohérence du menu d'un restaurant
     */
    void validateMenuConsistency(UUID restaurantId);
    
    /**
     * Déterminer la popularité d'un item basée sur ses caractéristiques
     */
    double calculateItemPopularityScore(MenuItem menuItem);
}