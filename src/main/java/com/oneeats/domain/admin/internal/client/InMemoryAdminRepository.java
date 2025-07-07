package com.oneeats.domain.admin.internal.client;

import com.oneeats.domain.admin.api.interface_.AdminRepository;
import com.oneeats.domain.admin.internal.entity.Admin;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@ApplicationScoped
public class InMemoryAdminRepository implements AdminRepository {
    private final Map<UUID, Admin> store = new ConcurrentHashMap<>();

    @Override
    public Optional<Admin> findById(UUID id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public List<Admin> findAll() {
        return new ArrayList<>(store.values());
    }

    @Override
    public void save(Admin admin) {
        store.put(admin.getId(), admin);
    }

    @Override
    public void deleteById(UUID id) {
        store.remove(id);
    }
}

