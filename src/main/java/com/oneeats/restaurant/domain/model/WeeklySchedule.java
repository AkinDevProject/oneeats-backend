package com.oneeats.restaurant.domain.model;

import java.util.HashMap;
import java.util.Map;

public class WeeklySchedule {
    private Map<DayOfWeek, OpeningHours> schedule;

    public WeeklySchedule() {
        this.schedule = new HashMap<>();
    }

    public void setDaySchedule(DayOfWeek day, OpeningHours hours) {
        schedule.put(day, hours);
    }

    public OpeningHours getDaySchedule(DayOfWeek day) {
        return schedule.get(day);
    }

    public boolean isOpenOnDay(DayOfWeek day) {
        OpeningHours hours = schedule.get(day);
        return hours != null && hours.isOpen();
    }

    public Map<DayOfWeek, OpeningHours> getSchedule() {
        return new HashMap<>(schedule);
    }

    public void setSchedule(Map<DayOfWeek, OpeningHours> schedule) {
        this.schedule = new HashMap<>(schedule);
    }

    public enum DayOfWeek {
        MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY;

        public static DayOfWeek fromString(String day) {
            return switch (day.toLowerCase()) {
                case "monday" -> MONDAY;
                case "tuesday" -> TUESDAY;
                case "wednesday" -> WEDNESDAY;
                case "thursday" -> THURSDAY;
                case "friday" -> FRIDAY;
                case "saturday" -> SATURDAY;
                case "sunday" -> SUNDAY;
                default -> throw new IllegalArgumentException("Invalid day: " + day);
            };
        }
    }
}