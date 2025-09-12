package com.oneeats.restaurant.infrastructure.mapper;

import com.oneeats.restaurant.domain.model.Restaurant;
import com.oneeats.restaurant.domain.model.RestaurantStatus;
import com.oneeats.restaurant.domain.model.WeeklySchedule;
import com.oneeats.restaurant.domain.model.OpeningHours;
import com.oneeats.restaurant.infrastructure.entity.RestaurantEntity;
import com.oneeats.restaurant.infrastructure.entity.OpeningHoursEntity;
import com.oneeats.shared.domain.vo.Email;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class RestaurantInfrastructureMapper {

    public Restaurant toDomain(RestaurantEntity entity) {
        RestaurantStatus status;
        if (entity.getIsOpen()) {
            status = RestaurantStatus.OPEN;
        } else if (entity.getIsActive()) {
            status = RestaurantStatus.ACTIVE;
        } else {
            status = RestaurantStatus.SUSPENDED;
        }
        
        Restaurant restaurant = new Restaurant(
            entity.getId(),
            entity.getName(),
            entity.getDescription(),
            entity.getAddress(),
            entity.getPhone(),
            new Email(entity.getEmail()),
            entity.getCuisineType(),
            status
        );
        
        restaurant.setCreatedAt(entity.getCreatedAt());
        restaurant.setUpdatedAt(entity.getUpdatedAt());
        restaurant.setImageUrl(entity.getImageUrl());
        restaurant.updateRating(entity.getRating());
        
        // Convertir les horaires d'ouverture
        if (entity.getOpeningHours() != null && !entity.getOpeningHours().isEmpty()) {
            WeeklySchedule schedule = convertToWeeklySchedule(entity.getOpeningHours());
            restaurant.updateSchedule(schedule);
        }
        
        return restaurant;
    }

    public RestaurantEntity toEntity(Restaurant restaurant) {
        boolean isOpen = restaurant.getStatus() == RestaurantStatus.OPEN;
        boolean isActive = restaurant.getStatus() == RestaurantStatus.ACTIVE || restaurant.getStatus() == RestaurantStatus.OPEN;
        
        RestaurantEntity entity = new RestaurantEntity(
            restaurant.getId(),
            restaurant.getName(),
            restaurant.getDescription(),
            restaurant.getAddress(),
            restaurant.getPhone(),
            restaurant.getEmail().getValue(),
            restaurant.getCuisineType(),
            restaurant.getRating(),
            restaurant.getImageUrl(),
            isOpen,
            isActive,
            restaurant.getCreatedAt(),
            restaurant.getUpdatedAt()
        );
        
        // Convertir les horaires d'ouverture
        if (restaurant.getSchedule() != null) {
            List<OpeningHoursEntity> openingHours = convertToOpeningHoursEntities(restaurant.getSchedule(), entity);
            entity.setOpeningHours(openingHours);
        }
        
        return entity;
    }
    
    private WeeklySchedule convertToWeeklySchedule(List<OpeningHoursEntity> openingHoursEntities) {
        WeeklySchedule schedule = new WeeklySchedule();
        
        // Si aucune entité d'horaires, initialiser tous les jours à fermé (null)
        if (openingHoursEntities == null || openingHoursEntities.isEmpty()) {
            for (WeeklySchedule.DayOfWeek day : WeeklySchedule.DayOfWeek.values()) {
                schedule.setDaySchedule(day, null);
            }
            return schedule;
        }
        
        // Initialiser tous les jours à fermé par défaut
        for (WeeklySchedule.DayOfWeek day : WeeklySchedule.DayOfWeek.values()) {
            schedule.setDaySchedule(day, null);
        }
        
        // Ensuite, mettre à jour avec les horaires existantes
        for (OpeningHoursEntity entity : openingHoursEntities) {
            WeeklySchedule.DayOfWeek domainDay = convertToDomainDayOfWeek(entity.getDayOfWeek());
            OpeningHours hours = null;
            
            if (entity.getOpenTime() != null && entity.getCloseTime() != null) {
                hours = OpeningHours.of(entity.getOpenTime(), entity.getCloseTime());
            }
            
            schedule.setDaySchedule(domainDay, hours);
        }
        
        return schedule;
    }
    
    private List<OpeningHoursEntity> convertToOpeningHoursEntities(WeeklySchedule schedule, RestaurantEntity restaurant) {
        List<OpeningHoursEntity> entities = new ArrayList<>();
        
        // Créer une entité pour chaque jour de la semaine
        for (WeeklySchedule.DayOfWeek domainDay : WeeklySchedule.DayOfWeek.values()) {
            OpeningHours hours = schedule.getDaySchedule(domainDay);
            
            OpeningHoursEntity entity = new OpeningHoursEntity();
            entity.setDayOfWeek(convertToEntityDayOfWeek(domainDay));
            entity.setRestaurant(restaurant);
            
            // Si les heures sont définies et le restaurant est ouvert ce jour-là
            if (hours != null && hours.isOpen()) {
                entity.setOpenTime(hours.getOpenTime());
                entity.setCloseTime(hours.getCloseTime());
            } else {
                // Jour fermé : laisser openTime et closeTime null
                entity.setOpenTime(null);
                entity.setCloseTime(null);
            }
            
            entities.add(entity);
        }
        
        return entities;
    }
    
    private WeeklySchedule.DayOfWeek convertToDomainDayOfWeek(OpeningHoursEntity.DayOfWeek entityDay) {
        return switch (entityDay) {
            case MONDAY -> WeeklySchedule.DayOfWeek.MONDAY;
            case TUESDAY -> WeeklySchedule.DayOfWeek.TUESDAY;
            case WEDNESDAY -> WeeklySchedule.DayOfWeek.WEDNESDAY;
            case THURSDAY -> WeeklySchedule.DayOfWeek.THURSDAY;
            case FRIDAY -> WeeklySchedule.DayOfWeek.FRIDAY;
            case SATURDAY -> WeeklySchedule.DayOfWeek.SATURDAY;
            case SUNDAY -> WeeklySchedule.DayOfWeek.SUNDAY;
        };
    }
    
    private OpeningHoursEntity.DayOfWeek convertToEntityDayOfWeek(WeeklySchedule.DayOfWeek domainDay) {
        return switch (domainDay) {
            case MONDAY -> OpeningHoursEntity.DayOfWeek.MONDAY;
            case TUESDAY -> OpeningHoursEntity.DayOfWeek.TUESDAY;
            case WEDNESDAY -> OpeningHoursEntity.DayOfWeek.WEDNESDAY;
            case THURSDAY -> OpeningHoursEntity.DayOfWeek.THURSDAY;
            case FRIDAY -> OpeningHoursEntity.DayOfWeek.FRIDAY;
            case SATURDAY -> OpeningHoursEntity.DayOfWeek.SATURDAY;
            case SUNDAY -> OpeningHoursEntity.DayOfWeek.SUNDAY;
        };
    }
}