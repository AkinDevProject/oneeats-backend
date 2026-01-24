package com.oneeats.order.application.mapper;

import com.oneeats.order.application.dto.OrderDTO;
import com.oneeats.order.application.dto.OrderItemDTO;
import com.oneeats.order.domain.model.Order;
import com.oneeats.order.domain.model.OrderItem;
import com.oneeats.user.infrastructure.entity.UserEntity;
import com.oneeats.user.infrastructure.repository.JpaUserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@ApplicationScoped
public class OrderApplicationMapper {

    @Inject
    JpaUserRepository userRepository;

    public OrderDTO toDTO(Order order) {
        // Fetch user data to enrich the order
        // Cherche par ID de base de donnees OU par Keycloak ID (mobile envoie Keycloak ID)
        String clientFirstName = null;
        String clientLastName = null;
        String clientEmail = null;
        String clientPhone = null;

        // Utiliser l'entite directement pour eviter la validation du domaine
        Optional<UserEntity> userOpt = userRepository.findEntityByIdOrKeycloakId(order.getUserId());
        if (userOpt.isPresent()) {
            UserEntity user = userOpt.get();
            clientFirstName = user.getFirstName();
            clientLastName = user.getLastName();
            clientEmail = user.getEmail();
            clientPhone = user.getPhone();
        }
        List<OrderItemDTO> itemDTOs = order.getItems().stream()
            .map(this::toItemDTO)
            .collect(Collectors.toList());

        return new OrderDTO(
            order.getId(),
            order.getOrderNumber(),
            order.getUserId(),
            order.getRestaurantId(),
            order.getStatus(),
            order.getTotalAmount().getAmount(),
            order.getSpecialInstructions(),
            order.getEstimatedPickupTime(),
            order.getActualPickupTime(),
            itemDTOs,
            order.getCreatedAt(),
            order.getUpdatedAt(),
            clientFirstName,
            clientLastName,
            clientEmail,
            clientPhone
        );
    }
    
    private OrderItemDTO toItemDTO(OrderItem item) {
        return new OrderItemDTO(
            item.getId(),
            item.getMenuItemId(),
            item.getMenuItemName(),
            item.getUnitPrice().getAmount(),
            item.getQuantity(),
            item.getSpecialNotes(),
            item.getSubtotal().getAmount()
        );
    }
}