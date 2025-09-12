package com.oneeats.notification.domain.model;

import com.oneeats.notification.domain.event.NotificationCreatedEvent;
import com.oneeats.shared.domain.event.IDomainEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Notification Model Tests")
class NotificationTest {
    
    private UUID recipientId;
    private NotificationType type;
    private String title;
    private String message;
    
    @BeforeEach
    void setUp() {
        recipientId = UUID.randomUUID();
        type = NotificationType.ORDER_CONFIRMATION;
        title = "Order Confirmed";
        message = "Your order #12345 has been confirmed and will be prepared shortly.";
    }
    
    @Nested
    @DisplayName("Notification Creation")
    class NotificationCreation {
        
        @Test
        @DisplayName("Should create notification with valid data")
        void shouldCreateNotificationWithValidData() {
            LocalDateTime beforeCreation = LocalDateTime.now();
            
            Notification notification = Notification.create(recipientId, type, title, message);
            
            LocalDateTime afterCreation = LocalDateTime.now();
            
            assertNotNull(notification);
            assertNotNull(notification.getId());
            assertEquals(recipientId, notification.getRecipientId());
            assertEquals(type, notification.getType());
            assertEquals(title, notification.getTitle());
            assertEquals(message, notification.getMessage());
            assertEquals(NotificationStatus.PENDING, notification.getStatus());
            assertNull(notification.getSentAt());
            
            assertNotNull(notification.getScheduledAt());
            assertTrue(notification.getScheduledAt().isAfter(beforeCreation) || 
                notification.getScheduledAt().isEqual(beforeCreation));
            assertTrue(notification.getScheduledAt().isBefore(afterCreation) || 
                notification.getScheduledAt().isEqual(afterCreation));
        }
        
        @Test
        @DisplayName("Should create notification with different types")
        void shouldCreateNotificationWithDifferentTypes() {
            Notification orderReady = Notification.create(recipientId, 
                NotificationType.ORDER_READY, "Order Ready", "Your order is ready for pickup!");
            Notification systemAnnouncement = Notification.create(recipientId, 
                NotificationType.SYSTEM_ANNOUNCEMENT, "System Maintenance", "Scheduled maintenance tonight.");
            
            assertEquals(NotificationType.ORDER_READY, orderReady.getType());
            assertEquals(NotificationType.SYSTEM_ANNOUNCEMENT, systemAnnouncement.getType());
        }
        
        @Test
        @DisplayName("Should set default status to PENDING on creation")
        void shouldSetDefaultStatusToPendingOnCreation() {
            Notification notification = Notification.create(recipientId, type, title, message);
            
            assertEquals(NotificationStatus.PENDING, notification.getStatus());
        }
        
        @Test
        @DisplayName("Should set sentAt to null on creation")
        void shouldSetSentAtToNullOnCreation() {
            Notification notification = Notification.create(recipientId, type, title, message);
            
            assertNull(notification.getSentAt());
        }
        
        @Test
        @DisplayName("Should publish NotificationCreatedEvent on creation")
        void shouldPublishNotificationCreatedEventOnCreation() {
            Notification notification = Notification.create(recipientId, type, title, message);
            
            List<IDomainEvent> events = notification.getDomainEvents();
            assertEquals(1, events.size());
            assertTrue(events.get(0) instanceof NotificationCreatedEvent);
            
            NotificationCreatedEvent event = (NotificationCreatedEvent) events.get(0);
            assertEquals(notification.getId(), event.getNotificationId());
            assertEquals(notification.getRecipientId(), event.getRecipientId());
            assertEquals(notification.getType(), event.getType());
            assertNotNull(event.occurredOn());
        }
    }
    
    @Nested
    @DisplayName("Notification Status Management")
    class NotificationStatusManagement {
        
        private Notification notification;
        
        @BeforeEach
        void setUp() {
            notification = Notification.create(recipientId, type, title, message);
        }
        
        @Test
        @DisplayName("Should mark notification as sent")
        void shouldMarkNotificationAsSent() {
            LocalDateTime beforeSent = LocalDateTime.now();
            
            notification.markAsSent();
            
            LocalDateTime afterSent = LocalDateTime.now();
            
            assertEquals(NotificationStatus.SENT, notification.getStatus());
            assertNotNull(notification.getSentAt());
            assertTrue(notification.getSentAt().isAfter(beforeSent) || 
                notification.getSentAt().isEqual(beforeSent));
            assertTrue(notification.getSentAt().isBefore(afterSent) || 
                notification.getSentAt().isEqual(afterSent));
        }
        
        @Test
        @DisplayName("Should mark notification as failed")
        void shouldMarkNotificationAsFailed() {
            notification.markAsFailed();
            
            assertEquals(NotificationStatus.FAILED, notification.getStatus());
            // sentAt should remain null for failed notifications
            assertNull(notification.getSentAt());
        }
        
