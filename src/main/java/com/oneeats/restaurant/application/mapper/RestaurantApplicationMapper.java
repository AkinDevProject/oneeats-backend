package com.oneeats.restaurant.application.mapper;

import com.oneeats.restaurant.application.dto.RestaurantDTO;
import com.oneeats.restaurant.application.dto.ScheduleDTO;
import com.oneeats.restaurant.domain.model.Restaurant;
import com.oneeats.restaurant.domain.model.WeeklySchedule;
import com.oneeats.restaurant.domain.model.OpeningHours;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class RestaurantApplicationMapper {
    
    public RestaurantDTO toDTO(Restaurant restaurant) {
        ScheduleDTO scheduleDTO = convertToScheduleDTO(restaurant.getSchedule());
        
        return new RestaurantDTO(
            restaurant.getId(),
            restaurant.getName(),
            restaurant.getDescription(),
            restaurant.getAddress(),
            restaurant.getPhone(),
            restaurant.getEmail().getValue(),
            restaurant.getCuisineType(),
            restaurant.getRating(),
            restaurant.getImageUrl(),
            restaurant.getStatus(),
            restaurant.canAcceptOrders(),
            scheduleDTO,
            restaurant.getCreatedAt(),
            restaurant.getUpdatedAt()
        );
    }
    
    private ScheduleDTO convertToScheduleDTO(WeeklySchedule schedule) {
        if (schedule == null) {
            return new ScheduleDTO(null, null, null, null, null, null, null);
        }
        
        return new ScheduleDTO(
            convertToDayScheduleDTO(schedule.getDaySchedule(WeeklySchedule.DayOfWeek.MONDAY)),
            convertToDayScheduleDTO(schedule.getDaySchedule(WeeklySchedule.DayOfWeek.TUESDAY)),
            convertToDayScheduleDTO(schedule.getDaySchedule(WeeklySchedule.DayOfWeek.WEDNESDAY)),
            convertToDayScheduleDTO(schedule.getDaySchedule(WeeklySchedule.DayOfWeek.THURSDAY)),
            convertToDayScheduleDTO(schedule.getDaySchedule(WeeklySchedule.DayOfWeek.FRIDAY)),
            convertToDayScheduleDTO(schedule.getDaySchedule(WeeklySchedule.DayOfWeek.SATURDAY)),
            convertToDayScheduleDTO(schedule.getDaySchedule(WeeklySchedule.DayOfWeek.SUNDAY))
        );
    }
    
    private ScheduleDTO.DayScheduleDTO convertToDayScheduleDTO(OpeningHours hours) {
        if (hours == null || !hours.isOpen()) {
            return null;
        }
        
        return new ScheduleDTO.DayScheduleDTO(
            hours.getOpenTime().toString(),
            hours.getCloseTime().toString()
        );
    }
}