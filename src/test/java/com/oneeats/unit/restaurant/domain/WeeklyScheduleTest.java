package com.oneeats.unit.restaurant.domain;

import com.oneeats.restaurant.domain.model.WeeklySchedule;
import com.oneeats.restaurant.domain.model.WeeklySchedule.DayOfWeek;
import com.oneeats.restaurant.domain.model.OpeningHours;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import java.time.LocalTime;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ✅ TESTS UNITAIRES WEEKLYSCHEDULE - Domain Logic Pure
 * - Aucune annotation @QuarkusTest
 * - Aucune injection @Inject
 * - Aucune base de données
 * - Teste UNIQUEMENT la logique métier de la classe WeeklySchedule
 */
@DisplayName("WeeklySchedule Unit Tests - Pure Domain Logic")
class WeeklyScheduleTest {
    
    private WeeklySchedule weeklySchedule;
    private OpeningHours mondayHours;
    private OpeningHours fridayHours;
    
    @BeforeEach
    void setUp() {
        weeklySchedule = new WeeklySchedule();
        mondayHours = new OpeningHours(LocalTime.of(9, 0), LocalTime.of(18, 0));
        fridayHours = new OpeningHours(LocalTime.of(10, 0), LocalTime.of(22, 0));
    }
    
    @Nested
    @DisplayName("Schedule Creation")
    class ScheduleCreation {
        
        @Test
        @DisplayName("Should create empty schedule")
        void shouldCreateEmptySchedule() {
            // When
            WeeklySchedule schedule = new WeeklySchedule();
            
            // Then
            assertNotNull(schedule);
            assertNotNull(schedule.getSchedule());
            assertTrue(schedule.getSchedule().isEmpty());
        }
        
        @Test
        @DisplayName("Should initialize with empty schedule for all days")
        void shouldInitializeWithEmptyScheduleForAllDays() {
            // When & Then
            for (DayOfWeek day : DayOfWeek.values()) {
                assertNull(weeklySchedule.getDaySchedule(day));
                assertFalse(weeklySchedule.isOpenOnDay(day));
            }
        }
    }
    
    @Nested
    @DisplayName("Day Schedule Management")
    class DayScheduleManagement {
        
        @Test
        @DisplayName("Should set day schedule")
        void shouldSetDaySchedule() {
            // When
            weeklySchedule.setDaySchedule(DayOfWeek.MONDAY, mondayHours);
            
            // Then
            assertEquals(mondayHours, weeklySchedule.getDaySchedule(DayOfWeek.MONDAY));
            assertTrue(weeklySchedule.isOpenOnDay(DayOfWeek.MONDAY));
        }
        
        @Test
        @DisplayName("Should get day schedule")
        void shouldGetDaySchedule() {
            // Given
            weeklySchedule.setDaySchedule(DayOfWeek.FRIDAY, fridayHours);
            
            // When
            OpeningHours retrievedHours = weeklySchedule.getDaySchedule(DayOfWeek.FRIDAY);
            
            // Then
            assertEquals(fridayHours, retrievedHours);
            assertEquals(LocalTime.of(10, 0), retrievedHours.getOpenTime());
            assertEquals(LocalTime.of(22, 0), retrievedHours.getCloseTime());
        }
        
        @Test
        @DisplayName("Should return null for unset day schedule")
        void shouldReturnNullForUnsetDaySchedule() {
            // When
            OpeningHours unsetDay = weeklySchedule.getDaySchedule(DayOfWeek.SATURDAY);
            
            // Then
            assertNull(unsetDay);
            assertFalse(weeklySchedule.isOpenOnDay(DayOfWeek.SATURDAY));
        }
        
        @Test
        @DisplayName("Should update existing day schedule")
        void shouldUpdateExistingDaySchedule() {
            // Given
            weeklySchedule.setDaySchedule(DayOfWeek.TUESDAY, mondayHours);
            OpeningHours newHours = new OpeningHours(LocalTime.of(8, 0), LocalTime.of(20, 0));
            
            // When
            weeklySchedule.setDaySchedule(DayOfWeek.TUESDAY, newHours);
            
            // Then
            assertEquals(newHours, weeklySchedule.getDaySchedule(DayOfWeek.TUESDAY));
            assertEquals(LocalTime.of(8, 0), weeklySchedule.getDaySchedule(DayOfWeek.TUESDAY).getOpenTime());
        }
    }
    
