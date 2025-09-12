package com.oneeats.menu.domain.vo;

import com.oneeats.shared.domain.exception.ValidationException;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Price Value Object Tests")
class PriceTest {
    
    @Nested
    @DisplayName("Price Creation")
    class PriceCreation {
        
        @Test
        @DisplayName("Should create price with valid BigDecimal")
        void shouldCreatePriceWithValidBigDecimal() {
            // Given
            BigDecimal amount = new BigDecimal("12.99");
            
            // When
            Price price = new Price(amount);
            
            // Then
            assertEquals(new BigDecimal("12.99"), price.getAmount());
        }
        
        @Test
        @DisplayName("Should create price with factory method using BigDecimal")
        void shouldCreatePriceWithFactoryMethodUsingBigDecimal() {
            // Given
            BigDecimal amount = new BigDecimal("25.50");
            
            // When
            Price price = Price.of(amount);
            
            // Then
            assertEquals(new BigDecimal("25.50"), price.getAmount());
        }
        
        @Test
        @DisplayName("Should create price with factory method using double")
        void shouldCreatePriceWithFactoryMethodUsingDouble() {
            // Given
            double amount = 15.75;
            
            // When
            Price price = Price.of(amount);
            
            // Then
            assertEquals(new BigDecimal("15.75"), price.getAmount());
        }
        
        @Test
        @DisplayName("Should round to 2 decimal places")
        void shouldRoundTo2DecimalPlaces() {
            // Given
            BigDecimal amount = new BigDecimal("12.999");
            
            // When
            Price price = new Price(amount);
            
            // Then
            assertEquals(new BigDecimal("13.00"), price.getAmount());
        }
        
        @Test
        @DisplayName("Should handle zero price")
        void shouldHandleZeroPrice() {
            // Given
            BigDecimal amount = BigDecimal.ZERO;
            
            // When
            Price price = new Price(amount);
            
            // Then
            assertEquals(new BigDecimal("0.00"), price.getAmount());
            assertTrue(price.isZero());
        }
        
        @Test
        @DisplayName("Should handle maximum allowed price")
        void shouldHandleMaximumAllowedPrice() {
            // Given
            BigDecimal amount = new BigDecimal("9999.99");
            
            // When
            Price price = new Price(amount);
            
            // Then
            assertEquals(new BigDecimal("9999.99"), price.getAmount());
        }
    }
    
    @Nested
    @DisplayName("Price Validation")
    class PriceValidation {
        
        @Test
        @DisplayName("Should throw exception for null amount")
        void shouldThrowExceptionForNullAmount() {
            ValidationException exception = assertThrows(ValidationException.class, () ->
                new Price(null));
            assertEquals("Price amount cannot be null", exception.getMessage());
        }
        
        @Test
        @DisplayName("Should throw exception for negative amount")
        void shouldThrowExceptionForNegativeAmount() {
            ValidationException exception = assertThrows(ValidationException.class, () ->
                new Price(new BigDecimal("-1.00")));
            assertEquals("Price cannot be negative", exception.getMessage());
        }
        
        @Test
        @DisplayName("Should throw exception for amount exceeding maximum")
        void shouldThrowExceptionForAmountExceedingMaximum() {
            ValidationException exception = assertThrows(ValidationException.class, () ->
                new Price(new BigDecimal("10000.00")));
            assertEquals("Price cannot exceed 9999.99", exception.getMessage());
        }
        
        @ParameterizedTest
        @ValueSource(strings = {"-0.01", "-100.00", "-9999.99"})
        @DisplayName("Should reject negative prices")
        void shouldRejectNegativePrices(String negativeAmount) {
            assertThrows(ValidationException.class, () ->
                new Price(new BigDecimal(negativeAmount)));
        }
        
        @ParameterizedTest
        @ValueSource(strings = {"10000.00", "99999.99", "100000.00"})
        @DisplayName("Should reject prices exceeding maximum")
        void shouldRejectPricesExceedingMaximum(String excessiveAmount) {
            assertThrows(ValidationException.class, () ->
                new Price(new BigDecimal(excessiveAmount)));
        }
    }
    
    @Nested
    @DisplayName("Price Operations")
    class PriceOperations {
        
