package com.oneeats.menu.domain.vo;

import com.oneeats.shared.domain.exception.ValidationException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

/**
 * Value Object pour le prix d'un item de menu
 */
public class Price {
    private static final BigDecimal MIN_PRICE = BigDecimal.ZERO;
    private static final BigDecimal MAX_PRICE = new BigDecimal("9999.99");
    private static final int SCALE = 2;
    
    private final BigDecimal amount;
    
    public Price(BigDecimal amount) {
        if (amount == null) {
            throw new ValidationException("Price amount cannot be null");
        }
        
        if (amount.compareTo(MIN_PRICE) < 0) {
            throw new ValidationException("Price cannot be negative");
        }
        
        if (amount.compareTo(MAX_PRICE) > 0) {
            throw new ValidationException("Price cannot exceed " + MAX_PRICE);
        }
        
        this.amount = amount.setScale(SCALE, RoundingMode.HALF_UP);
    }
    
    public static Price of(BigDecimal amount) {
        return new Price(amount);
    }
    
    public static Price of(double amount) {
        return new Price(BigDecimal.valueOf(amount));
    }
    
    public Price add(Price other) {
        return new Price(this.amount.add(other.amount));
    }
    
    public Price multiply(int factor) {
        return new Price(this.amount.multiply(BigDecimal.valueOf(factor)));
    }
    
    public Price multiply(BigDecimal factor) {
        return new Price(this.amount.multiply(factor));
    }
    
    public boolean isGreaterThan(Price other) {
        return this.amount.compareTo(other.amount) > 0;
    }
    
    public boolean isZero() {
        return this.amount.compareTo(BigDecimal.ZERO) == 0;
    }
    
    public BigDecimal getAmount() {
        return amount;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Price price = (Price) o;
        return Objects.equals(amount, price.amount);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(amount);
    }
    
    @Override
    public String toString() {
        return amount.toString();
    }
}