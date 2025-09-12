package com.oneeats.restaurant.domain.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("OpeningHours Tests")
class OpeningHoursTest {
    
    @Nested
    @DisplayName("Construction and Factory Methods")
    class ConstructionAndFactoryMethods {
        
        @Test
        @DisplayName("Should create with constructor")
        void shouldCreateWithConstructor() {
            // Given
            LocalTime openTime = LocalTime.of(9, 0);
            LocalTime closeTime = LocalTime.of(18, 0);
            
            // When
            OpeningHours hours = new OpeningHours(openTime, closeTime);
            
            // Then
            assertEquals(openTime, hours.getOpenTime());
            assertEquals(closeTime, hours.getCloseTime());
            assertTrue(hours.isOpen());
        }
        
        @Test
        @DisplayName("Should create with default constructor")
        void shouldCreateWithDefaultConstructor() {
            // When
            OpeningHours hours = new OpeningHours();
            
            // Then
            assertNull(hours.getOpenTime());
            assertNull(hours.getCloseTime());
            assertFalse(hours.isOpen());
        }
        
        @Test
        @DisplayName("Should create from string times")
        void shouldCreateFromStringTimes() {
            // When
            OpeningHours hours = OpeningHours.of("09:00", "18:30");
            
            // Then
            assertNotNull(hours);
            assertEquals(LocalTime.of(9, 0), hours.getOpenTime());
            assertEquals(LocalTime.of(18, 30), hours.getCloseTime());
            assertTrue(hours.isOpen());
        }
        
        @Test
        @DisplayName("Should create from LocalTime objects")
        void shouldCreateFromLocalTimeObjects() {
            // Given
            LocalTime openTime = LocalTime.of(10, 15);
            LocalTime closeTime = LocalTime.of(19, 45);
            
            // When
            OpeningHours hours = OpeningHours.of(openTime, closeTime);
            
            // Then
            assertNotNull(hours);
            assertEquals(openTime, hours.getOpenTime());
            assertEquals(closeTime, hours.getCloseTime());
            assertTrue(hours.isOpen());
        }
        
        @Test
        @DisplayName("Should return null for null string times")
        void shouldReturnNullForNullStringTimes() {
            assertNull(OpeningHours.of(null, "18:00"));
            assertNull(OpeningHours.of("09:00", null));
            assertNull(OpeningHours.of((String)null, (String)null));
        }
        
        @Test
        @DisplayName("Should return null for empty string times")
        void shouldReturnNullForEmptyStringTimes() {
            assertNull(OpeningHours.of("", "18:00"));
            assertNull(OpeningHours.of("09:00", ""));
            assertNull(OpeningHours.of("", ""));
            assertNull(OpeningHours.of("   ", "18:00")); // Whitespace only
            assertNull(OpeningHours.of("09:00", "   "));
        }
        
        @Test
        @DisplayName("Should return null for null LocalTime objects")
        void shouldReturnNullForNullLocalTimeObjects() {
            assertNull(OpeningHours.of(null, LocalTime.of(18, 0)));
            assertNull(OpeningHours.of(LocalTime.of(9, 0), null));
            assertNull(OpeningHours.of((LocalTime) null, (LocalTime) null));
        }
        
        @Test
        @DisplayName("Should throw exception for invalid time format")
        void shouldThrowExceptionForInvalidTimeFormat() {
            assertThrows(IllegalArgumentException.class, () -> OpeningHours.of("25:00", "18:00"));
            assertThrows(IllegalArgumentException.class, () -> OpeningHours.of("09:60", "18:00"));
            assertThrows(IllegalArgumentException.class, () -> OpeningHours.of("invalid", "18:00"));
            assertThrows(IllegalArgumentException.class, () -> OpeningHours.of("09:00", "invalid"));
        }
    }
    
    @Nested
    @DisplayName("Business Logic")
    class BusinessLogic {
        
        @Test
        @DisplayName("Should be open when both times are set")
        void shouldBeOpenWhenBothTimesAreSet() {
            // Given
            OpeningHours hours = new OpeningHours(LocalTime.of(9, 0), LocalTime.of(18, 0));
            
            // Then
            assertTrue(hours.isOpen());
        }
        
        @Test
        @DisplayName("Should not be open when open time is null")
        void shouldNotBeOpenWhenOpenTimeIsNull() {
            // Given
            OpeningHours hours = new OpeningHours();
            hours.setCloseTime(LocalTime.of(18, 0));
            
            // Then
            assertFalse(hours.isOpen());
        }
        
