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
                parseFlexibleTime(openTime.trim()),
                parseFlexibleTime(closeTime.trim())
            );
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid time format: " + openTime + " - " + closeTime);
        }
    }

    /**
     * Parse time with flexible format support (handles both "9:00" and "09:00")
     */
    private static LocalTime parseFlexibleTime(String timeStr) {
        // Handle various formats: "9:00", "09:00", "9:00:00", "09:00:00"
        if (timeStr.matches("\\d{1,2}:\\d{2}(:\\d{2})?")) {
            // Ensure hour has leading zero for ISO-8601 compliance
            if (timeStr.indexOf(':') == 1) {
                timeStr = "0" + timeStr;
            }
            return LocalTime.parse(timeStr);
        }
        throw new IllegalArgumentException("Invalid time format: " + timeStr);
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