package com.oneeats.shared.domain.vo;

import com.oneeats.shared.domain.exception.ValidationException;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Email Value Object Tests")
class EmailTest {
    
    @Nested
    @DisplayName("Email Creation")
    class EmailCreation {
        
        @ParameterizedTest
        @ValueSource(strings = {
            "user@example.com",
            "test.email@domain.org",
            "user+tag@example.com",
            "user123@test-domain.co.uk",
            "a@b.com",
            "very.long.email.address@very.long.domain.name.example.org"
        })
        @DisplayName("Should create email with valid formats")
        void shouldCreateEmailWithValidFormats(String validEmail) {
            Email email = new Email(validEmail);
            assertEquals(validEmail.toLowerCase().trim(), email.getValue());
        }
        
        @Test
        @DisplayName("Should convert to lowercase and trim")
        void shouldConvertToLowercaseAndTrim() {
            Email email = new Email("USER@EXAMPLE.COM");
            assertEquals("user@example.com", email.getValue());
        }
        
        @Test
        @DisplayName("Should handle complex valid emails")
        void shouldHandleComplexValidEmails() {
            Email email1 = new Email("user.name+tag@example.com");
            Email email2 = new Email("x@example-domain.com");
            Email email3 = new Email("user123@sub.domain.org");
            
            assertEquals("user.name+tag@example.com", email1.getValue());
            assertEquals("x@example-domain.com", email2.getValue());
            assertEquals("user123@sub.domain.org", email3.getValue());
        }
    }
    
    @Nested
    @DisplayName("Email Validation")
    class EmailValidation {
        
        @Test
        @DisplayName("Should throw exception for null email")
        void shouldThrowExceptionForNullEmail() {
            ValidationException exception = assertThrows(ValidationException.class, () ->
                new Email(null));
            assertEquals("Email cannot be null or empty", exception.getMessage());
        }
        
        @Test
        @DisplayName("Should throw exception for empty email")
        void shouldThrowExceptionForEmptyEmail() {
            ValidationException exception = assertThrows(ValidationException.class, () ->
                new Email(""));
            assertEquals("Email cannot be null or empty", exception.getMessage());
        }
        
        @Test
        @DisplayName("Should throw exception for whitespace-only email")
        void shouldThrowExceptionForWhitespaceOnlyEmail() {
            ValidationException exception = assertThrows(ValidationException.class, () ->
                new Email("   "));
            assertEquals("Email cannot be null or empty", exception.getMessage());
        }
        
        @ParameterizedTest
        @ValueSource(strings = {
            "invalid-email",
            "@example.com",
            "user@",
            "user@.com",
            "user@com",
            "user@example.",
            "user name@example.com",
            "user@exam ple.com",
            "user@",
            "@",
            ""
        })
        @DisplayName("Should throw exception for invalid email formats")
        void shouldThrowExceptionForInvalidEmailFormats(String invalidEmail) {
            if (invalidEmail.trim().isEmpty()) {
                ValidationException exception = assertThrows(ValidationException.class, () ->
                    new Email(invalidEmail));
                assertEquals("Email cannot be null or empty", exception.getMessage());
            } else {
                ValidationException exception = assertThrows(ValidationException.class, () ->
                    new Email(invalidEmail));
                assertEquals("Invalid email format: " + invalidEmail, exception.getMessage());
            }
        }
    }
    
    @Nested
    @DisplayName("Email Equality and Hash")
    class EmailEqualityAndHash {
        
        @Test
        @DisplayName("Should be equal when values are equal")
        void shouldBeEqualWhenValuesAreEqual() {
            Email email1 = new Email("user@example.com");
            Email email2 = new Email("USER@EXAMPLE.COM");
            
            assertEquals(email1, email2);
            assertEquals(email1.hashCode(), email2.hashCode());
        }
        
        @Test
        @DisplayName("Should not be equal when values are different")
        void shouldNotBeEqualWhenValuesAreDifferent() {
            Email email1 = new Email("user1@example.com");
            Email email2 = new Email("user2@example.com");
            
            assertNotEquals(email1, email2);
        }
        
        @Test
        @DisplayName("Should not be equal to null")
        void shouldNotBeEqualToNull() {
            Email email = new Email("user@example.com");
            assertNotEquals(email, null);
        }
        
        @Test
        @DisplayName("Should not be equal to different type")
        void shouldNotBeEqualToDifferentType() {
            Email email = new Email("user@example.com");
            assertNotEquals(email, "user@example.com");
        }
        
        @Test
        @DisplayName("Should be equal to itself")
        void shouldBeEqualToItself() {
            Email email = new Email("user@example.com");
            assertEquals(email, email);
        }
        
        @Test
        @DisplayName("Should have consistent hash code")
        void shouldHaveConsistentHashCode() {
            Email email = new Email("user@example.com");
            int hashCode1 = email.hashCode();
            int hashCode2 = email.hashCode();
            assertEquals(hashCode1, hashCode2);
        }
    }
    
    @Nested
    @DisplayName("Email String Representation")
    class EmailStringRepresentation {
        
        @Test
        @DisplayName("Should have meaningful toString")
        void shouldHaveMeaningfulToString() {
            Email email = new Email("user@example.com");
            assertEquals("user@example.com", email.toString());
        }
        
        @Test
        @DisplayName("Should return normalized value in toString")
        void shouldReturnNormalizedValueInToString() {
            Email email = new Email("USER@EXAMPLE.COM");
            assertEquals("user@example.com", email.toString());
        }
    }
    
    @Nested
    @DisplayName("Email Boundary Cases")
    class EmailBoundaryCases {
        
        @Test
        @DisplayName("Should handle minimum valid email")
        void shouldHandleMinimumValidEmail() {
            Email email = new Email("a@b.com");
            assertEquals("a@b.com", email.getValue());
        }
        
        @Test
        @DisplayName("Should handle emails with special characters")
        void shouldHandleEmailsWithSpecialCharacters() {
            Email email1 = new Email("user+tag@example.com");
            Email email2 = new Email("user.name@example.com");
            Email email3 = new Email("user_name@example.com");
            Email email4 = new Email("user-name@example.com");
            
            assertEquals("user+tag@example.com", email1.getValue());
            assertEquals("user.name@example.com", email2.getValue());
            assertEquals("user_name@example.com", email3.getValue());
            assertEquals("user-name@example.com", email4.getValue());
        }
        
        @Test
        @DisplayName("Should handle emails with numbers")
        void shouldHandleEmailsWithNumbers() {
            Email email1 = new Email("user123@example.com");
            Email email2 = new Email("123user@example.com");
            Email email3 = new Email("user@example123.com");
            
            assertEquals("user123@example.com", email1.getValue());
            assertEquals("123user@example.com", email2.getValue());
            assertEquals("user@example123.com", email3.getValue());
        }
        
        @Test
        @DisplayName("Should handle subdomains correctly")
        void shouldHandleSubdomainsCorrectly() {
            Email email1 = new Email("user@mail.example.com");
            Email email2 = new Email("user@sub.domain.example.org");
            
            assertEquals("user@mail.example.com", email1.getValue());
            assertEquals("user@sub.domain.example.org", email2.getValue());
        }
    }
}