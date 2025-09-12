package com.oneeats.restaurant.domain.model;

import java.time.LocalTime;

public class OpeningHours {
    private LocalTime openTime;
    private LocalTime closeTime;

    public OpeningHours() {}

    public OpeningHours(LocalTime openTime, LocalTime closeTime) {
        this.openTime = openTime;
        this.closeTime = closeTime;
    }

    public static OpeningHours of(String openTime, String closeTime) {
        if (openTime == null || closeTime == null || openTime.trim().isEmpty() || closeTime.trim().isEmpty()) {
            return null;
        }
        
        try {
            return new OpeningHours(
                LocalTime.parse(openTime),
                LocalTime.parse(closeTime)
            );
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid time format: " + openTime + " - " + closeTime);
        }
    }

    public static OpeningHours of(LocalTime openTime, LocalTime closeTime) {
        if (openTime == null || closeTime == null) {
            return null;
        }
        return new OpeningHours(openTime, closeTime);
    }

    public boolean isOpen() {
        return openTime != null && closeTime != null;
    }

    // Getters and setters
    public LocalTime getOpenTime() { return openTime; }
    public void setOpenTime(LocalTime openTime) { this.openTime = openTime; }
    
    public LocalTime getCloseTime() { return closeTime; }
    public void setCloseTime(LocalTime closeTime) { this.closeTime = closeTime; }

    @Override
    public String toString() {
        if (!isOpen()) return "Fermé";
        return openTime + " - " + closeTime;
    }
}