package com.oneeats.notification.api.interface_;

import com.oneeats.notification.internal.entity.Notification;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationService {
    void send(Notification notification);
    Optional<Notification> findById(UUID id);
    List<Notification> findAllByDestinataire(UUID destinataireId);
    void markAsRead(UUID id);
    void deleteById(UUID id);
    List<Notification> findAll();
}

