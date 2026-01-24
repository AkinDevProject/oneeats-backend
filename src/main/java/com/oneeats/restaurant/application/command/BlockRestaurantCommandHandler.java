package com.oneeats.restaurant.application.command;

import com.oneeats.order.domain.model.Order;
import com.oneeats.order.domain.repository.IOrderRepository;
import com.oneeats.restaurant.application.dto.BlockRestaurantResultDTO;
import com.oneeats.restaurant.application.dto.RestaurantDTO;
import com.oneeats.restaurant.application.mapper.RestaurantApplicationMapper;
import com.oneeats.restaurant.domain.repository.IRestaurantRepository;
import com.oneeats.restaurant.domain.model.Restaurant;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class BlockRestaurantCommandHandler {

    private static final String BLOCKING_CANCELLATION_REASON = "Restaurant blocked by administrator";

    @Inject
    IRestaurantRepository restaurantRepository;

    @Inject
    IOrderRepository orderRepository;

    @Inject
    RestaurantApplicationMapper mapper;

    @Transactional
    public BlockRestaurantResultDTO handle(BlockRestaurantCommand command) {
        Restaurant restaurant = restaurantRepository.findById(command.restaurantId())
            .orElseThrow(() -> new IllegalArgumentException("Restaurant not found with id: " + command.restaurantId()));

        // Récupérer les commandes actives du restaurant
        List<Order> activeOrders = orderRepository.findActiveByRestaurantId(command.restaurantId());
        int activeOrdersCount = activeOrders.size();

        List<UUID> cancelledOrderIds = new ArrayList<>();
        boolean hasUncancelledOrders = false;

        // Si demandé, annuler les commandes en cours
        if (command.cancelPendingOrders() && !activeOrders.isEmpty()) {
            for (Order order : activeOrders) {
                try {
                    order.cancelWithReason(BLOCKING_CANCELLATION_REASON);
                    orderRepository.save(order);
                    cancelledOrderIds.add(order.getId());
                } catch (Exception e) {
                    // Certaines commandes ne peuvent pas être annulées (déjà complétées)
                    hasUncancelledOrders = true;
                }
            }
        } else if (!activeOrders.isEmpty()) {
            // Si pas d'annulation automatique mais commandes en cours, marquer
            hasUncancelledOrders = true;
        }

        // Bloquer le restaurant
        restaurant.block(command.reason());
        Restaurant savedRestaurant = restaurantRepository.save(restaurant);

        return new BlockRestaurantResultDTO(
            mapper.toDTO(savedRestaurant),
            activeOrdersCount,
            cancelledOrderIds.size(),
            cancelledOrderIds,
            hasUncancelledOrders
        );
    }
}
