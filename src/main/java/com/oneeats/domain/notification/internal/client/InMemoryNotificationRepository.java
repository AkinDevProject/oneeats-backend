package com.oneeats.domain.notification.internal.client;

import com.oneeats.domain.notification.api.interface_.NotificationService;
import com.oneeats.domain.notification.internal.entity.Notification;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@ApplicationScoped
public class InMemoryNotificationRepository implements NotificationService {
    private final Map<UUID, Notification> store = new ConcurrentHashMap<>();

    @Override
    public void send(Notification notification) {
        store.put(notification.getId(), notification);
    }

    @Override
    public Optional<Notification> findById(UUID id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public List<Notification> findAllByDestinataire(UUID destinataireId) {
        List<Notification> result = new ArrayList<>();
        for (Notification n : store.values()) {
            if (n.getDestinataireId().equals(destinataireId)) {
                result.add(n);
            }
        }
        return result;
    }

    @Override
    public void markAsRead(UUID id) {
        Notification n = store.get(id);
        if (n != null) {
            n.setLu(true);
        }
    }

    @Override
    public void deleteById(UUID id) {
        store.remove(id);
    }

    @Override
    public List<Notification> findAll() {
        return new ArrayList<>(store.values());
    }
}
