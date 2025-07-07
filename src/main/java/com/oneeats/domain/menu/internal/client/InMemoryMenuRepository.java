package com.oneeats.domain.menu.internal.client;

import com.oneeats.domain.menu.api.interface_.MenuRepository;
import com.oneeats.domain.menu.internal.entity.MenuItem;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@ApplicationScoped
public class InMemoryMenuRepository implements MenuRepository {
    private final Map<UUID, MenuItem> store = new ConcurrentHashMap<>();

    @Override
    public Optional<MenuItem> findById(UUID id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public List<MenuItem> findAll() {
        return new ArrayList<>(store.values());
    }

    @Override
    public void save(MenuItem menuItem) {
        store.put(menuItem.getId(), menuItem);
    }

    @Override
    public void deleteById(UUID id) {
        store.remove(id);
    }
}

