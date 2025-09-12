package com.oneeats.order.domain.service;

import com.oneeats.order.domain.repository.IOrderRepository;
import com.oneeats.shared.domain.exception.ValidationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.lang.reflect.Field;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@DisplayName("OrderDomainService Tests")
class OrderDomainServiceTest {
    
    @Mock
    private IOrderRepository orderRepository;
    
    private OrderDomainService orderDomainService;
    
    @BeforeEach
    void setUp() throws Exception {
        MockitoAnnotations.openMocks(this);
        orderDomainService = new OrderDomainService();
        
        // Inject the mock repository using reflection since it's a CDI service
        Field repositoryField = OrderDomainService.class.getDeclaredField("orderRepository");
        repositoryField.setAccessible(true);
        repositoryField.set(orderDomainService, orderRepository);
    }
    
    @Nested
    @DisplayName("Order Number Generation")
    class OrderNumberGeneration {
        
        @Test
        @DisplayName("Should generate order number with correct format")
        void shouldGenerateOrderNumberWithCorrectFormat() {
            when(orderRepository.existsByOrderNumber(anyString())).thenReturn(false);
            
            String orderNumber = orderDomainService.generateOrderNumber();
            
            assertNotNull(orderNumber);
            assertTrue(orderNumber.startsWith("ORD-"));
            assertTrue(orderNumber.matches("ORD-\\d{14}-\\d{3}"));
        }
        
        @Test
        @DisplayName("Should generate unique order numbers")
        void shouldGenerateUniqueOrderNumbers() {
            when(orderRepository.existsByOrderNumber(anyString())).thenReturn(false);
            
            String orderNumber1 = orderDomainService.generateOrderNumber();
            String orderNumber2 = orderDomainService.generateOrderNumber();
            
            assertNotEquals(orderNumber1, orderNumber2);
        }
        
        @Test
        @DisplayName("Should regenerate order number if duplicate exists")
        void shouldRegenerateOrderNumberIfDuplicateExists() {
            // First call returns true (duplicate), second call returns false (unique)
            when(orderRepository.existsByOrderNumber(anyString()))
                .thenReturn(true)
                .thenReturn(false);
            
            String orderNumber = orderDomainService.generateOrderNumber();
            
            assertNotNull(orderNumber);
            verify(orderRepository, times(2)).existsByOrderNumber(anyString());
        }
        
        @Test
        @DisplayName("Should handle multiple duplicates")
        void shouldHandleMultipleDuplicates() {
            // First three calls return true (duplicates), fourth call returns false (unique)
            when(orderRepository.existsByOrderNumber(anyString()))
                .thenReturn(true)
                .thenReturn(true) 
                .thenReturn(true)
                .thenReturn(false);
            
            String orderNumber = orderDomainService.generateOrderNumber();
            
            assertNotNull(orderNumber);
            verify(orderRepository, times(4)).existsByOrderNumber(anyString());
        }
        
        @Test
        @DisplayName("Should contain timestamp in order number")
        void shouldContainTimestampInOrderNumber() {
            when(orderRepository.existsByOrderNumber(anyString())).thenReturn(false);
            
            String orderNumber = orderDomainService.generateOrderNumber();
            
            // Extract timestamp part (after "ORD-" and before the last "-")
            String[] parts = orderNumber.split("-");
            assertEquals(3, parts.length);
            
            String timestamp = parts[1];
            assertEquals(14, timestamp.length()); // yyyyMMddHHmmss format
            assertTrue(timestamp.matches("\\d{14}"));
        }
        
        @Test
        @DisplayName("Should contain random number in order number")
        void shouldContainRandomNumberInOrderNumber() {
            when(orderRepository.existsByOrderNumber(anyString())).thenReturn(false);
            
            String orderNumber = orderDomainService.generateOrderNumber();
            
            // Extract random number part (after the last "-")
            String[] parts = orderNumber.split("-");
            String randomPart = parts[2];
            
            assertEquals(3, randomPart.length());
            assertTrue(randomPart.matches("\\d{3}"));
            
            int randomNumber = Integer.parseInt(randomPart);
            assertTrue(randomNumber >= 100 && randomNumber <= 999);
        }
    }
    
    @Nested
    @DisplayName("Order Creation Validation")
    class OrderCreationValidation {
        
        @Test
        @DisplayName("Should validate order creation successfully with valid order number")
        void shouldValidateOrderCreationSuccessfullyWithValidOrderNumber() {
            String validOrderNumber = "ORD-20230101120000-123";
            when(orderRepository.existsByOrderNumber(validOrderNumber)).thenReturn(false);
            
            assertDoesNotThrow(() -> orderDomainService.validateOrderCreation(validOrderNumber));
            
            verify(orderRepository).existsByOrderNumber(validOrderNumber);
        }
        
        @Test
        @DisplayName("Should throw exception for null order number")
        void shouldThrowExceptionForNullOrderNumber() {
            ValidationException exception = assertThrows(ValidationException.class, () ->
                orderDomainService.validateOrderCreation(null));
            
            assertEquals("Order number cannot be empty", exception.getMessage());
            verify(orderRepository, never()).existsByOrderNumber(anyString());
        }
        
