package com.oneeats.restaurant.application.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.Map;

@JsonInclude(JsonInclude.Include.ALWAYS)
public record ScheduleDTO(
    DayScheduleDTO monday,
    DayScheduleDTO tuesday,
    DayScheduleDTO wednesday,
    DayScheduleDTO thursday,
    DayScheduleDTO friday,
    DayScheduleDTO saturday,
    DayScheduleDTO sunday
) {
    @JsonInclude(JsonInclude.Include.ALWAYS)
    public static record DayScheduleDTO(String open, String close) {}
}