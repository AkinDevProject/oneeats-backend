package com.oneeats.restaurant.application.command;

import com.oneeats.restaurant.application.dto.RestaurantDTO;
import com.oneeats.restaurant.application.dto.ScheduleDTO;
import com.oneeats.restaurant.application.mapper.RestaurantApplicationMapper;
import com.oneeats.restaurant.domain.model.Restaurant;
import com.oneeats.restaurant.domain.model.WeeklySchedule;
import com.oneeats.restaurant.domain.model.OpeningHours;
import com.oneeats.restaurant.domain.repository.IRestaurantRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class UpdateRestaurantCommandHandler {

    @Inject
    IRestaurantRepository restaurantRepository;

    @Inject
    RestaurantApplicationMapper mapper;

    @Transactional
    public RestaurantDTO handle(UpdateRestaurantCommand command) {
        Restaurant restaurant = restaurantRepository.findById(command.id())
            .orElseThrow(() -> new RuntimeException("Restaurant not found with id: " + command.id()));

        // Mettre à jour les informations de base
        restaurant.updateInfo(
            command.name() != null ? command.name() : restaurant.getName(),
            command.description() != null ? command.description() : restaurant.getDescription(),
            command.address() != null ? command.address() : restaurant.getAddress(),
            command.phone() != null ? command.phone() : restaurant.getPhone(),
            command.email() != null ? command.email() : restaurant.getEmail().getValue()
        );

        // Gérer le statut ouvert/fermé si spécifié
        if (command.isOpen() != null) {
            try {
                if (command.isOpen()) {
                    // S'assurer que le restaurant est actif avant de l'ouvrir
                    if (restaurant.getStatus().name().equals("PENDING")) {
                        restaurant.activate();
                    }
                    if (!restaurant.getStatus().name().equals("OPEN")) {
                        restaurant.open();
                    }
                } else {
                    if (restaurant.getStatus().name().equals("OPEN")) {
                        restaurant.close();
                    }
                }
            } catch (IllegalStateException e) {
                // Ignorer les erreurs de transition de statut pour l'instant
                System.out.println("Status transition ignored: " + e.getMessage());
            }
        }

        // Gérer les horaires si spécifiées
        if (command.schedule() != null) {
            WeeklySchedule weeklySchedule = new WeeklySchedule();
            
            ScheduleDTO schedule = command.schedule();
            
            // Mapper chaque jour
            if (schedule.monday() != null) {
                weeklySchedule.setDaySchedule(WeeklySchedule.DayOfWeek.MONDAY, 
                    OpeningHours.of(schedule.monday().open(), schedule.monday().close()));
            }
            if (schedule.tuesday() != null) {
                weeklySchedule.setDaySchedule(WeeklySchedule.DayOfWeek.TUESDAY, 
                    OpeningHours.of(schedule.tuesday().open(), schedule.tuesday().close()));
            }
            if (schedule.wednesday() != null) {
                weeklySchedule.setDaySchedule(WeeklySchedule.DayOfWeek.WEDNESDAY, 
                    OpeningHours.of(schedule.wednesday().open(), schedule.wednesday().close()));
            }
            if (schedule.thursday() != null) {
                weeklySchedule.setDaySchedule(WeeklySchedule.DayOfWeek.THURSDAY, 
                    OpeningHours.of(schedule.thursday().open(), schedule.thursday().close()));
            }
            if (schedule.friday() != null) {
                weeklySchedule.setDaySchedule(WeeklySchedule.DayOfWeek.FRIDAY, 
                    OpeningHours.of(schedule.friday().open(), schedule.friday().close()));
            }
            if (schedule.saturday() != null) {
                weeklySchedule.setDaySchedule(WeeklySchedule.DayOfWeek.SATURDAY, 
                    OpeningHours.of(schedule.saturday().open(), schedule.saturday().close()));
            }
            if (schedule.sunday() != null) {
                weeklySchedule.setDaySchedule(WeeklySchedule.DayOfWeek.SUNDAY, 
                    OpeningHours.of(schedule.sunday().open(), schedule.sunday().close()));
            }
            
            restaurant.updateSchedule(weeklySchedule);
        }

        Restaurant savedRestaurant = restaurantRepository.save(restaurant);
        return mapper.toDTO(savedRestaurant);
    }
}