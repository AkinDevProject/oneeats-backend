package com.oneeats.order.infrastructure;

import com.oneeats.common.repository.BaseRepository;
import com.oneeats.order.domain.Order;
import com.oneeats.order.domain.OrderStatus;
import io.quarkus.panache.common.Parameters;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository pour les commandes utilisant Panache
 */
@ApplicationScoped
public class OrderRepository extends BaseRepository<Order> {
    
    /**
     * Trouver les commandes d'un utilisateur
     */
    public List<Order> findByUserId(UUID userId) {
        return find("userId = :userId", Parameters.with("userId", userId)).list();
    }
    
    /**
     * Trouver les commandes d'un utilisateur triées par date de création descendante
     */
    public List<Order> findByUserIdOrderByCreatedAtDesc(UUID userId) {
        return find("userId = :userId ORDER BY createdAt DESC", Parameters.with("userId", userId)).list();
    }
    
    /**
     * Trouver les commandes d'un restaurant
     */
    public List<Order> findByRestaurantId(UUID restaurantId) {
        return find("restaurantId = :restaurantId", Parameters.with("restaurantId", restaurantId)).list();
    }
    
    /**
     * Trouver les commandes d'un restaurant par statut
     */
    public List<Order> findByRestaurantIdAndStatus(UUID restaurantId, OrderStatus status) {
        return find("restaurantId = :restaurantId AND status = :status", 
                   Parameters.with("restaurantId", restaurantId).and("status", status)).list();
    }
    
    /**
     * Trouver les commandes actives d'un restaurant (en attente ou en préparation)
     */
    public List<Order> findActiveOrdersByRestaurant(UUID restaurantId) {
        return find("restaurantId = :restaurantId AND status IN (:statuses)", 
                   Parameters.with("restaurantId", restaurantId)
                            .and("statuses", List.of(OrderStatus.EN_ATTENTE, OrderStatus.EN_PREPARATION)))
               .list();
    }
    
    /**
     * Trouver les commandes par statut
     */
    public List<Order> findByStatus(OrderStatus status) {
        return find("status = :status", Parameters.with("status", status)).list();
    }
    
    /**
     * Trouver les commandes en attente depuis plus de X minutes
     */
    public List<Order> findPendingOrdersOlderThan(int minutes) {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(minutes);
        return find("status = :status AND createdAt < :cutoff", 
                   Parameters.with("status", OrderStatus.EN_ATTENTE).and("cutoff", cutoff)).list();
    }
    
    /**
     * Trouver les commandes prêtes depuis plus de X minutes
     */
    public List<Order> findReadyOrdersOlderThan(int minutes) {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(minutes);
        return find("status = :status AND updatedAt < :cutoff", 
                   Parameters.with("status", OrderStatus.PRETE).and("cutoff", cutoff)).list();
    }
    
    /**
     * Compter les commandes d'un restaurant aujourd'hui
     */
    public long countTodayOrdersByRestaurant(UUID restaurantId) {
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        return count("restaurantId = :restaurantId AND createdAt >= :startOfDay", 
                    Parameters.with("restaurantId", restaurantId).and("startOfDay", startOfDay));
    }
    
    /**
     * Compter les commandes par statut pour un restaurant
     */
    public long countByRestaurantIdAndStatus(UUID restaurantId, OrderStatus status) {
        return count("restaurantId = :restaurantId AND status = :status", 
                    Parameters.with("restaurantId", restaurantId).and("status", status));
    }
    
    /**
     * Recherche textuelle dans les commandes (instructions spéciales)
     */
    @Override
    public List<Order> search(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return findAll().list();
        }
        
        String term = "%" + searchTerm.toLowerCase() + "%";
        return find("LOWER(specialInstructions) LIKE :term", 
                   Parameters.with("term", term)).list();
    }
    
    /**
     * Trouver les commandes avec pagination et tri
     */
    public List<Order> findByRestaurantIdPaginated(UUID restaurantId, int page, int size, Sort sort) {
        return find("restaurantId = :restaurantId", sort, Parameters.with("restaurantId", restaurantId))
               .page(page, size)
               .list();
    }
    
    /**
     * Statistiques - commandes par période
     */
    public List<Order> findOrdersBetweenDates(LocalDateTime startDate, LocalDateTime endDate) {
        return find("createdAt BETWEEN :start AND :end", 
                   Parameters.with("start", startDate).and("end", endDate)).list();
    }
    
    /**
     * Trouver la dernière commande d'un utilisateur
     */
    public Optional<Order> findLastOrderByUserId(UUID userId) {
        return find("userId = :userId ORDER BY createdAt DESC", Parameters.with("userId", userId))
               .firstResultOptional();
    }
}