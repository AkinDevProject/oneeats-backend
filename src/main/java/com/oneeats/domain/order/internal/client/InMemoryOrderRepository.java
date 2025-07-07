package com.oneeats.domain.order.internal.client;

import com.oneeats.domain.order.api.interface_.OrderRepository;
import com.oneeats.domain.order.internal.entity.Order;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@ApplicationScoped
public class InMemoryOrderRepository implements OrderRepository {
    private final Map<UUID, Order> store = new ConcurrentHashMap<>();

    @Override
    public Optional<Order> findById(UUID id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public List<Order> findAll() {
        return new ArrayList<>(store.values());
    }

    @Override
    public void save(Order order) {
        store.put(order.getId(), order);
    }

    @Override
    public void deleteById(UUID id) {
        store.remove(id);
    }
}