    @Nested
    @DisplayName("Opening Status Queries")
    class OpeningStatusQueries {
        
        @Test
        @DisplayName("Should be open on day with valid hours")
        void shouldBeOpenOnDayWithValidHours() {
            // Given
            weeklySchedule.setDaySchedule(DayOfWeek.WEDNESDAY, mondayHours);
            
            // When & Then
            assertTrue(weeklySchedule.isOpenOnDay(DayOfWeek.WEDNESDAY));
        }
        
        @Test
        @DisplayName("Should not be open on day without schedule")
        void shouldNotBeOpenOnDayWithoutSchedule() {
            // When & Then
            assertFalse(weeklySchedule.isOpenOnDay(DayOfWeek.SUNDAY));
        }
        
        @Test
        @DisplayName("Should not be open on day with closed hours")
        void shouldNotBeOpenOnDayWithClosedHours() {
            // Given - Closed hours (null times)
            OpeningHours closedHours = new OpeningHours(null, null);
            weeklySchedule.setDaySchedule(DayOfWeek.THURSDAY, closedHours);
            
            // When & Then
            assertFalse(weeklySchedule.isOpenOnDay(DayOfWeek.THURSDAY));
        }
        
        @Test
        @DisplayName("Should handle mixed open and closed days")
        void shouldHandleMixedOpenAndClosedDays() {
            // Given
            weeklySchedule.setDaySchedule(DayOfWeek.MONDAY, mondayHours); // Open
            weeklySchedule.setDaySchedule(DayOfWeek.TUESDAY, fridayHours); // Open
            // Wednesday - not set (closed)
            weeklySchedule.setDaySchedule(DayOfWeek.THURSDAY, new OpeningHours(null, null)); // Closed
            weeklySchedule.setDaySchedule(DayOfWeek.FRIDAY, fridayHours); // Open
            
            // When & Then
            assertTrue(weeklySchedule.isOpenOnDay(DayOfWeek.MONDAY));
            assertTrue(weeklySchedule.isOpenOnDay(DayOfWeek.TUESDAY));
            assertFalse(weeklySchedule.isOpenOnDay(DayOfWeek.WEDNESDAY));
            assertFalse(weeklySchedule.isOpenOnDay(DayOfWeek.THURSDAY));
            assertTrue(weeklySchedule.isOpenOnDay(DayOfWeek.FRIDAY));
        }
    }
    
    @Nested
    @DisplayName("Full Schedule Management")
    class FullScheduleManagement {
        
        @Test
        @DisplayName("Should get complete schedule")
        void shouldGetCompleteSchedule() {
            // Given
            weeklySchedule.setDaySchedule(DayOfWeek.MONDAY, mondayHours);
            weeklySchedule.setDaySchedule(DayOfWeek.FRIDAY, fridayHours);
            
            // When
            Map<DayOfWeek, OpeningHours> schedule = weeklySchedule.getSchedule();
            
            // Then
            assertEquals(2, schedule.size());
            assertEquals(mondayHours, schedule.get(DayOfWeek.MONDAY));
            assertEquals(fridayHours, schedule.get(DayOfWeek.FRIDAY));
        }
        
        @Test
        @DisplayName("Should return defensive copy of schedule")
        void shouldReturnDefensiveCopyOfSchedule() {
            // Given
            weeklySchedule.setDaySchedule(DayOfWeek.MONDAY, mondayHours);
            
            // When
            Map<DayOfWeek, OpeningHours> schedule = weeklySchedule.getSchedule();
            schedule.put(DayOfWeek.TUESDAY, fridayHours); // Modify returned map
            
            // Then - Original schedule should not be affected
            assertNull(weeklySchedule.getDaySchedule(DayOfWeek.TUESDAY));
            assertEquals(1, weeklySchedule.getSchedule().size());
        }
        
