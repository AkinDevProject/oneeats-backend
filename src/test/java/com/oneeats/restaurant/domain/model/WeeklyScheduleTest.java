package com.oneeats.restaurant.domain.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("WeeklySchedule Tests")
class WeeklyScheduleTest {
    
    private WeeklySchedule schedule;
    
    @BeforeEach
    void setUp() {
        schedule = new WeeklySchedule();
    }
    
    @Nested
    @DisplayName("Schedule Management")
    class ScheduleManagement {
        
        @Test
        @DisplayName("Should initialize with empty schedule")
        void shouldInitializeWithEmptySchedule() {
            // Then
            assertNotNull(schedule.getSchedule());
            assertTrue(schedule.getSchedule().isEmpty());
        }
        
        @Test
        @DisplayName("Should set day schedule")
        void shouldSetDaySchedule() {
            // Given
            OpeningHours hours = new OpeningHours(LocalTime.of(9, 0), LocalTime.of(18, 0));
            
            // When
            schedule.setDaySchedule(WeeklySchedule.DayOfWeek.MONDAY, hours);
            
            // Then
            assertEquals(hours, schedule.getDaySchedule(WeeklySchedule.DayOfWeek.MONDAY));
        }
        
        @Test
        @DisplayName("Should handle closed day (null hours)")
        void shouldHandleClosedDayNullHours() {
            // When
            schedule.setDaySchedule(WeeklySchedule.DayOfWeek.SUNDAY, null);
            
            // Then
            assertNull(schedule.getDaySchedule(WeeklySchedule.DayOfWeek.SUNDAY));
            assertFalse(schedule.isOpenOnDay(WeeklySchedule.DayOfWeek.SUNDAY));
        }
        
        @Test
        @DisplayName("Should check if open on specific day")
        void shouldCheckIfOpenOnSpecificDay() {
            // Given
            OpeningHours openHours = new OpeningHours(LocalTime.of(9, 0), LocalTime.of(18, 0));
            OpeningHours closedHours = new OpeningHours(); // no times set
            
            // When
            schedule.setDaySchedule(WeeklySchedule.DayOfWeek.MONDAY, openHours);
            schedule.setDaySchedule(WeeklySchedule.DayOfWeek.TUESDAY, closedHours);
            schedule.setDaySchedule(WeeklySchedule.DayOfWeek.WEDNESDAY, null);
            
            // Then
            assertTrue(schedule.isOpenOnDay(WeeklySchedule.DayOfWeek.MONDAY));
            assertFalse(schedule.isOpenOnDay(WeeklySchedule.DayOfWeek.TUESDAY)); // closed hours
            assertFalse(schedule.isOpenOnDay(WeeklySchedule.DayOfWeek.WEDNESDAY)); // null hours
            assertFalse(schedule.isOpenOnDay(WeeklySchedule.DayOfWeek.THURSDAY)); // not set
        }
        
        @Test
        @DisplayName("Should return defensive copy of schedule")
        void shouldReturnDefensiveCopyOfSchedule() {
            // Given
            OpeningHours hours = new OpeningHours(LocalTime.of(9, 0), LocalTime.of(18, 0));
            schedule.setDaySchedule(WeeklySchedule.DayOfWeek.MONDAY, hours);
            
            // When
            Map<WeeklySchedule.DayOfWeek, OpeningHours> retrievedSchedule = schedule.getSchedule();
            retrievedSchedule.clear(); // Try to modify
            
            // Then
            assertFalse(schedule.getSchedule().isEmpty()); // Original should be unchanged
            assertEquals(hours, schedule.getDaySchedule(WeeklySchedule.DayOfWeek.MONDAY));
        }
        