        @Test
        @DisplayName("Should not be open when close time is null")
        void shouldNotBeOpenWhenCloseTimeIsNull() {
            // Given
            OpeningHours hours = new OpeningHours();
            hours.setOpenTime(LocalTime.of(9, 0));
            
            // Then
            assertFalse(hours.isOpen());
        }
        
        @Test
        @DisplayName("Should not be open when both times are null")
        void shouldNotBeOpenWhenBothTimesAreNull() {
            // Given
            OpeningHours hours = new OpeningHours();
            
            // Then
            assertFalse(hours.isOpen());
        }
    }
    
    @Nested
    @DisplayName("Getters and Setters")
    class GettersAndSetters {
        
        @Test
        @DisplayName("Should set and get open time")
        void shouldSetAndGetOpenTime() {
            // Given
            OpeningHours hours = new OpeningHours();
            LocalTime openTime = LocalTime.of(8, 30);
            
            // When
            hours.setOpenTime(openTime);
            
            // Then
            assertEquals(openTime, hours.getOpenTime());
        }
        
        @Test
        @DisplayName("Should set and get close time")
        void shouldSetAndGetCloseTime() {
            // Given
            OpeningHours hours = new OpeningHours();
            LocalTime closeTime = LocalTime.of(20, 30);
            
            // When
            hours.setCloseTime(closeTime);
            
            // Then
            assertEquals(closeTime, hours.getCloseTime());
        }
    }
    
    @Nested
    @DisplayName("String Representation")
    class StringRepresentation {
        
        @Test
        @DisplayName("Should return formatted string when open")
        void shouldReturnFormattedStringWhenOpen() {
            // Given
            OpeningHours hours = new OpeningHours(LocalTime.of(9, 0), LocalTime.of(18, 30));
            
            // When
            String result = hours.toString();
            
            // Then
            assertEquals("09:00 - 18:30", result);
        }
        
        @Test
        @DisplayName("Should return 'Fermé' when closed")
        void shouldReturnFermeWhenClosed() {
            // Given
            OpeningHours hours = new OpeningHours();
            
            // When
            String result = hours.toString();
            
            // Then
            assertEquals("Fermé", result);
        }
        
        @Test
        @DisplayName("Should return 'Fermé' when partially set")
        void shouldReturnFermeWhenPartiallySet() {
            // Given
            OpeningHours hours1 = new OpeningHours();
            hours1.setOpenTime(LocalTime.of(9, 0)); // Only open time set
            
            OpeningHours hours2 = new OpeningHours();
            hours2.setCloseTime(LocalTime.of(18, 0)); // Only close time set
            
            // Then
            assertEquals("Fermé", hours1.toString());
            assertEquals("Fermé", hours2.toString());
        }
    }
    
    @Nested
    @DisplayName("Edge Cases and Special Times")
    class EdgeCasesAndSpecialTimes {
        
        @Test
        @DisplayName("Should handle midnight times")
        void shouldHandleMidnightTimes() {
            // Given
            OpeningHours hours = new OpeningHours(LocalTime.of(0, 0), LocalTime.of(23, 59));
            
            // Then
            assertTrue(hours.isOpen());
            assertEquals("00:00 - 23:59", hours.toString());
        }
        
        @Test
        @DisplayName("Should handle same open and close times")
        void shouldHandleSameOpenAndCloseTimes() {
            // Given
            LocalTime sameTime = LocalTime.of(12, 0);
            OpeningHours hours = new OpeningHours(sameTime, sameTime);
            
            // Then
            assertTrue(hours.isOpen()); // Still considered open if both times are set
            assertEquals("12:00 - 12:00", hours.toString());
        }
        
        @Test
        @DisplayName("Should handle crossing midnight (open > close)")
        void shouldHandleCrossingMidnight() {
            // Given - Restaurant open 22:00 to 02:00 (crosses midnight)
            OpeningHours hours = new OpeningHours(LocalTime.of(22, 0), LocalTime.of(2, 0));
            
            // Then - Should still be considered open (business logic doesn't validate order)
            assertTrue(hours.isOpen());
            assertEquals("22:00 - 02:00", hours.toString());
        }
        
        @Test
        @DisplayName("Should handle precise minute times")
        void shouldHandlePreciseMinuteTimes() {
            // Given
            OpeningHours hours = OpeningHours.of("09:15", "17:45");
            
            // Then
            assertNotNull(hours);
            assertEquals(LocalTime.of(9, 15), hours.getOpenTime());
            assertEquals(LocalTime.of(17, 45), hours.getCloseTime());
            assertEquals("09:15 - 17:45", hours.toString());
        }
    }
}