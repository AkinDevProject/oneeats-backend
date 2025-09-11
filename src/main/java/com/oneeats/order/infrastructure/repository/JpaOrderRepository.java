package com.oneeats.order.infrastructure.repository;

import com.oneeats.order.domain.model.Order;
import com.oneeats.order.domain.model.OrderStatus;
import com.oneeats.order.domain.repository.IOrderRepository;
import com.oneeats.order.infrastructure.entity.OrderEntity;
import com.oneeats.order.infrastructure.mapper.OrderInfrastructureMapper;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
public class JpaOrderRepository implements IOrderRepository {

    @Inject
    OrderInfrastructureMapper mapper;

    @Override
    public Optional<Order> findById(UUID id) {
        return OrderEntity.find("id", id)
                .firstResultOptional()
                .map(entity -> mapper.toDomain((OrderEntity) entity));
    }

    @Override
    public Optional<Order> findByOrderNumber(String orderNumber) {
        return OrderEntity.find("orderNumber", orderNumber)
                .firstResultOptional()
                .map(entity -> mapper.toDomain((OrderEntity) entity));
    }

    @Override
    public List<Order> findAll() {
        return OrderEntity.<OrderEntity>listAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Order> findByUserId(UUID userId) {
        return OrderEntity.<OrderEntity>find("userId", userId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<Order> findByRestaurantId(UUID restaurantId) {
        return OrderEntity.<OrderEntity>find("restaurantId", restaurantId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Order> findByStatus(OrderStatus status) {
        return OrderEntity.<OrderEntity>find("status", status).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Order save(Order order) {
        if (order.getId() == null) {
            // Nouvelle entité
            OrderEntity entity = mapper.toEntity(order);
            entity.persist();
            return mapper.toDomain(entity);
        } else {
            // Entité existante - la charger et la modifier
            OrderEntity existingEntity = OrderEntity.findById(order.getId());
            if (existingEntity != null) {
                // Mettre à jour directement les champs nécessaires
                existingEntity.setStatus(order.getStatus());
                existingEntity.setUpdatedAt(order.getUpdatedAt());
                return mapper.toDomain(existingEntity);
            } else {
                throw new RuntimeException("Order not found: " + order.getId());
            }
        }
    }

    @Override
    public void delete(Order order) {
        OrderEntity.deleteById(order.getId());
    }

    @Override
    public boolean existsByOrderNumber(String orderNumber) {
        return OrderEntity.count("orderNumber", orderNumber) > 0;
    }
}