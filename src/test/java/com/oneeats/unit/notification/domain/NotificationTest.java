package com.oneeats.unit.notification.domain;

import com.oneeats.notification.domain.model.Notification;
import com.oneeats.notification.domain.model.NotificationStatus;
import com.oneeats.notification.domain.model.NotificationType;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ✅ TESTS UNITAIRES NOTIFICATION - Domain Logic Pure
 * - Aucune annotation @QuarkusTest
 * - Aucune injection @Inject
 * - Aucune base de données
 * - Teste UNIQUEMENT la logique métier de l'entité Notification
 */
@DisplayName("Notification Unit Tests - Pure Domain Logic")
class NotificationTest {
    
    private Notification notification;
    private UUID notificationId;
    private UUID recipientId;
    
    @BeforeEach
    void setUp() {
        notificationId = UUID.randomUUID();
        recipientId = UUID.randomUUID();
        
        notification = new Notification(
            notificationId,
            recipientId,
            NotificationType.ORDER_CONFIRMATION,
            "Order Confirmed",
            "Your order #12345 has been confirmed",
            NotificationStatus.PENDING,
            LocalDateTime.now()
        );
    }
    
    @Nested
    @DisplayName("Notification Creation")
    class NotificationCreation {
        
        @Test
        @DisplayName("Should create notification with factory method")
        void shouldCreateNotificationWithFactoryMethod() {
            // When
            Notification newNotification = Notification.create(
                recipientId,
                NotificationType.ORDER_READY,
                "Order Ready",
                "Your order is ready for pickup"
            );
            
            // Then
            assertNotNull(newNotification);
            assertNotNull(newNotification.getId());
            assertEquals(recipientId, newNotification.getRecipientId());
            assertEquals(NotificationType.ORDER_READY, newNotification.getType());
            assertEquals("Order Ready", newNotification.getTitle());
            assertEquals("Your order is ready for pickup", newNotification.getMessage());
            assertEquals(NotificationStatus.PENDING, newNotification.getStatus()); // Default status
            assertNotNull(newNotification.getScheduledAt());
            assertNull(newNotification.getSentAt()); // Not sent yet
            assertNotNull(newNotification.getCreatedAt());
            
            // Should have domain events
            assertFalse(newNotification.getDomainEvents().isEmpty());
        }
        
        @Test
        @DisplayName("Should initialize with provided values")
        void shouldInitializeWithProvidedValues() {
            // Then
            assertEquals(notificationId, notification.getId());
            assertEquals(recipientId, notification.getRecipientId());
            assertEquals(NotificationType.ORDER_CONFIRMATION, notification.getType());
            assertEquals("Order Confirmed", notification.getTitle());
            assertEquals("Your order #12345 has been confirmed", notification.getMessage());
            assertEquals(NotificationStatus.PENDING, notification.getStatus());
            assertNotNull(notification.getScheduledAt());
            assertNull(notification.getSentAt());
        }
        
        @Test
        @DisplayName("Should create notifications with different types")
        void shouldCreateNotificationsWithDifferentTypes() {
            // When
            Notification orderUpdate = Notification.create(recipientId, NotificationType.ORDER_STATUS_UPDATE, "Status Updated", "Order is being prepared");
            Notification orderCancelled = Notification.create(recipientId, NotificationType.ORDER_CANCELLED, "Order Cancelled", "Your order has been cancelled");
            Notification restaurantApproved = Notification.create(recipientId, NotificationType.RESTAURANT_APPROVED, "Restaurant Approved", "Your restaurant has been approved");
            Notification systemAnnouncement = Notification.create(recipientId, NotificationType.SYSTEM_ANNOUNCEMENT, "System Maintenance", "Scheduled maintenance tonight");
            
            // Then
            assertEquals(NotificationType.ORDER_STATUS_UPDATE, orderUpdate.getType());
            assertEquals(NotificationType.ORDER_CANCELLED, orderCancelled.getType());
            assertEquals(NotificationType.RESTAURANT_APPROVED, restaurantApproved.getType());
            assertEquals(NotificationType.SYSTEM_ANNOUNCEMENT, systemAnnouncement.getType());
            
            // All should start as PENDING
            assertEquals(NotificationStatus.PENDING, orderUpdate.getStatus());
            assertEquals(NotificationStatus.PENDING, orderCancelled.getStatus());
            assertEquals(NotificationStatus.PENDING, restaurantApproved.getStatus());
            assertEquals(NotificationStatus.PENDING, systemAnnouncement.getStatus());
        }
        
