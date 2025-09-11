package com.oneeats.menu.domain.vo;

import com.oneeats.shared.domain.exception.ValidationException;
import java.util.Objects;

/**
 * Value Object pour le temps de préparation d'un item de menu
 */
public class PreparationTime {
    private static final int MIN_MINUTES = 1;
    private static final int MAX_MINUTES = 480; // 8 heures maximum
    
    private final int minutes;
    
    public PreparationTime(int minutes) {
        if (minutes < MIN_MINUTES) {
            throw new ValidationException("Preparation time must be at least " + MIN_MINUTES + " minute");
        }
        if (minutes > MAX_MINUTES) {
            throw new ValidationException("Preparation time cannot exceed " + MAX_MINUTES + " minutes");
        }
        this.minutes = minutes;
    }
    
    public static PreparationTime ofMinutes(int minutes) {
        return new PreparationTime(minutes);
    }
    
    public static PreparationTime quick() {
        return new PreparationTime(5);
    }
    
    public static PreparationTime standard() {
        return new PreparationTime(15);
    }
    
    public static PreparationTime slow() {
        return new PreparationTime(30);
    }
    
    public boolean isQuick() {
        return minutes <= 10;
    }
    
    public boolean isSlow() {
        return minutes >= 30;
    }
    
    public PreparationTime add(PreparationTime other) {
        return new PreparationTime(this.minutes + other.minutes);
    }
    
    public int getMinutes() {
        return minutes;
    }
    
    public String getDisplayText() {
        if (minutes < 60) {
            return minutes + " min";
        } else {
            int hours = minutes / 60;
            int remainingMinutes = minutes % 60;
            if (remainingMinutes == 0) {
                return hours + "h";
            }
            return hours + "h" + remainingMinutes + "m";
        }
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PreparationTime that = (PreparationTime) o;
        return minutes == that.minutes;
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(minutes);
    }
    
    @Override
    public String toString() {
        return getDisplayText();
    }
}