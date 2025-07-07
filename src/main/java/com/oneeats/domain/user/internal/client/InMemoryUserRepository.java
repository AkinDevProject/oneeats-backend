package com.oneeats.domain.user.internal.client;

import com.oneeats.domain.user.api.interface_.UserRepository;
import com.oneeats.domain.user.internal.entity.User;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@ApplicationScoped
public class InMemoryUserRepository implements UserRepository {
    private final Map<UUID, User> store = new ConcurrentHashMap<>();

    @Override
    public Optional<User> findById(UUID id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public List<User> findAll() {
        return new ArrayList<>(store.values());
    }

    @Override
    public void save(User user) {
        store.put(user.getId(), user);
    }

    @Override
    public void deleteById(UUID id) {
        store.remove(id);
    }
}
