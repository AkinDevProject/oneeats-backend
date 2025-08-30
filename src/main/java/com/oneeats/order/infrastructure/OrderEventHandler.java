package com.oneeats.order.infrastructure;

import com.oneeats.order.domain.events.OrderCreatedEvent;
import com.oneeats.order.domain.events.OrderStatusChangedEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import org.jboss.logging.Logger;

/**
 * Gestionnaire d'événements pour le domaine Order
 * Écoute les événements métier et déclenche des actions
 */
@ApplicationScoped
public class OrderEventHandler {
    
    private static final Logger LOG = Logger.getLogger(OrderEventHandler.class);
    
    /**
     * Gestion de l'événement de création de commande
     */
    public void handleOrderCreated(@Observes OrderCreatedEvent event) {
        LOG.infof("📦 Nouvelle commande créée: %s pour l'utilisateur %s", 
                 event.getOrderId(), event.getUserId());
        
        // Actions à déclencher lors de la création d'une commande:
        // - Envoyer notification au restaurant
        // - Envoyer confirmation à l'utilisateur
        // - Mettre à jour les métriques
        // - Logger pour audit
        
        try {
            // Simuler l'envoi de notification au restaurant
            notifyRestaurant(event);
            
            // Simuler l'envoi de confirmation à l'utilisateur
            sendUserConfirmation(event);
            
            // Mettre à jour les statistiques
            updateOrderMetrics(event);
            
        } catch (Exception e) {
            LOG.errorf(e, "Erreur lors du traitement de l'événement OrderCreated: %s", e.getMessage());
            // En production, on pourrait republier l'événement ou l'enregistrer pour retry
        }
    }
    
    /**
     * Gestion des changements de statut
     */
    public void handleOrderStatusChanged(@Observes OrderStatusChangedEvent event) {
        LOG.infof("📋 Statut de commande changé: %s (%s → %s)", 
                 event.getOrderId(), event.getPreviousStatus(), event.getNewStatus());
        
        try {
            // Actions spécifiques selon le type de changement
            if (event.isOrderConfirmed()) {
                handleOrderConfirmed(event);
            } else if (event.isOrderReady()) {
                handleOrderReady(event);
            } else if (event.isOrderCompleted()) {
                handleOrderCompleted(event);
            } else if (event.isOrderCancelled()) {
                handleOrderCancelled(event);
            }
            
        } catch (Exception e) {
            LOG.errorf(e, "Erreur lors du traitement de l'événement OrderStatusChanged: %s", e.getMessage());
        }
    }
    
    // Actions spécifiques par type de changement de statut
    
    private void handleOrderConfirmed(OrderStatusChangedEvent event) {
        LOG.infof("✅ Commande %s confirmée par le restaurant", event.getOrderId());
        
        // - Notifier l'utilisateur que sa commande est en préparation
        // - Calculer le temps estimé de préparation
        // - Déclencher le workflow de préparation
        
        sendNotificationToUser(event.getUserId(), 
            "Votre commande est confirmée et en cours de préparation !");
    }
    
    private void handleOrderReady(OrderStatusChangedEvent event) {
        LOG.infof("🔔 Commande %s prête à récupérer", event.getOrderId());
        
        // - Notifier l'utilisateur que sa commande est prête
        // - Envoyer push notification
        // - Démarrer le timer de récupération
        
        sendNotificationToUser(event.getUserId(), 
            "Votre commande est prête ! Vous pouvez venir la récupérer.");
    }
    
    private void handleOrderCompleted(OrderStatusChangedEvent event) {
        LOG.infof("✨ Commande %s récupérée avec succès", event.getOrderId());
        
        // - Remercier l'utilisateur
        // - Demander un avis/note
        // - Mettre à jour les statistiques de satisfaction
        // - Proposer des commandes similaires
        
        sendNotificationToUser(event.getUserId(), 
            "Merci pour votre commande ! N'hésitez pas à laisser un avis.");
    }
    
    private void handleOrderCancelled(OrderStatusChangedEvent event) {
        LOG.infof("❌ Commande %s annulée", event.getOrderId());
        
        // - Notifier l'utilisateur de l'annulation
        // - Traiter le remboursement si applicable
        // - Enregistrer la raison pour amélioration
        // - Proposer des alternatives
        
        sendNotificationToUser(event.getUserId(), 
            "Votre commande a été annulée. Nous nous excusons pour la gêne.");
    }
    
    // Méthodes utilitaires (simulées pour l'exemple)
    
    private void notifyRestaurant(OrderCreatedEvent event) {
        LOG.debugf("📨 Notification restaurant %s: nouvelle commande %s", 
                  event.getRestaurantId(), event.getOrderId());
        
        // En production: intégration avec service de notifications
        // - Push notification à l'app restaurant
        // - Email/SMS si configuré
        // - Webhook si intégration tierce
    }
    
    private void sendUserConfirmation(OrderCreatedEvent event) {
        LOG.debugf("📧 Confirmation utilisateur %s: commande %s créée", 
                  event.getUserId(), event.getOrderId());
        
        // En production: 
        // - Email de confirmation avec détails
        // - Push notification mobile
        // - SMS si configuré
    }
    
    private void updateOrderMetrics(OrderCreatedEvent event) {
        LOG.debugf("📊 Mise à jour métriques: nouvelle commande %s€ restaurant %s", 
                  event.getTotalAmount(), event.getRestaurantId());
        
        // En production:
        // - Incrémenter compteurs Prometheus/Micrometer
        // - Mettre à jour cache des statistiques temps réel
        // - Envoyer événements vers data warehouse
    }
    
    private void sendNotificationToUser(java.util.UUID userId, String message) {
        LOG.debugf("🔔 Notification utilisateur %s: %s", userId, message);
        
        // En production: intégration service notifications
        // - Push via Expo/Firebase
        // - WebSocket pour temps réel
        // - Email/SMS selon préférences utilisateur
    }
}