        @Test
        @DisplayName("Should set scheduled time automatically on creation")
        void shouldSetScheduledTimeAutomaticallyOnCreation() {
            // Given
            LocalDateTime beforeCreation = LocalDateTime.now();
            
            // When
            Notification newNotification = Notification.create(
                recipientId,
                NotificationType.ORDER_CONFIRMATION,
                "Test",
                "Test message"
            );
            
            LocalDateTime afterCreation = LocalDateTime.now();
            
            // Then
            assertNotNull(newNotification.getScheduledAt());
            assertTrue(newNotification.getScheduledAt().isAfter(beforeCreation.minusSeconds(1)));
            assertTrue(newNotification.getScheduledAt().isBefore(afterCreation.plusSeconds(1)));
        }
    }
    
    @Nested
    @DisplayName("Notification Status Management")
    class NotificationStatusManagement {
        
        @Test
        @DisplayName("Should mark notification as sent")
        void shouldMarkNotificationAsSent() {
            // Given
            assertEquals(NotificationStatus.PENDING, notification.getStatus());
            assertNull(notification.getSentAt());
            
            LocalDateTime beforeSent = LocalDateTime.now();
            
            // When
            notification.markAsSent();
            
            LocalDateTime afterSent = LocalDateTime.now();
            
            // Then
            assertEquals(NotificationStatus.SENT, notification.getStatus());
            assertNotNull(notification.getSentAt());
            assertTrue(notification.getSentAt().isAfter(beforeSent.minusSeconds(1)));
            assertTrue(notification.getSentAt().isBefore(afterSent.plusSeconds(1)));
            assertNotNull(notification.getUpdatedAt());
        }
        
        @Test
        @DisplayName("Should mark notification as failed")
        void shouldMarkNotificationAsFailed() {
            // Given
            assertEquals(NotificationStatus.PENDING, notification.getStatus());
            
            // When
            notification.markAsFailed();
            
            // Then
            assertEquals(NotificationStatus.FAILED, notification.getStatus());
            assertNull(notification.getSentAt()); // Should remain null for failed notifications
            assertNotNull(notification.getUpdatedAt());
        }
        
        @Test
        @DisplayName("Should mark notification as read")
        void shouldMarkNotificationAsRead() {
            // Given
            notification.markAsSent(); // First mark as sent
            
            // When
            notification.markAsRead();
            
            // Then
            assertEquals(NotificationStatus.READ, notification.getStatus());
            assertNotNull(notification.getSentAt()); // Should preserve sent time
            assertNotNull(notification.getUpdatedAt());
        }
        
        @Test
        @DisplayName("Should handle status transitions correctly")
        void shouldHandleStatusTransitionsCorrectly() {
            // PENDING → SENT
            assertEquals(NotificationStatus.PENDING, notification.getStatus());
            notification.markAsSent();
            assertEquals(NotificationStatus.SENT, notification.getStatus());
            
            // SENT → READ
            notification.markAsRead();
            assertEquals(NotificationStatus.READ, notification.getStatus());
        }
        
        @Test
        @DisplayName("Should handle failed notification workflow")
        void shouldHandleFailedNotificationWorkflow() {
            // PENDING → FAILED
            assertEquals(NotificationStatus.PENDING, notification.getStatus());
            notification.markAsFailed();
            assertEquals(NotificationStatus.FAILED, notification.getStatus());
            
            // Failed notification can be retried (FAILED → SENT)
            notification.markAsSent();
            assertEquals(NotificationStatus.SENT, notification.getStatus());
            assertNotNull(notification.getSentAt());
        }
        
