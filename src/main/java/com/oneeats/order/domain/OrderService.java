package com.oneeats.order.domain;

import com.oneeats.common.events.EventPublisher;
import com.oneeats.order.domain.events.OrderCreatedEvent;
import com.oneeats.order.domain.events.OrderStatusChangedEvent;
import com.oneeats.order.infrastructure.OrderRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.OptionalDouble;
import java.util.UUID;

/**
 * Service métier pour la gestion des commandes
 * Encapsule la logique métier et la publication d'événements
 */
@ApplicationScoped
public class OrderService {
    
    private static final Logger LOG = Logger.getLogger(OrderService.class);
    
    @Inject
    OrderRepository orderRepository;
    
    // EventPublisher temporairement désactivé pour éviter les erreurs de compilation
    // @Inject
    // EventPublisher eventPublisher;
    
    /**
     * Créer une nouvelle commande
     */
    @Transactional
    public Order createOrder(UUID userId, UUID restaurantId, BigDecimal totalAmount, String specialInstructions) {
        Objects.requireNonNull(userId, "L'ID utilisateur ne peut pas être null");
        Objects.requireNonNull(restaurantId, "L'ID restaurant ne peut pas être null");
        Objects.requireNonNull(totalAmount, "Le montant total ne peut pas être null");
        
        LOG.infof("Création d'une nouvelle commande pour l'utilisateur %s au restaurant %s", userId, restaurantId);
        
        // Créer la commande
        Order order = new Order(userId, restaurantId, totalAmount, specialInstructions);
        
        // Persister
        orderRepository.persist(order);
        
        // Publier l'événement (temporairement désactivé)
        // OrderCreatedEvent event = new OrderCreatedEvent(order);
        // eventPublisher.publish(event);
        
        LOG.infof("Commande créée avec succès: %s", order.getId());
        return order;
    }
    
    /**
     * Changer le statut d'une commande
     */
    @Transactional
    public void updateOrderStatus(UUID orderId, OrderStatus newStatus) {
        Objects.requireNonNull(orderId, "L'ID de la commande ne peut pas être null");
        Objects.requireNonNull(newStatus, "Le nouveau statut ne peut pas être null");
        
        LOG.infof("Changement de statut pour la commande %s vers %s", orderId, newStatus);
        
        Order order = orderRepository.findById(orderId);
        if (order == null) {
            throw new OrderNotFoundException("Commande non trouvée: " + orderId);
        }
        
        OrderStatus previousStatus = order.getStatus();
        
        // Validation métier spécifique
        validateStatusTransition(order, newStatus);
        
        // Changer le statut
        order.changeStatus(newStatus);
        
        // Publier l'événement (temporairement désactivé)
        // OrderStatusChangedEvent event = new OrderStatusChangedEvent(
        //     orderId, order.getUserId(), order.getRestaurantId(), previousStatus, newStatus);
        // eventPublisher.publish(event);
        
        LOG.infof("Statut de la commande %s changé de %s vers %s", orderId, previousStatus, newStatus);
    }
    
    /**
     * Confirmer une commande (passage en préparation)
     */
    @Transactional
    public void confirmOrder(UUID orderId) {
        updateOrderStatus(orderId, OrderStatus.EN_PREPARATION);
    }
    
    /**
     * Marquer une commande comme prête
     */
    @Transactional
    public void markOrderReady(UUID orderId, int estimatedPickupMinutes) {
        Order order = findOrderById(orderId);
        
        // Définir le temps de récupération estimé
        LocalDateTime estimatedTime = LocalDateTime.now().plusMinutes(estimatedPickupMinutes);
        order.setEstimatedPickupTime(estimatedTime);
        
        updateOrderStatus(orderId, OrderStatus.PRETE);
    }
    
    /**
     * Marquer une commande comme récupérée
     */
    @Transactional
    public void markOrderPickedUp(UUID orderId) {
        updateOrderStatus(orderId, OrderStatus.RECUPEREE);
    }
    
    /**
     * Annuler une commande
     */
    @Transactional
    public void cancelOrder(UUID orderId, String reason) {
        Order order = findOrderById(orderId);
        
        if (!order.canBeCancelled()) {
            throw new IllegalStateException("Cette commande ne peut pas être annulée dans son état actuel: " + order.getStatus());
        }
        
        LOG.infof("Annulation de la commande %s. Raison: %s", orderId, reason);
        updateOrderStatus(orderId, OrderStatus.ANNULEE);
    }
    
    /**
     * Ajouter un item à une commande (seulement si en attente)
     */
    @Transactional
    public void addItemToOrder(UUID orderId, OrderItem item) {
        Order order = findOrderById(orderId);
        
        if (order.getStatus() != OrderStatus.EN_ATTENTE) {
            throw new IllegalStateException("Impossible d'ajouter des items à une commande qui n'est plus en attente");
        }
        
        order.addItem(item);
        LOG.infof("Item ajouté à la commande %s: %s", orderId, item.getMenuItemName());
    }
    
    /**
     * Calculer le temps moyen de préparation pour un restaurant
     */
    public OptionalDouble getAveragePreparationTime(UUID restaurantId, int daysPeriod) {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(daysPeriod);
        List<Order> completedOrders = orderRepository.findOrdersBetweenDates(cutoff, LocalDateTime.now())
            .stream()
            .filter(order -> order.getRestaurantId().equals(restaurantId))
            .filter(order -> order.getStatus() == OrderStatus.RECUPEREE)
            .filter(order -> order.getActualPickupTime() != null)
            .toList();
        
        return completedOrders.stream()
            .mapToLong(order -> java.time.Duration.between(order.getCreatedAt(), order.getActualPickupTime()).toMinutes())
            .average();
    }
    
    /**
     * Trouver les commandes en retard pour un restaurant
     */
    public List<Order> findOverdueOrders(UUID restaurantId, int thresholdMinutes) {
        return orderRepository.findActiveOrdersByRestaurant(restaurantId)
            .stream()
            .filter(order -> order.getMinutesSinceCreation() > thresholdMinutes)
            .toList();
    }
    
    // Méthodes utilitaires
    
    private Order findOrderById(UUID orderId) {
        Order order = orderRepository.findById(orderId);
        if (order == null) {
            throw new OrderNotFoundException("Commande non trouvée: " + orderId);
        }
        return order;
    }
    
    private void validateStatusTransition(Order order, OrderStatus newStatus) {
        // Validation métier supplémentaire
        switch (newStatus) {
            case EN_PREPARATION -> {
                // Vérifier que le restaurant peut accepter de nouvelles commandes
                long activeOrders = orderRepository.countByRestaurantIdAndStatus(order.getRestaurantId(), OrderStatus.EN_PREPARATION);
                if (activeOrders >= 10) { // Limite arbitraire pour l'exemple
                    throw new IllegalStateException("Le restaurant a déjà trop de commandes en préparation");
                }
            }
            case PRETE -> {
                // Vérifier qu'un temps minimum de préparation s'est écoulé
                if (order.getMinutesSinceCreation() < 5) {
                    throw new IllegalStateException("Temps de préparation minimum non respecté");
                }
            }
        }
    }
    
    /**
     * Exception métier pour commande non trouvée
     */
    public static class OrderNotFoundException extends RuntimeException {
        public OrderNotFoundException(String message) {
            super(message);
        }
    }
    
}