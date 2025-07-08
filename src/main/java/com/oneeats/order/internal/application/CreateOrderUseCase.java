package com.oneeats.order.internal.application;

import com.oneeats.order.api.cqrs.command.CreateOrderCommand;
import com.oneeats.order.api.interface_.OrderRepository;
import com.oneeats.order.internal.entity.Order;
import com.oneeats.order.internal.entity.OrderItem;
import com.oneeats.menu.api.interface_.MenuRepository;
import com.oneeats.menu.internal.entity.MenuItem;
import com.oneeats.restaurant.api.interface_.RestaurantRepository;
import com.oneeats.restaurant.internal.entity.Restaurant;
import com.oneeats.user.api.interface_.UserRepository;
import com.oneeats.user.internal.entity.User;
import jakarta.enterprise.context.ApplicationScoped;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Cas d’usage pour la création d’une commande (Order).
 * Orchestration de la validation des données, de l’association client/restaurant/items et de la persistance via OrderRepository.
 * Utilisé lors de la création d’une commande par un client sur la plateforme.
 */
@ApplicationScoped
public class CreateOrderUseCase {
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuRepository menuRepository;

    public CreateOrderUseCase(OrderRepository orderRepository, UserRepository userRepository, RestaurantRepository restaurantRepository, MenuRepository menuRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.restaurantRepository = restaurantRepository;
        this.menuRepository = menuRepository;
    }

    public UUID handle(CreateOrderCommand command) {
        Optional<User> optUser = userRepository.findById(command.getClientId());
        Optional<Restaurant> optRestaurant = restaurantRepository.findById(command.getRestaurantId());
        if (optUser.isEmpty() || optRestaurant.isEmpty()) {
            throw new IllegalArgumentException("Client ou restaurant introuvable");
        }
        User client = optUser.get();
        Restaurant restaurant = optRestaurant.get();
        List<OrderItem> items = new ArrayList<>();
        for (CreateOrderCommand.OrderItemCommand itemCmd : command.getItems()) {
            Optional<MenuItem> optMenuItem = menuRepository.findById(itemCmd.getMenuItemId());
            if (optMenuItem.isEmpty()) {
                throw new IllegalArgumentException("MenuItem introuvable : " + itemCmd.getMenuItemId());
            }
            MenuItem menuItem = optMenuItem.get();
            items.add(new OrderItem(UUID.randomUUID(), menuItem, itemCmd.getQuantite(), menuItem.getPrix()));
        }
        Order order = new Order(
            UUID.randomUUID(),
            client,
            restaurant,
            items,
            Order.Statut.PENDING,
            Order.Mode.valueOf(command.getMode()),
            LocalDateTime.now(),
            LocalDateTime.now()
        );
        orderRepository.save(order);
        return order.getId();
    }
}