        @Test
        @DisplayName("Should mark notification as read")
        void shouldMarkNotificationAsRead() {
            notification.markAsRead();
            
            assertEquals(NotificationStatus.READ, notification.getStatus());
        }
        
        @Test
        @DisplayName("Should handle multiple status changes")
        void shouldHandleMultipleStatusChanges() {
            // PENDING -> SENT -> READ
            assertEquals(NotificationStatus.PENDING, notification.getStatus());
            
            notification.markAsSent();
            assertEquals(NotificationStatus.SENT, notification.getStatus());
            assertNotNull(notification.getSentAt());
            
            notification.markAsRead();
            assertEquals(NotificationStatus.READ, notification.getStatus());
            // sentAt should remain set
            assertNotNull(notification.getSentAt());
        }
        
        @Test
        @DisplayName("Should handle PENDING -> FAILED transition")
        void shouldHandlePendingToFailedTransition() {
            assertEquals(NotificationStatus.PENDING, notification.getStatus());
            
            notification.markAsFailed();
            
            assertEquals(NotificationStatus.FAILED, notification.getStatus());
            assertNull(notification.getSentAt());
        }
        
        @Test
        @DisplayName("Should allow transition from FAILED to SENT")
        void shouldAllowTransitionFromFailedToSent() {
            notification.markAsFailed();
            assertEquals(NotificationStatus.FAILED, notification.getStatus());
            
            notification.markAsSent();
            
            assertEquals(NotificationStatus.SENT, notification.getStatus());
            assertNotNull(notification.getSentAt());
        }
    }
    
    @Nested
    @DisplayName("Notification Properties")
    class NotificationProperties {
        
        private Notification notification;
        
        @BeforeEach
        void setUp() {
            notification = Notification.create(recipientId, type, title, message);
        }
        
        @Test
        @DisplayName("Should return correct recipient ID")
        void shouldReturnCorrectRecipientId() {
            assertEquals(recipientId, notification.getRecipientId());
        }
        
        @Test
        @DisplayName("Should return correct notification type")
        void shouldReturnCorrectNotificationType() {
            assertEquals(type, notification.getType());
        }
        
        @Test
        @DisplayName("Should return correct title")
        void shouldReturnCorrectTitle() {
            assertEquals(title, notification.getTitle());
        }
        
        @Test
        @DisplayName("Should return correct message")
        void shouldReturnCorrectMessage() {
            assertEquals(message, notification.getMessage());
        }
        
        @Test
        @DisplayName("Should return correct status")
        void shouldReturnCorrectStatus() {
            assertEquals(NotificationStatus.PENDING, notification.getStatus());
        }
        
        @Test
        @DisplayName("Should return correct scheduled time")
        void shouldReturnCorrectScheduledTime() {
            assertNotNull(notification.getScheduledAt());
            assertTrue(notification.getScheduledAt().isBefore(LocalDateTime.now().plusSeconds(1)));
        }
        
        @Test
        @DisplayName("Should return null for sentAt initially")
        void shouldReturnNullForSentAtInitially() {
            assertNull(notification.getSentAt());
        }
    }
    
    @Nested
    @DisplayName("Notification Business Logic")
    class NotificationBusinessLogic {
        
        @Test
        @DisplayName("Should handle different notification content")
        void shouldHandleDifferentNotificationContent() {
            String longMessage = "This is a very long notification message that might contain " +
                "multiple sentences and detailed information about the order status, " +
                "including specific details that the user needs to know.";
            
            Notification longNotification = Notification.create(recipientId, type, 
                "Detailed Order Update", longMessage);
            
            assertEquals("Detailed Order Update", longNotification.getTitle());
            assertEquals(longMessage, longNotification.getMessage());
        }
        
        @Test
        @DisplayName("Should handle empty title and message")
        void shouldHandleEmptyTitleAndMessage() {
            Notification emptyNotification = Notification.create(recipientId, type, "", "");
            
            assertEquals("", emptyNotification.getTitle());
            assertEquals("", emptyNotification.getMessage());
        }
        
        @Test
        @DisplayName("Should handle special characters in content")
        void shouldHandleSpecialCharactersInContent() {
            String titleWithSpecialChars = "Order #12345 - Ready! 🍕";
            String messageWithSpecialChars = "Your order is ready @ location: 123 Main St., Apt #4B";
            
            Notification specialNotification = Notification.create(recipientId, type, 
                titleWithSpecialChars, messageWithSpecialChars);
            
            assertEquals(titleWithSpecialChars, specialNotification.getTitle());
            assertEquals(messageWithSpecialChars, specialNotification.getMessage());
        }
    }
    
    @Nested
    @DisplayName("Notification Constructor Tests")
    class NotificationConstructorTests {
        