        @Test
        @DisplayName("Should set entire schedule from map")
        void shouldSetEntireScheduleFromMap() {
            // Given
            Map<WeeklySchedule.DayOfWeek, OpeningHours> newSchedule = new HashMap<>();
            newSchedule.put(WeeklySchedule.DayOfWeek.MONDAY, new OpeningHours(LocalTime.of(9, 0), LocalTime.of(18, 0)));
            newSchedule.put(WeeklySchedule.DayOfWeek.TUESDAY, new OpeningHours(LocalTime.of(10, 0), LocalTime.of(19, 0)));
            newSchedule.put(WeeklySchedule.DayOfWeek.SUNDAY, null); // Closed
            
            // When
            schedule.setSchedule(newSchedule);
            
            // Then
            assertEquals(3, schedule.getSchedule().size());
            assertTrue(schedule.isOpenOnDay(WeeklySchedule.DayOfWeek.MONDAY));
            assertTrue(schedule.isOpenOnDay(WeeklySchedule.DayOfWeek.TUESDAY));
            assertFalse(schedule.isOpenOnDay(WeeklySchedule.DayOfWeek.SUNDAY));
            assertFalse(schedule.isOpenOnDay(WeeklySchedule.DayOfWeek.WEDNESDAY)); // Not set
        }
        
        @Test
        @DisplayName("Should create defensive copy when setting schedule")
        void shouldCreateDefensiveCopyWhenSettingSchedule() {
            // Given
            Map<WeeklySchedule.DayOfWeek, OpeningHours> externalSchedule = new HashMap<>();
            externalSchedule.put(WeeklySchedule.DayOfWeek.MONDAY, new OpeningHours(LocalTime.of(9, 0), LocalTime.of(18, 0)));
            
            // When
            schedule.setSchedule(externalSchedule);
            externalSchedule.clear(); // Modify external map
            
            // Then
            assertFalse(schedule.getSchedule().isEmpty()); // Internal should be unchanged
            assertTrue(schedule.isOpenOnDay(WeeklySchedule.DayOfWeek.MONDAY));
        }
    }
    
    @Nested
    @DisplayName("DayOfWeek Enum Tests")
    class DayOfWeekEnumTests {
        
        @Test
        @DisplayName("Should parse valid day names")
        void shouldParseValidDayNames() {
            assertEquals(WeeklySchedule.DayOfWeek.MONDAY, WeeklySchedule.DayOfWeek.fromString("monday"));
            assertEquals(WeeklySchedule.DayOfWeek.TUESDAY, WeeklySchedule.DayOfWeek.fromString("tuesday"));
            assertEquals(WeeklySchedule.DayOfWeek.WEDNESDAY, WeeklySchedule.DayOfWeek.fromString("wednesday"));
            assertEquals(WeeklySchedule.DayOfWeek.THURSDAY, WeeklySchedule.DayOfWeek.fromString("thursday"));
            assertEquals(WeeklySchedule.DayOfWeek.FRIDAY, WeeklySchedule.DayOfWeek.fromString("friday"));
            assertEquals(WeeklySchedule.DayOfWeek.SATURDAY, WeeklySchedule.DayOfWeek.fromString("saturday"));
            assertEquals(WeeklySchedule.DayOfWeek.SUNDAY, WeeklySchedule.DayOfWeek.fromString("sunday"));
        }
        
        @Test
        @DisplayName("Should parse case-insensitive day names")
        void shouldParseCaseInsensitiveDayNames() {
            assertEquals(WeeklySchedule.DayOfWeek.MONDAY, WeeklySchedule.DayOfWeek.fromString("MONDAY"));
            assertEquals(WeeklySchedule.DayOfWeek.TUESDAY, WeeklySchedule.DayOfWeek.fromString("Tuesday"));
            assertEquals(WeeklySchedule.DayOfWeek.WEDNESDAY, WeeklySchedule.DayOfWeek.fromString("WeDnEsDay"));
        }
        