        @Test
        @DisplayName("Should throw exception for empty order number")
        void shouldThrowExceptionForEmptyOrderNumber() {
            ValidationException exception = assertThrows(ValidationException.class, () ->
                orderDomainService.validateOrderCreation(""));
            
            assertEquals("Order number cannot be empty", exception.getMessage());
            verify(orderRepository, never()).existsByOrderNumber(anyString());
        }
        
        @Test
        @DisplayName("Should throw exception for whitespace-only order number")
        void shouldThrowExceptionForWhitespaceOnlyOrderNumber() {
            ValidationException exception = assertThrows(ValidationException.class, () ->
                orderDomainService.validateOrderCreation("   "));
            
            assertEquals("Order number cannot be empty", exception.getMessage());
            verify(orderRepository, never()).existsByOrderNumber(anyString());
        }
        
        @Test
        @DisplayName("Should throw exception for duplicate order number")
        void shouldThrowExceptionForDuplicateOrderNumber() {
            String duplicateOrderNumber = "ORD-20230101120000-123";
            when(orderRepository.existsByOrderNumber(duplicateOrderNumber)).thenReturn(true);
            
            ValidationException exception = assertThrows(ValidationException.class, () ->
                orderDomainService.validateOrderCreation(duplicateOrderNumber));
            
            assertEquals("Order with this number already exists", exception.getMessage());
            verify(orderRepository).existsByOrderNumber(duplicateOrderNumber);
        }
        
        @Test
        @DisplayName("Should validate order number with spaces")
        void shouldValidateOrderNumberWithSpaces() {
            String orderNumberWithSpaces = "  ORD-20230101120000-123  ";
            when(orderRepository.existsByOrderNumber(orderNumberWithSpaces)).thenReturn(false);
            
            assertDoesNotThrow(() -> orderDomainService.validateOrderCreation(orderNumberWithSpaces));
            
            verify(orderRepository).existsByOrderNumber(orderNumberWithSpaces);
        }
    }
    
    @Nested
    @DisplayName("Service Integration")
    class ServiceIntegration {
        
        @Test
        @DisplayName("Should generate and validate order number in sequence")
        void shouldGenerateAndValidateOrderNumberInSequence() {
            when(orderRepository.existsByOrderNumber(anyString())).thenReturn(false);
            
            // Generate a new order number
            String orderNumber = orderDomainService.generateOrderNumber();
            
            // Validate the same order number
            assertDoesNotThrow(() -> orderDomainService.validateOrderCreation(orderNumber));
            
            // Should have called repository twice - once for generation check, once for validation
            verify(orderRepository, times(2)).existsByOrderNumber(orderNumber);
        }
        
        @Test
        @DisplayName("Should handle repository exceptions gracefully")
        void shouldHandleRepositoryExceptionsGracefully() {
            when(orderRepository.existsByOrderNumber(anyString()))
                .thenThrow(new RuntimeException("Database error"));
            
            // The service should not catch repository exceptions, they should bubble up
            assertThrows(RuntimeException.class, () ->
                orderDomainService.generateOrderNumber());
            
            assertThrows(RuntimeException.class, () ->
                orderDomainService.validateOrderCreation("ORD-20230101120000-123"));
        }
        
        @Test
        @DisplayName("Should work with various order number formats")
        void shouldWorkWithVariousOrderNumberFormats() {
            String customOrderNumber1 = "ORD-20230101120000-999";
            String customOrderNumber2 = "ORD-20991231235959-100";
            
            when(orderRepository.existsByOrderNumber(customOrderNumber1)).thenReturn(false);
            when(orderRepository.existsByOrderNumber(customOrderNumber2)).thenReturn(false);
            
            assertDoesNotThrow(() -> orderDomainService.validateOrderCreation(customOrderNumber1));
            assertDoesNotThrow(() -> orderDomainService.validateOrderCreation(customOrderNumber2));
            
            verify(orderRepository).existsByOrderNumber(customOrderNumber1);
            verify(orderRepository).existsByOrderNumber(customOrderNumber2);
        }
    }
    
    @Nested
    @DisplayName("Order Number Format Validation")
    class OrderNumberFormatValidation {
        
        @Test
        @DisplayName("Should generate order numbers with consistent format across multiple calls")
        void shouldGenerateOrderNumbersWithConsistentFormatAcrossMultipleCalls() {
            when(orderRepository.existsByOrderNumber(anyString())).thenReturn(false);
            
            for (int i = 0; i < 10; i++) {
                String orderNumber = orderDomainService.generateOrderNumber();
                assertTrue(orderNumber.matches("ORD-\\d{14}-\\d{3}"), 
                    "Order number " + orderNumber + " doesn't match expected format");
            }
        }
        
        @Test
        @DisplayName("Should generate order numbers within reasonable time range")
        void shouldGenerateOrderNumbersWithinReasonableTimeRange() {
            when(orderRepository.existsByOrderNumber(anyString())).thenReturn(false);
            
            String orderNumber = orderDomainService.generateOrderNumber();
            String[] parts = orderNumber.split("-");
            String timestampStr = parts[1];
            
            // Extract year from timestamp (first 4 characters)
            int year = Integer.parseInt(timestampStr.substring(0, 4));
            int currentYear = java.time.LocalDateTime.now().getYear();
            
            assertEquals(currentYear, year, "Generated order number should have current year");
        }
    }
}