        @Test
        @DisplayName("Should add two prices")
        void shouldAddTwoPrices() {
            // Given
            Price price1 = Price.of(new BigDecimal("10.50"));
            Price price2 = Price.of(new BigDecimal("5.25"));
            
            // When
            Price result = price1.add(price2);
            
            // Then
            assertEquals(new BigDecimal("15.75"), result.getAmount());
        }
        
        @Test
        @DisplayName("Should multiply price by integer factor")
        void shouldMultiplyPriceByIntegerFactor() {
            // Given
            Price price = Price.of(new BigDecimal("12.50"));
            
            // When
            Price result = price.multiply(3);
            
            // Then
            assertEquals(new BigDecimal("37.50"), result.getAmount());
        }
        
        @Test
        @DisplayName("Should multiply price by BigDecimal factor")
        void shouldMultiplyPriceByBigDecimalFactor() {
            // Given
            Price price = Price.of(new BigDecimal("10.00"));
            BigDecimal factor = new BigDecimal("1.5");
            
            // When
            Price result = price.multiply(factor);
            
            // Then
            assertEquals(new BigDecimal("15.00"), result.getAmount());
        }
        
        @Test
        @DisplayName("Should handle addition with zero")
        void shouldHandleAdditionWithZero() {
            // Given
            Price price = Price.of(new BigDecimal("25.00"));
            Price zero = Price.of(BigDecimal.ZERO);
            
            // When
            Price result = price.add(zero);
            
            // Then
            assertEquals(new BigDecimal("25.00"), result.getAmount());
        }
        
        @Test
        @DisplayName("Should handle multiplication by zero")
        void shouldHandleMultiplicationByZero() {
            // Given
            Price price = Price.of(new BigDecimal("25.00"));
            
            // When
            Price result = price.multiply(0);
            
            // Then
            assertEquals(new BigDecimal("0.00"), result.getAmount());
            assertTrue(result.isZero());
        }
        
        @Test
        @DisplayName("Should handle multiplication by one")
        void shouldHandleMultiplicationByOne() {
            // Given
            Price price = Price.of(new BigDecimal("25.00"));
            
            // When
            Price result = price.multiply(1);
            
            // Then
            assertEquals(new BigDecimal("25.00"), result.getAmount());
        }
    }
    
    @Nested
    @DisplayName("Price Comparisons")
    class PriceComparisons {
        
        @Test
        @DisplayName("Should compare prices correctly")
        void shouldComparePricesCorrectly() {
            // Given
            Price higherPrice = Price.of(new BigDecimal("15.00"));
            Price lowerPrice = Price.of(new BigDecimal("10.00"));
            
            // When & Then
            assertTrue(higherPrice.isGreaterThan(lowerPrice));
            assertFalse(lowerPrice.isGreaterThan(higherPrice));
        }
        
        @Test
        @DisplayName("Should return false when comparing equal prices")
        void shouldReturnFalseWhenComparingEqualPrices() {
            // Given
            Price price1 = Price.of(new BigDecimal("15.00"));
            Price price2 = Price.of(new BigDecimal("15.00"));
            
            // When & Then
            assertFalse(price1.isGreaterThan(price2));
            assertFalse(price2.isGreaterThan(price1));
        }
        
        @Test
        @DisplayName("Should identify zero price")
        void shouldIdentifyZeroPrice() {
            // Given
            Price zeroPrice = Price.of(BigDecimal.ZERO);
            Price nonZeroPrice = Price.of(new BigDecimal("10.00"));
            
            // When & Then
            assertTrue(zeroPrice.isZero());
            assertFalse(nonZeroPrice.isZero());
        }
        
        @Test
        @DisplayName("Should handle comparison with very small differences")
        void shouldHandleComparisonWithVerySmallDifferences() {
            // Given
            Price price1 = Price.of(new BigDecimal("10.001"));
            Price price2 = Price.of(new BigDecimal("10.002"));
            
            // When & Then
            // Both should round to 10.00 due to scaling
            assertEquals(new BigDecimal("10.00"), price1.getAmount());
            assertEquals(new BigDecimal("10.00"), price2.getAmount());
            assertFalse(price1.isGreaterThan(price2));
            assertFalse(price2.isGreaterThan(price1));
        }
    }
    
    @Nested
    @DisplayName("Price Equality and Hash")
    class PriceEqualityAndHash {
        