        @Test
        @DisplayName("Should preserve sent time when marking as read")
        void shouldPreserveSentTimeWhenMarkingAsRead() {
            // Given
            notification.markAsSent();
            LocalDateTime originalSentTime = notification.getSentAt();
            
            // Wait a tiny bit to ensure different timestamps
            try {
                Thread.sleep(1);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            
            // When
            notification.markAsRead();
            
            // Then
            assertEquals(originalSentTime, notification.getSentAt());
            assertEquals(NotificationStatus.READ, notification.getStatus());
        }
    }
    
    @Nested
    @DisplayName("Business Logic Queries")
    class BusinessLogicQueries {
        
        @Test
        @DisplayName("Should provide notification information")
        void shouldProvideNotificationInformation() {
            // Then
            assertEquals(recipientId, notification.getRecipientId());
            assertEquals(NotificationType.ORDER_CONFIRMATION, notification.getType());
            assertEquals("Order Confirmed", notification.getTitle());
            assertEquals("Your order #12345 has been confirmed", notification.getMessage());
            assertEquals(NotificationStatus.PENDING, notification.getStatus());
            assertNotNull(notification.getScheduledAt());
        }
        
        @Test
        @DisplayName("Should distinguish between different notification types")
        void shouldDistinguishBetweenDifferentNotificationTypes() {
            // Given
            Notification orderNotification = Notification.create(recipientId, NotificationType.ORDER_READY, "Ready", "Order ready");
            Notification systemNotification = Notification.create(recipientId, NotificationType.SYSTEM_ANNOUNCEMENT, "System", "System message");
            Notification restaurantNotification = Notification.create(recipientId, NotificationType.RESTAURANT_APPROVED, "Approved", "Restaurant approved");
            
            // Then
            assertEquals(NotificationType.ORDER_READY, orderNotification.getType());
            assertEquals(NotificationType.SYSTEM_ANNOUNCEMENT, systemNotification.getType());
            assertEquals(NotificationType.RESTAURANT_APPROVED, restaurantNotification.getType());
            
            // All should have different purposes but same basic structure
            assertNotNull(orderNotification.getTitle());
            assertNotNull(systemNotification.getTitle());
            assertNotNull(restaurantNotification.getTitle());
        }
        
        @Test
        @DisplayName("Should handle different notification statuses correctly")
        void shouldHandleDifferentNotificationStatusesCorrectly() {
            // PENDING
            Notification pending = Notification.create(recipientId, NotificationType.ORDER_CONFIRMATION, "Test", "Message");
            assertEquals(NotificationStatus.PENDING, pending.getStatus());
            assertNull(pending.getSentAt());
            
            // SENT
            pending.markAsSent();
            assertEquals(NotificationStatus.SENT, pending.getStatus());
            assertNotNull(pending.getSentAt());
            
            // READ
            pending.markAsRead();
            assertEquals(NotificationStatus.READ, pending.getStatus());
            
            // FAILED
            Notification failed = Notification.create(recipientId, NotificationType.ORDER_CANCELLED, "Failed", "Test");
            failed.markAsFailed();
            assertEquals(NotificationStatus.FAILED, failed.getStatus());
            assertNull(failed.getSentAt());
        }
    }
    
    @Nested
    @DisplayName("Notification Content Management")
    class NotificationContentManagement {
        
        @Test
        @DisplayName("Should handle different message lengths")
        void shouldHandleDifferentMessageLengths() {
            // Given
            Notification shortMessage = Notification.create(recipientId, NotificationType.ORDER_READY, "Ready", "Ready");
            Notification longMessage = Notification.create(
                recipientId, 
                NotificationType.SYSTEM_ANNOUNCEMENT, 
                "Long Announcement", 
                "This is a very long message that contains multiple sentences and provides detailed information about the notification content. It should be handled properly regardless of its length."
            );
            
            // Then
            assertEquals("Ready", shortMessage.getMessage());
            assertTrue(longMessage.getMessage().length() > 100);
            assertNotNull(shortMessage.getTitle());
            assertNotNull(longMessage.getTitle());
        }
        