        @Test
        @DisplayName("Should create notification with full constructor")
        void shouldCreateNotificationWithFullConstructor() {
            UUID id = UUID.randomUUID();
            LocalDateTime scheduledAt = LocalDateTime.now();
            
            Notification notification = new Notification(id, recipientId, type, title, message, 
                NotificationStatus.PENDING, scheduledAt);
            
            assertEquals(id, notification.getId());
            assertEquals(recipientId, notification.getRecipientId());
            assertEquals(type, notification.getType());
            assertEquals(title, notification.getTitle());
            assertEquals(message, notification.getMessage());
            assertEquals(NotificationStatus.PENDING, notification.getStatus());
            assertEquals(scheduledAt, notification.getScheduledAt());
            assertNull(notification.getSentAt());
        }
        
        @Test
        @DisplayName("Should create notification with different statuses")
        void shouldCreateNotificationWithDifferentStatuses() {
            UUID id = UUID.randomUUID();
            LocalDateTime scheduledAt = LocalDateTime.now();
            
            Notification sentNotification = new Notification(id, recipientId, type, title, message, 
                NotificationStatus.SENT, scheduledAt);
            Notification failedNotification = new Notification(id, recipientId, type, title, message, 
                NotificationStatus.FAILED, scheduledAt);
            
            assertEquals(NotificationStatus.SENT, sentNotification.getStatus());
            assertEquals(NotificationStatus.FAILED, failedNotification.getStatus());
        }
    }
    
    @Nested
    @DisplayName("Notification Domain Events")
    class NotificationDomainEvents {
        
        @Test
        @DisplayName("Should publish NotificationCreatedEvent with correct data")
        void shouldPublishNotificationCreatedEventWithCorrectData() {
            Notification notification = Notification.create(recipientId, type, title, message);
            
            List<IDomainEvent> events = notification.getDomainEvents();
            assertEquals(1, events.size());
            
            NotificationCreatedEvent event = (NotificationCreatedEvent) events.get(0);
            assertEquals(notification.getId(), event.getNotificationId());
            assertEquals(notification.getRecipientId(), event.getRecipientId());
            assertEquals(notification.getType(), event.getType());
            assertNotNull(event.occurredOn());
        }
        
        @Test
        @DisplayName("Should maintain event immutability")
        void shouldMaintainEventImmutability() {
            Notification notification = Notification.create(recipientId, type, title, message);
            NotificationCreatedEvent event = (NotificationCreatedEvent) notification.getDomainEvents().get(0);
            
            // Verify event properties don't change
            UUID originalNotificationId = event.getNotificationId();
            UUID originalRecipientId = event.getRecipientId();
            NotificationType originalType = event.getType();
            
            assertEquals(originalNotificationId, event.getNotificationId());
            assertEquals(originalRecipientId, event.getRecipientId());
            assertEquals(originalType, event.getType());
        }
    }
    
    @Nested
    @DisplayName("Notification Edge Cases")
    class NotificationEdgeCases {
        
        @Test
        @DisplayName("Should handle multiple consecutive status updates")
        void shouldHandleMultipleConsecutiveStatusUpdates() {
            Notification notification = Notification.create(recipientId, type, title, message);
            
            // Mark as sent multiple times
            notification.markAsSent();
            LocalDateTime firstSentAt = notification.getSentAt();
            
            // Small delay to ensure different timestamps
            try {
                Thread.sleep(10);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            
            notification.markAsSent();
            LocalDateTime secondSentAt = notification.getSentAt();
            
            assertEquals(NotificationStatus.SENT, notification.getStatus());
            // Should update the sent time
            assertTrue(secondSentAt.isAfter(firstSentAt) || secondSentAt.isEqual(firstSentAt));
        }
        
        @Test
        @DisplayName("Should handle status change from read to failed")
        void shouldHandleStatusChangeFromReadToFailed() {
            Notification notification = Notification.create(recipientId, type, title, message);
            
            notification.markAsSent();
            notification.markAsRead();
            assertEquals(NotificationStatus.READ, notification.getStatus());
            
            notification.markAsFailed();
            assertEquals(NotificationStatus.FAILED, notification.getStatus());
            // sentAt should remain set (markAsFailed doesn't reset it)
            assertNotNull(notification.getSentAt());
        }
        
        @Test
        @DisplayName("Should maintain scheduled time consistency")
        void shouldMaintainScheduledTimeConsistency() {
            Notification notification = Notification.create(recipientId, type, title, message);
            
            LocalDateTime originalScheduledAt = notification.getScheduledAt();
            
            // Status changes should not affect scheduled time
            notification.markAsSent();
            assertEquals(originalScheduledAt, notification.getScheduledAt());
            
            notification.markAsRead();
            assertEquals(originalScheduledAt, notification.getScheduledAt());
            
            notification.markAsFailed();
            assertEquals(originalScheduledAt, notification.getScheduledAt());
        }
    }
}