        @Test
        @DisplayName("Should be equal when amounts are equal")
        void shouldBeEqualWhenAmountsAreEqual() {
            // Given
            Price price1 = Price.of(new BigDecimal("12.99"));
            Price price2 = Price.of(new BigDecimal("12.99"));
            
            // When & Then
            assertEquals(price1, price2);
            assertEquals(price1.hashCode(), price2.hashCode());
        }
        
        @Test
        @DisplayName("Should not be equal when amounts are different")
        void shouldNotBeEqualWhenAmountsAreDifferent() {
            // Given
            Price price1 = Price.of(new BigDecimal("12.99"));
            Price price2 = Price.of(new BigDecimal("13.99"));
            
            // When & Then
            assertNotEquals(price1, price2);
        }
        
        @Test
        @DisplayName("Should not be equal to null")
        void shouldNotBeEqualToNull() {
            // Given
            Price price = Price.of(new BigDecimal("12.99"));
            
            // When & Then
            assertNotEquals(price, null);
        }
        
        @Test
        @DisplayName("Should not be equal to different type")
        void shouldNotBeEqualToDifferentType() {
            // Given
            Price price = Price.of(new BigDecimal("12.99"));
            
            // When & Then
            assertNotEquals(price, "12.99");
        }
        
        @Test
        @DisplayName("Should be equal to itself")
        void shouldBeEqualToItself() {
            // Given
            Price price = Price.of(new BigDecimal("12.99"));
            
            // When & Then
            assertEquals(price, price);
        }
        
        @Test
        @DisplayName("Should have consistent hash code")
        void shouldHaveConsistentHashCode() {
            // Given
            Price price = Price.of(new BigDecimal("12.99"));
            
            // When
            int hashCode1 = price.hashCode();
            int hashCode2 = price.hashCode();
            
            // Then
            assertEquals(hashCode1, hashCode2);
        }
    }
    
    @Nested
    @DisplayName("Price String Representation")
    class PriceStringRepresentation {
        
        @Test
        @DisplayName("Should have meaningful toString")
        void shouldHaveMeaningfulToString() {
            // Given
            Price price = Price.of(new BigDecimal("12.99"));
            
            // When
            String toString = price.toString();
            
            // Then
            assertEquals("12.99", toString);
        }
        
        @Test
        @DisplayName("Should format zero correctly")
        void shouldFormatZeroCorrectly() {
            // Given
            Price price = Price.of(BigDecimal.ZERO);
            
            // When
            String toString = price.toString();
            
            // Then
            assertEquals("0.00", toString);
        }
        
        @Test
        @DisplayName("Should format whole numbers with decimals")
        void shouldFormatWholeNumbersWithDecimals() {
            // Given
            Price price = Price.of(new BigDecimal("25"));
            
            // When
            String toString = price.toString();
            
            // Then
            assertEquals("25.00", toString);
        }
    }
    
    @Nested
    @DisplayName("Price Boundary Cases")
    class PriceBoundaryCases {
        
        @Test
        @DisplayName("Should handle edge case near maximum")
        void shouldHandleEdgeCaseNearMaximum() {
            // Given
            BigDecimal nearMax = new BigDecimal("9999.98");
            
            // When
            Price price = Price.of(nearMax);
            
            // Then
            assertEquals(new BigDecimal("9999.98"), price.getAmount());
        }
        
        @Test
        @DisplayName("Should handle very small positive amounts")
        void shouldHandleVerySmallPositiveAmounts() {
            // Given
            BigDecimal verySmall = new BigDecimal("0.01");
            
            // When
            Price price = Price.of(verySmall);
            
            // Then
            assertEquals(new BigDecimal("0.01"), price.getAmount());
            assertFalse(price.isZero());
        }
        
        @Test
        @DisplayName("Should handle rounding edge cases")
        void shouldHandleRoundingEdgeCases() {
            // Given
            BigDecimal amount1 = new BigDecimal("12.125"); // Should round to 12.13
            BigDecimal amount2 = new BigDecimal("12.124"); // Should round to 12.12
            
            // When
            Price price1 = Price.of(amount1);
            Price price2 = Price.of(amount2);
            
            // Then
            assertEquals(new BigDecimal("12.13"), price1.getAmount());
            assertEquals(new BigDecimal("12.12"), price2.getAmount());
        }
    }
}