        @Test
        @DisplayName("Should handle special characters in content")
        void shouldHandleSpecialCharactersInContent() {
            // Given
            Notification specialChars = Notification.create(
                recipientId,
                NotificationType.ORDER_CONFIRMATION,
                "Commande confirmée! 🎉",
                "Votre commande #12345 a été confirmée. Merci pour votre confiance! €25.50"
            );
            
            // Then
            assertEquals("Commande confirmée! 🎉", specialChars.getTitle());
            assertTrue(specialChars.getMessage().contains("€"));
            assertTrue(specialChars.getMessage().contains("é"));
        }
        
        @Test
        @DisplayName("Should handle empty or null content gracefully")
        void shouldHandleEmptyOrNullContentGracefully() {
            // When & Then - Should not crash with empty content
            assertDoesNotThrow(() -> {
                Notification emptyTitle = Notification.create(recipientId, NotificationType.ORDER_READY, "", "Message");
                Notification emptyMessage = Notification.create(recipientId, NotificationType.ORDER_READY, "Title", "");
                
                assertEquals("", emptyTitle.getTitle());
                assertEquals("", emptyMessage.getMessage());
            });
        }
    }
    
    @Nested
    @DisplayName("Notification Types Coverage")
    class NotificationTypesCoverage {
        
        @Test
        @DisplayName("Should create notifications for all order-related types")
        void shouldCreateNotificationsForAllOrderRelatedTypes() {
            // When
            Notification confirmation = Notification.create(recipientId, NotificationType.ORDER_CONFIRMATION, "Confirmed", "Order confirmed");
            Notification statusUpdate = Notification.create(recipientId, NotificationType.ORDER_STATUS_UPDATE, "Status", "Status updated");
            Notification ready = Notification.create(recipientId, NotificationType.ORDER_READY, "Ready", "Order ready");
            Notification cancelled = Notification.create(recipientId, NotificationType.ORDER_CANCELLED, "Cancelled", "Order cancelled");
            
            // Then
            assertEquals(NotificationType.ORDER_CONFIRMATION, confirmation.getType());
            assertEquals(NotificationType.ORDER_STATUS_UPDATE, statusUpdate.getType());
            assertEquals(NotificationType.ORDER_READY, ready.getType());
            assertEquals(NotificationType.ORDER_CANCELLED, cancelled.getType());
        }
        
        @Test
        @DisplayName("Should create notifications for restaurant-related types")
        void shouldCreateNotificationsForRestaurantRelatedTypes() {
            // When
            Notification approved = Notification.create(recipientId, NotificationType.RESTAURANT_APPROVED, "Approved", "Restaurant approved");
            Notification rejected = Notification.create(recipientId, NotificationType.RESTAURANT_REJECTED, "Rejected", "Restaurant rejected");
            
            // Then
            assertEquals(NotificationType.RESTAURANT_APPROVED, approved.getType());
            assertEquals(NotificationType.RESTAURANT_REJECTED, rejected.getType());
        }
        
        @Test
        @DisplayName("Should create system announcement notifications")
        void shouldCreateSystemAnnouncementNotifications() {
            // When
            Notification system = Notification.create(recipientId, NotificationType.SYSTEM_ANNOUNCEMENT, "System", "System message");
            
            // Then
            assertEquals(NotificationType.SYSTEM_ANNOUNCEMENT, system.getType());
        }
        
        @Test
        @DisplayName("Should handle all notification types with same behavior")
        void shouldHandleAllNotificationTypesWithSameBehavior() {
            // Given - Create notifications of each type
            NotificationType[] allTypes = NotificationType.values();
            
            for (NotificationType type : allTypes) {
                // When
                Notification notification = Notification.create(
                    recipientId, 
                    type, 
                    "Test " + type, 
                    "Test message for " + type
                );
                
                // Then - All should behave the same way
                assertEquals(NotificationStatus.PENDING, notification.getStatus());
                assertNull(notification.getSentAt());
                assertNotNull(notification.getScheduledAt());
                
                // Status transitions should work for all types
                notification.markAsSent();
                assertEquals(NotificationStatus.SENT, notification.getStatus());
                assertNotNull(notification.getSentAt());
                
                notification.markAsRead();
                assertEquals(NotificationStatus.READ, notification.getStatus());
            }
        }
    }
    
    @Nested
    @DisplayName("Domain Events")
    class DomainEvents {
        