        @Test
        @DisplayName("Should set complete schedule")
        void shouldSetCompleteSchedule() {
            // Given
            Map<DayOfWeek, OpeningHours> newSchedule = Map.of(
                DayOfWeek.MONDAY, mondayHours,
                DayOfWeek.TUESDAY, fridayHours,
                DayOfWeek.WEDNESDAY, mondayHours
            );
            
            // When
            weeklySchedule.setSchedule(newSchedule);
            
            // Then
            assertEquals(3, weeklySchedule.getSchedule().size());
            assertEquals(mondayHours, weeklySchedule.getDaySchedule(DayOfWeek.MONDAY));
            assertEquals(fridayHours, weeklySchedule.getDaySchedule(DayOfWeek.TUESDAY));
            assertEquals(mondayHours, weeklySchedule.getDaySchedule(DayOfWeek.WEDNESDAY));
        }
        
        @Test
        @DisplayName("Should create defensive copy when setting schedule")
        void shouldCreateDefensiveCopyWhenSettingSchedule() {
            // Given
            Map<DayOfWeek, OpeningHours> originalSchedule = new java.util.HashMap<>();
            originalSchedule.put(DayOfWeek.MONDAY, mondayHours);
            
            // When
            weeklySchedule.setSchedule(originalSchedule);
            originalSchedule.put(DayOfWeek.TUESDAY, fridayHours); // Modify original map
            
            // Then - WeeklySchedule should not be affected
            assertEquals(1, weeklySchedule.getSchedule().size());
            assertNull(weeklySchedule.getDaySchedule(DayOfWeek.TUESDAY));
        }
    }
    
    @Nested
    @DisplayName("DayOfWeek Enum Tests")
    class DayOfWeekEnumTests {
        
        @Test
        @DisplayName("Should have all days of week")
        void shouldHaveAllDaysOfWeek() {
            // When
            DayOfWeek[] days = DayOfWeek.values();
            
            // Then
            assertEquals(7, days.length);
            assertEquals(DayOfWeek.MONDAY, days[0]);
            assertEquals(DayOfWeek.TUESDAY, days[1]);
            assertEquals(DayOfWeek.WEDNESDAY, days[2]);
            assertEquals(DayOfWeek.THURSDAY, days[3]);
            assertEquals(DayOfWeek.FRIDAY, days[4]);
            assertEquals(DayOfWeek.SATURDAY, days[5]);
            assertEquals(DayOfWeek.SUNDAY, days[6]);
        }
        
        @Test
        @DisplayName("Should parse day from string (case insensitive)")
        void shouldParseDayFromStringCaseInsensitive() {
            // When & Then
            assertEquals(DayOfWeek.MONDAY, DayOfWeek.fromString("monday"));
            assertEquals(DayOfWeek.TUESDAY, DayOfWeek.fromString("TUESDAY"));
            assertEquals(DayOfWeek.WEDNESDAY, DayOfWeek.fromString("Wednesday"));
            assertEquals(DayOfWeek.THURSDAY, DayOfWeek.fromString("ThUrSdAy"));
            assertEquals(DayOfWeek.FRIDAY, DayOfWeek.fromString("friday"));
            assertEquals(DayOfWeek.SATURDAY, DayOfWeek.fromString("SATURDAY"));
            assertEquals(DayOfWeek.SUNDAY, DayOfWeek.fromString("Sunday"));
        }
        
        @Test
        @DisplayName("Should throw exception for invalid day string")
        void shouldThrowExceptionForInvalidDayString() {
            // When & Then
            assertThrows(IllegalArgumentException.class, () ->
                DayOfWeek.fromString("invalid"));
            assertThrows(IllegalArgumentException.class, () ->
                DayOfWeek.fromString(""));
            assertThrows(IllegalArgumentException.class, () ->
                DayOfWeek.fromString("mon"));
        }
        
        @Test
        @DisplayName("Should handle null day string")
        void shouldHandleNullDayString() {
            // When & Then
            assertThrows(NullPointerException.class, () ->
                DayOfWeek.fromString(null));
        }
    }
    
    @Nested
    @DisplayName("Business Logic Scenarios")
    class BusinessLogicScenarios {
        
