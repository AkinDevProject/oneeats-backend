package com.oneeats.domain.order.internal.mapper;

import com.oneeats.domain.order.internal.entity.Order;
import com.oneeats.domain.order.internal.entity.OrderItem;
import com.oneeats.domain.order.api.model.OrderDto;
import com.oneeats.domain.order.api.model.OrderItemDto;
import java.util.List;
import java.util.stream.Collectors;

public class OrderMapper {
    public static OrderDto toDto(Order order) {
        if (order == null) return null;
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setClientId(order.getClient() != null ? order.getClient().getId() : null);
        dto.setRestaurantId(order.getRestaurant() != null ? order.getRestaurant().getId() : null);
        dto.setItems(toItemDtoList(order.getItems()));
        dto.setStatut(order.getStatut() != null ? order.getStatut().name() : null);
        dto.setMode(order.getMode() != null ? order.getMode().name() : null);
        dto.setDateCreation(order.getDateCreation());
        dto.setDateMaj(order.getDateMaj());
        return dto;
    }
    public static List<OrderItemDto> toItemDtoList(List<OrderItem> items) {
        if (items == null) return null;
        return items.stream().map(OrderMapper::toDto).collect(Collectors.toList());
    }
    public static OrderItemDto toDto(OrderItem item) {
        if (item == null) return null;
        OrderItemDto dto = new OrderItemDto();
        dto.setId(item.getId());
        dto.setMenuItemId(item.getMenuItem() != null ? item.getMenuItem().getId() : null);
        dto.setQuantite(item.getQuantite());
        dto.setPrixUnitaire(item.getPrixUnitaire());
        return dto;
    }
}

