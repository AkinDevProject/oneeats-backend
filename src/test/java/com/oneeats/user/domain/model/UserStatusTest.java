package com.oneeats.user.domain.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("UserStatus Tests")
class UserStatusTest {
    
    @Test
    @DisplayName("Should return true for ACTIVE status")
    void shouldReturnTrueForActiveStatus() {
        assertTrue(UserStatus.ACTIVE.isActive());
    }
    
    @Test
    @DisplayName("Should return false for INACTIVE status")
    void shouldReturnFalseForInactiveStatus() {
        assertFalse(UserStatus.INACTIVE.isActive());
    }
    
    @Test
    @DisplayName("Should return false for SUSPENDED status")
    void shouldReturnFalseForSuspendedStatus() {
        assertFalse(UserStatus.SUSPENDED.isActive());
    }
    
    @ParameterizedTest
    @EnumSource(UserStatus.class)
    @DisplayName("Should have consistent enum values")
    void shouldHaveConsistentEnumValues(UserStatus status) {
        assertNotNull(status);
        assertNotNull(status.name());
        assertFalse(status.name().isEmpty());
    }
    
    @Test
    @DisplayName("Should have expected enum values")
    void shouldHaveExpectedEnumValues() {
        UserStatus[] values = UserStatus.values();
        assertEquals(3, values.length);
        
        assertEquals(UserStatus.ACTIVE, values[0]);
        assertEquals(UserStatus.INACTIVE, values[1]);
        assertEquals(UserStatus.SUSPENDED, values[2]);
    }
    
    @Test
    @DisplayName("Should support valueOf operations")
    void shouldSupportValueOfOperations() {
        assertEquals(UserStatus.ACTIVE, UserStatus.valueOf("ACTIVE"));
        assertEquals(UserStatus.INACTIVE, UserStatus.valueOf("INACTIVE"));
        assertEquals(UserStatus.SUSPENDED, UserStatus.valueOf("SUSPENDED"));
    }
    
    @Test
    @DisplayName("Should throw exception for invalid valueOf")
    void shouldThrowExceptionForInvalidValueOf() {
        assertThrows(IllegalArgumentException.class, () -> 
            UserStatus.valueOf("INVALID_STATUS"));
    }
}