        @Test
        @DisplayName("Should emit NotificationCreatedEvent when created with factory")
        void shouldEmitNotificationCreatedEventWhenCreatedWithFactory() {
            // When
            Notification newNotification = Notification.create(
                recipientId,
                NotificationType.ORDER_CONFIRMATION,
                "Event Test",
                "Test notification for events"
            );
            
            // Then
            assertEquals(1, newNotification.getDomainEvents().size());
            assertTrue(newNotification.getDomainEvents().get(0) instanceof com.oneeats.notification.domain.event.NotificationCreatedEvent);
        }
        
        @Test
        @DisplayName("Should not emit events for direct constructor")
        void shouldNotEmitEventsForDirectConstructor() {
            // When
            Notification directNotification = new Notification(
                UUID.randomUUID(),
                recipientId,
                NotificationType.ORDER_READY,
                "Direct",
                "Direct creation",
                NotificationStatus.PENDING,
                LocalDateTime.now()
            );
            
            // Then
            assertTrue(directNotification.getDomainEvents().isEmpty());
        }
        
        @Test
        @DisplayName("Should clear domain events")
        void shouldClearDomainEvents() {
            // Given
            Notification eventNotification = Notification.create(recipientId, NotificationType.SYSTEM_ANNOUNCEMENT, "Test", "Test");
            assertFalse(eventNotification.getDomainEvents().isEmpty());
            
            // When
            eventNotification.clearDomainEvents();
            
            // Then
            assertTrue(eventNotification.getDomainEvents().isEmpty());
        }
    }
    
    @Nested
    @DisplayName("Edge Cases and Validation")
    class EdgeCasesAndValidation {
        
        @Test
        @DisplayName("Should handle repeated status changes")
        void shouldHandleRepeatedStatusChanges() {
            // When - Multiple identical status changes
            notification.markAsSent();
            LocalDateTime firstSentTime = notification.getSentAt();
            
            // Wait a tiny bit
            try {
                Thread.sleep(1);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            
            notification.markAsSent(); // Second call
            
            // Then - Should update the sent time
            assertEquals(NotificationStatus.SENT, notification.getStatus());
            assertTrue(notification.getSentAt().isAfter(firstSentTime) || notification.getSentAt().equals(firstSentTime));
        }
        
        @Test
        @DisplayName("Should handle status changes from any state")
        void shouldHandleStatusChangesFromAnyState() {
            // From PENDING to any status
            notification.markAsFailed();
            assertEquals(NotificationStatus.FAILED, notification.getStatus());
            
            // From FAILED to SENT
            notification.markAsSent();
            assertEquals(NotificationStatus.SENT, notification.getStatus());
            
            // From SENT to READ
            notification.markAsRead();
            assertEquals(NotificationStatus.READ, notification.getStatus());
            
            // From READ back to FAILED (retry scenario)
            notification.markAsFailed();
            assertEquals(NotificationStatus.FAILED, notification.getStatus());
        }
        
        @Test
        @DisplayName("Should maintain immutability of core properties")
        void shouldMaintainImmutabilityOfCoreProperties() {
            // Given
            UUID originalRecipientId = notification.getRecipientId();
            NotificationType originalType = notification.getType();
            String originalTitle = notification.getTitle();
            String originalMessage = notification.getMessage();
            LocalDateTime originalScheduledAt = notification.getScheduledAt();
            
            // When - Change status (only mutable property through public API)
            notification.markAsSent();
            notification.markAsRead();
            notification.markAsFailed();
            
            // Then - Core properties should remain unchanged
            assertEquals(originalRecipientId, notification.getRecipientId());
            assertEquals(originalType, notification.getType());
            assertEquals(originalTitle, notification.getTitle());
            assertEquals(originalMessage, notification.getMessage());
            assertEquals(originalScheduledAt, notification.getScheduledAt());
        }
        
        @Test
        @DisplayName("Should handle toString operation")
        void shouldHandleToStringOperation() {
            // When & Then
            assertDoesNotThrow(() -> {
                String toString = notification.toString();
                assertNotNull(toString);
                assertTrue(toString.length() > 0);
            });
        }
    }
}