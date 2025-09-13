package com.oneeats.unit.restaurant.domain;

import com.oneeats.restaurant.domain.model.OpeningHours;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ✅ TESTS UNITAIRES OPENINGHOURS - Domain Logic Pure
 * - Aucune annotation @QuarkusTest
 * - Aucune injection @Inject
 * - Aucune base de données
 * - Teste UNIQUEMENT la logique métier de la classe OpeningHours
 */
@DisplayName("OpeningHours Unit Tests - Pure Domain Logic")
class OpeningHoursTest {
    
    @Nested
    @DisplayName("Opening Hours Creation")
    class OpeningHoursCreation {
        
        @Test
        @DisplayName("Should create opening hours with LocalTime")
        void shouldCreateOpeningHoursWithLocalTime() {
            // Given
            LocalTime openTime = LocalTime.of(9, 0);
            LocalTime closeTime = LocalTime.of(18, 0);
            
            // When
            OpeningHours hours = new OpeningHours(openTime, closeTime);
            
            // Then
            assertNotNull(hours);
            assertEquals(openTime, hours.getOpenTime());
            assertEquals(closeTime, hours.getCloseTime());
            assertTrue(hours.isOpen());
        }
        
        @Test
        @DisplayName("Should create opening hours with default constructor")
        void shouldCreateOpeningHoursWithDefaultConstructor() {
            // When
            OpeningHours hours = new OpeningHours();
            
            // Then
            assertNotNull(hours);
            assertNull(hours.getOpenTime());
            assertNull(hours.getCloseTime());
            assertFalse(hours.isOpen());
        }
        
        @Test
        @DisplayName("Should create opening hours from string times")
        void shouldCreateOpeningHoursFromStringTimes() {
            // When
            OpeningHours hours = OpeningHours.of("09:00", "18:00");
            
            // Then
            assertNotNull(hours);
            assertEquals(LocalTime.of(9, 0), hours.getOpenTime());
            assertEquals(LocalTime.of(18, 0), hours.getCloseTime());
            assertTrue(hours.isOpen());
        }
        
        @Test
        @DisplayName("Should create opening hours from LocalTime objects")
        void shouldCreateOpeningHoursFromLocalTimeObjects() {
            // Given
            LocalTime openTime = LocalTime.of(10, 30);
            LocalTime closeTime = LocalTime.of(22, 30);
            
            // When
            OpeningHours hours = OpeningHours.of(openTime, closeTime);
            
            // Then
            assertNotNull(hours);
            assertEquals(openTime, hours.getOpenTime());
            assertEquals(closeTime, hours.getCloseTime());
            assertTrue(hours.isOpen());
        }
        
        @Test
        @DisplayName("Should return null for invalid string times")
        void shouldReturnNullForInvalidStringTimes() {
            // When & Then
            assertNull(OpeningHours.of(null, "18:00"));
            assertNull(OpeningHours.of("09:00", null));
            assertNull(OpeningHours.of("", "18:00"));
            assertNull(OpeningHours.of("09:00", ""));
            assertNull(OpeningHours.of("   ", "18:00"));
            assertNull(OpeningHours.of("09:00", "   "));
        }
        
        @Test
        @DisplayName("Should return null for null LocalTime objects")
        void shouldReturnNullForNullLocalTimeObjects() {
            // When & Then
            assertNull(OpeningHours.of((LocalTime) null, LocalTime.of(18, 0)));
            assertNull(OpeningHours.of(LocalTime.of(9, 0), (LocalTime) null));
            assertNull(OpeningHours.of((LocalTime) null, (LocalTime) null));
        }
        
        @Test
        @DisplayName("Should throw exception for malformed time strings")
        void shouldThrowExceptionForMalformedTimeStrings() {
            // When & Then
            assertThrows(IllegalArgumentException.class, () ->
                OpeningHours.of("invalid", "18:00"));
            assertThrows(IllegalArgumentException.class, () ->
                OpeningHours.of("09:00", "invalid"));
            assertThrows(IllegalArgumentException.class, () ->
                OpeningHours.of("25:00", "18:00"));
            assertThrows(IllegalArgumentException.class, () ->
                OpeningHours.of("09:00", "25:00"));
        }
    }
    
    @Nested
    @DisplayName("Opening Status Logic")
    class OpeningStatusLogic {
        
        @Test
        @DisplayName("Should be open when both times are set")
        void shouldBeOpenWhenBothTimesAreSet() {
            // Given
            OpeningHours hours = new OpeningHours(LocalTime.of(8, 0), LocalTime.of(20, 0));
            
            // When & Then
            assertTrue(hours.isOpen());
        }
        
