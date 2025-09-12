package com.oneeats.restaurant.application.dto;

import java.util.Map;

public record ScheduleDTO(
    DayScheduleDTO monday,
    DayScheduleDTO tuesday,
    DayScheduleDTO wednesday,
    DayScheduleDTO thursday,
    DayScheduleDTO friday,
    DayScheduleDTO saturday,
    DayScheduleDTO sunday
) {
    public static record DayScheduleDTO(String open, String close) {}
}