        @Test
        @DisplayName("Should throw exception for invalid day name")
        void shouldThrowExceptionForInvalidDayName() {
            assertThrows(IllegalArgumentException.class, () -> 
                WeeklySchedule.DayOfWeek.fromString("invalid"));
            assertThrows(IllegalArgumentException.class, () -> 
                WeeklySchedule.DayOfWeek.fromString(""));
            assertThrows(IllegalArgumentException.class, () -> 
                WeeklySchedule.DayOfWeek.fromString("lundi")); // French
        }
    }
    
    @Nested
    @DisplayName("Complete Week Schedule Tests")
    class CompleteWeekScheduleTests {
        
        @Test
        @DisplayName("Should handle typical restaurant schedule")
        void shouldHandleTypicalRestaurantSchedule() {
            // Given - Typical restaurant: Monday-Saturday open, Sunday closed
            OpeningHours weekdayHours = new OpeningHours(LocalTime.of(11, 0), LocalTime.of(22, 0));
            OpeningHours weekendHours = new OpeningHours(LocalTime.of(12, 0), LocalTime.of(23, 0));
            
            // When
            schedule.setDaySchedule(WeeklySchedule.DayOfWeek.MONDAY, weekdayHours);
            schedule.setDaySchedule(WeeklySchedule.DayOfWeek.TUESDAY, weekdayHours);
            schedule.setDaySchedule(WeeklySchedule.DayOfWeek.WEDNESDAY, weekdayHours);
            schedule.setDaySchedule(WeeklySchedule.DayOfWeek.THURSDAY, weekdayHours);
            schedule.setDaySchedule(WeeklySchedule.DayOfWeek.FRIDAY, weekdayHours);
            schedule.setDaySchedule(WeeklySchedule.DayOfWeek.SATURDAY, weekendHours);
            schedule.setDaySchedule(WeeklySchedule.DayOfWeek.SUNDAY, null); // Closed
            
            // Then
            assertTrue(schedule.isOpenOnDay(WeeklySchedule.DayOfWeek.MONDAY));
            assertTrue(schedule.isOpenOnDay(WeeklySchedule.DayOfWeek.TUESDAY));
            assertTrue(schedule.isOpenOnDay(WeeklySchedule.DayOfWeek.WEDNESDAY));
            assertTrue(schedule.isOpenOnDay(WeeklySchedule.DayOfWeek.THURSDAY));
            assertTrue(schedule.isOpenOnDay(WeeklySchedule.DayOfWeek.FRIDAY));
            assertTrue(schedule.isOpenOnDay(WeeklySchedule.DayOfWeek.SATURDAY));
            assertFalse(schedule.isOpenOnDay(WeeklySchedule.DayOfWeek.SUNDAY));
            
            assertEquals(7, schedule.getSchedule().size()); // All days set (including closed Sunday)
        }
        
        @Test
        @DisplayName("Should handle all-closed restaurant")
        void shouldHandleAllClosedRestaurant() {
            // When - Set all days as closed
            for (WeeklySchedule.DayOfWeek day : WeeklySchedule.DayOfWeek.values()) {
                schedule.setDaySchedule(day, null);
            }
            
            // Then
            for (WeeklySchedule.DayOfWeek day : WeeklySchedule.DayOfWeek.values()) {
                assertFalse(schedule.isOpenOnDay(day));
            }
        }
        
        @Test
        @DisplayName("Should handle 24/7 restaurant")
        void shouldHandle24_7Restaurant() {
            // Given
            OpeningHours alwaysOpen = new OpeningHours(LocalTime.of(0, 0), LocalTime.of(23, 59));
            
            // When
            for (WeeklySchedule.DayOfWeek day : WeeklySchedule.DayOfWeek.values()) {
                schedule.setDaySchedule(day, alwaysOpen);
            }
            
            // Then
            for (WeeklySchedule.DayOfWeek day : WeeklySchedule.DayOfWeek.values()) {
                assertTrue(schedule.isOpenOnDay(day));
                assertEquals(alwaysOpen, schedule.getDaySchedule(day));
            }
        }
    }
}