        @Test
        @DisplayName("Should not be open when open time is null")
        void shouldNotBeOpenWhenOpenTimeIsNull() {
            // Given
            OpeningHours hours = new OpeningHours(null, LocalTime.of(18, 0));
            
            // When & Then
            assertFalse(hours.isOpen());
        }
        
        @Test
        @DisplayName("Should not be open when close time is null")
        void shouldNotBeOpenWhenCloseTimeIsNull() {
            // Given
            OpeningHours hours = new OpeningHours(LocalTime.of(9, 0), null);
            
            // When & Then
            assertFalse(hours.isOpen());
        }
        
        @Test
        @DisplayName("Should not be open when both times are null")
        void shouldNotBeOpenWhenBothTimesAreNull() {
            // Given
            OpeningHours hours = new OpeningHours(null, null);
            
            // When & Then
            assertFalse(hours.isOpen());
        }
        
        @Test
        @DisplayName("Should handle same open and close time")
        void shouldHandleSameOpenAndCloseTime() {
            // Given
            LocalTime time = LocalTime.of(12, 0);
            OpeningHours hours = new OpeningHours(time, time);
            
            // When & Then
            assertTrue(hours.isOpen()); // Business rule: same time is still "open"
        }
    }
    
    @Nested
    @DisplayName("Time Validation and Edge Cases")
    class TimeValidationAndEdgeCases {
        
        @Test
        @DisplayName("Should handle midnight times")
        void shouldHandleMidnightTimes() {
            // Given
            OpeningHours midnightOpen = OpeningHours.of("00:00", "23:59");
            OpeningHours midnightClose = OpeningHours.of("06:00", "00:00");
            
            // When & Then
            assertNotNull(midnightOpen);
            assertEquals(LocalTime.MIDNIGHT, midnightOpen.getOpenTime());
            assertEquals(LocalTime.of(23, 59), midnightOpen.getCloseTime());
            
            assertNotNull(midnightClose);
            assertEquals(LocalTime.of(6, 0), midnightClose.getOpenTime());
            assertEquals(LocalTime.MIDNIGHT, midnightClose.getCloseTime());
        }
        
        @Test
        @DisplayName("Should handle various time formats")
        void shouldHandleVariousTimeFormats() {
            // When & Then
            assertNotNull(OpeningHours.of("09:00", "18:00"));
            assertNotNull(OpeningHours.of("9:00", "18:00"));
            assertNotNull(OpeningHours.of("09:30", "18:30"));
            assertNotNull(OpeningHours.of("09:00:00", "18:00:00"));
        }
        
        @Test
        @DisplayName("Should handle edge time values")
        void shouldHandleEdgeTimeValues() {
            // When & Then - Edge cases
            assertNotNull(OpeningHours.of("00:00", "23:59"));
            assertNotNull(OpeningHours.of("23:59", "00:00"));
            assertNotNull(OpeningHours.of("12:00", "12:00"));
        }
        
        @Test
        @DisplayName("Should handle late night hours")
        void shouldHandleLateNightHours() {
            // Given - Restaurant open late into the night
            OpeningHours lateHours = OpeningHours.of("18:00", "02:00");
            
            // When & Then
            assertNotNull(lateHours);
            assertEquals(LocalTime.of(18, 0), lateHours.getOpenTime());
            assertEquals(LocalTime.of(2, 0), lateHours.getCloseTime());
            assertTrue(lateHours.isOpen());
        }
    }
    
    @Nested
    @DisplayName("Getters and Setters")
    class GettersAndSetters {
        
        @Test
        @DisplayName("Should get and set open time")
        void shouldGetAndSetOpenTime() {
            // Given
            OpeningHours hours = new OpeningHours();
            LocalTime newOpenTime = LocalTime.of(10, 0);
            
            // When
            hours.setOpenTime(newOpenTime);
            
            // Then
            assertEquals(newOpenTime, hours.getOpenTime());
        }
        
        @Test
        @DisplayName("Should get and set close time")
        void shouldGetAndSetCloseTime() {
            // Given
            OpeningHours hours = new OpeningHours();
            LocalTime newCloseTime = LocalTime.of(22, 0);
            
            // When
            hours.setCloseTime(newCloseTime);
            
            // Then
            assertEquals(newCloseTime, hours.getCloseTime());
        }
        