        @Test
        @DisplayName("Should handle typical restaurant schedule")
        void shouldHandleTypicalRestaurantSchedule() {
            // Given - Typical restaurant: closed Sunday/Monday, open Tue-Sat
            weeklySchedule.setDaySchedule(DayOfWeek.TUESDAY, new OpeningHours(LocalTime.of(11, 0), LocalTime.of(22, 0)));
            weeklySchedule.setDaySchedule(DayOfWeek.WEDNESDAY, new OpeningHours(LocalTime.of(11, 0), LocalTime.of(22, 0)));
            weeklySchedule.setDaySchedule(DayOfWeek.THURSDAY, new OpeningHours(LocalTime.of(11, 0), LocalTime.of(22, 0)));
            weeklySchedule.setDaySchedule(DayOfWeek.FRIDAY, new OpeningHours(LocalTime.of(11, 0), LocalTime.of(23, 0)));
            weeklySchedule.setDaySchedule(DayOfWeek.SATURDAY, new OpeningHours(LocalTime.of(11, 0), LocalTime.of(23, 0)));
            
            // When & Then
            assertFalse(weeklySchedule.isOpenOnDay(DayOfWeek.SUNDAY)); // Closed
            assertFalse(weeklySchedule.isOpenOnDay(DayOfWeek.MONDAY)); // Closed
            assertTrue(weeklySchedule.isOpenOnDay(DayOfWeek.TUESDAY)); // Open
            assertTrue(weeklySchedule.isOpenOnDay(DayOfWeek.WEDNESDAY)); // Open
            assertTrue(weeklySchedule.isOpenOnDay(DayOfWeek.THURSDAY)); // Open
            assertTrue(weeklySchedule.isOpenOnDay(DayOfWeek.FRIDAY)); // Open (later)
            assertTrue(weeklySchedule.isOpenOnDay(DayOfWeek.SATURDAY)); // Open (later)
            
            assertEquals(5, weeklySchedule.getSchedule().size());
        }
        
        @Test
        @DisplayName("Should handle 24/7 restaurant")
        void shouldHandle24_7Restaurant() {
            // Given - 24/7 restaurant
            OpeningHours allDay = new OpeningHours(LocalTime.of(0, 0), LocalTime.of(23, 59));
            
            for (DayOfWeek day : DayOfWeek.values()) {
                weeklySchedule.setDaySchedule(day, allDay);
            }
            
            // When & Then
            for (DayOfWeek day : DayOfWeek.values()) {
                assertTrue(weeklySchedule.isOpenOnDay(day));
                assertEquals(allDay, weeklySchedule.getDaySchedule(day));
            }
            
            assertEquals(7, weeklySchedule.getSchedule().size());
        }
        
        @Test
        @DisplayName("Should handle different hours for weekend")
        void shouldHandleDifferentHoursForWeekend() {
            // Given - Different hours for weekend
            OpeningHours weekdayHours = new OpeningHours(LocalTime.of(9, 0), LocalTime.of(18, 0));
            OpeningHours weekendHours = new OpeningHours(LocalTime.of(10, 0), LocalTime.of(16, 0));
            
            // Weekdays
            weeklySchedule.setDaySchedule(DayOfWeek.MONDAY, weekdayHours);
            weeklySchedule.setDaySchedule(DayOfWeek.TUESDAY, weekdayHours);
            weeklySchedule.setDaySchedule(DayOfWeek.WEDNESDAY, weekdayHours);
            weeklySchedule.setDaySchedule(DayOfWeek.THURSDAY, weekdayHours);
            weeklySchedule.setDaySchedule(DayOfWeek.FRIDAY, weekdayHours);
            
            // Weekend
            weeklySchedule.setDaySchedule(DayOfWeek.SATURDAY, weekendHours);
            weeklySchedule.setDaySchedule(DayOfWeek.SUNDAY, weekendHours);
            
            // When & Then
            assertEquals(LocalTime.of(9, 0), weeklySchedule.getDaySchedule(DayOfWeek.MONDAY).getOpenTime());
            assertEquals(LocalTime.of(18, 0), weeklySchedule.getDaySchedule(DayOfWeek.FRIDAY).getCloseTime());
            assertEquals(LocalTime.of(10, 0), weeklySchedule.getDaySchedule(DayOfWeek.SATURDAY).getOpenTime());
            assertEquals(LocalTime.of(16, 0), weeklySchedule.getDaySchedule(DayOfWeek.SUNDAY).getCloseTime());
        }
    }
}