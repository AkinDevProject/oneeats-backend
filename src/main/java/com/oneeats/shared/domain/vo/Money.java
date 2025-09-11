package com.oneeats.shared.domain.vo;

import com.oneeats.shared.domain.exception.ValidationException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Currency;
import java.util.Objects;

public class Money {
    private final BigDecimal amount;
    private final Currency currency;
    
    public Money(BigDecimal amount, Currency currency) {
        if (amount == null) {
            throw new ValidationException("Amount cannot be null");
        }
        if (currency == null) {
            throw new ValidationException("Currency cannot be null");
        }
        if (amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new ValidationException("Amount cannot be negative");
        }
        this.amount = amount.setScale(currency.getDefaultFractionDigits(), RoundingMode.HALF_UP);
        this.currency = currency;
    }
    
    public static Money euro(BigDecimal amount) {
        return new Money(amount, Currency.getInstance("EUR"));
    }
    
    public static Money dollar(BigDecimal amount) {
        return new Money(amount, Currency.getInstance("USD"));
    }
    
    public Money add(Money other) {
        if (!currency.equals(other.currency)) {
            throw new ValidationException("Cannot add different currencies");
        }
        return new Money(amount.add(other.amount), currency);
    }
    
    public Money subtract(Money other) {
        if (!currency.equals(other.currency)) {
            throw new ValidationException("Cannot subtract different currencies");
        }
        return new Money(amount.subtract(other.amount), currency);
    }
    
    public Money multiply(BigDecimal factor) {
        return new Money(amount.multiply(factor), currency);
    }
    
    public BigDecimal getAmount() {
        return amount;
    }
    
    public Currency getCurrency() {
        return currency;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Money money = (Money) o;
        return Objects.equals(amount, money.amount) && Objects.equals(currency, money.currency);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(amount, currency);
    }
    
    @Override
    public String toString() {
        return amount + " " + currency.getCurrencyCode();
    }
}