        @Test
        @DisplayName("Should handle null values in setters")
        void shouldHandleNullValuesInSetters() {
            // Given
            OpeningHours hours = new OpeningHours(LocalTime.of(9, 0), LocalTime.of(18, 0));
            
            // When
            hours.setOpenTime(null);
            hours.setCloseTime(null);
            
            // Then
            assertNull(hours.getOpenTime());
            assertNull(hours.getCloseTime());
            assertFalse(hours.isOpen());
        }
    }
    
    @Nested
    @DisplayName("String Representation")
    class StringRepresentation {
        
        @Test
        @DisplayName("Should format open hours correctly")
        void shouldFormatOpenHoursCorrectly() {
            // Given
            OpeningHours hours = new OpeningHours(LocalTime.of(9, 0), LocalTime.of(18, 30));
            
            // When
            String formatted = hours.toString();
            
            // Then
            assertEquals("09:00 - 18:30", formatted);
        }
        
        @Test
        @DisplayName("Should show closed when not open")
        void shouldShowClosedWhenNotOpen() {
            // Given
            OpeningHours closedHours = new OpeningHours(null, null);
            
            // When
            String formatted = closedHours.toString();
            
            // Then
            assertEquals("Fermé", formatted);
        }
        
        @Test
        @DisplayName("Should show closed when only open time is null")
        void shouldShowClosedWhenOnlyOpenTimeIsNull() {
            // Given
            OpeningHours hours = new OpeningHours(null, LocalTime.of(18, 0));
            
            // When
            String formatted = hours.toString();
            
            // Then
            assertEquals("Fermé", formatted);
        }
        
        @Test
        @DisplayName("Should show closed when only close time is null")
        void shouldShowClosedWhenOnlyCloseTimeIsNull() {
            // Given
            OpeningHours hours = new OpeningHours(LocalTime.of(9, 0), null);
            
            // When
            String formatted = hours.toString();
            
            // Then
            assertEquals("Fermé", formatted);
        }
        
        @Test
        @DisplayName("Should format midnight times correctly")
        void shouldFormatMidnightTimesCorrectly() {
            // Given
            OpeningHours midnightHours = new OpeningHours(LocalTime.MIDNIGHT, LocalTime.of(23, 59));
            
            // When
            String formatted = midnightHours.toString();
            
            // Then
            assertEquals("00:00 - 23:59", formatted);
        }
    }
    
    @Nested
    @DisplayName("Business Logic Scenarios")
    class BusinessLogicScenarios {
        
        @Test
        @DisplayName("Should handle typical restaurant hours")
        void shouldHandleTypicalRestaurantHours() {
            // Given - Typical lunch and dinner hours
            OpeningHours lunchHours = OpeningHours.of("11:30", "14:30");
            OpeningHours dinnerHours = OpeningHours.of("18:00", "22:00");
            OpeningHours fullDay = OpeningHours.of("08:00", "23:00");
            
            // When & Then
            assertTrue(lunchHours.isOpen());
            assertTrue(dinnerHours.isOpen());
            assertTrue(fullDay.isOpen());
            
            assertEquals("11:30 - 14:30", lunchHours.toString());
            assertEquals("18:00 - 22:00", dinnerHours.toString());
            assertEquals("08:00 - 23:00", fullDay.toString());
        }
        
        @Test
        @DisplayName("Should handle 24-hour restaurant")
        void shouldHandle24HourRestaurant() {
            // Given
            OpeningHours allDay = OpeningHours.of("00:00", "23:59");
            
            // When & Then
            assertTrue(allDay.isOpen());
            assertEquals("00:00 - 23:59", allDay.toString());
        }
        
        @Test
        @DisplayName("Should handle breakfast hours")
        void shouldHandleBreakfastHours() {
            // Given
            OpeningHours earlyHours = OpeningHours.of("06:00", "11:00");
            
            // When & Then
            assertTrue(earlyHours.isOpen());
            assertEquals(LocalTime.of(6, 0), earlyHours.getOpenTime());
            assertEquals(LocalTime.of(11, 0), earlyHours.getCloseTime());
        }
        
        @Test
        @DisplayName("Should handle night club hours")
        void shouldHandleNightClubHours() {
            // Given - Open late night until early morning
            OpeningHours nightHours = OpeningHours.of("22:00", "04:00");
            
            // When & Then
            assertTrue(nightHours.isOpen());
            assertEquals(LocalTime.of(22, 0), nightHours.getOpenTime());
            assertEquals(LocalTime.of(4, 0), nightHours.getCloseTime());
        }
    }
}