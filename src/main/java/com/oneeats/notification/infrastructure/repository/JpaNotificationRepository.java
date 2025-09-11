package com.oneeats.notification.infrastructure.repository;

import com.oneeats.notification.domain.model.Notification;
import com.oneeats.notification.domain.model.NotificationStatus;
import com.oneeats.notification.domain.model.NotificationType;
import com.oneeats.notification.domain.repository.INotificationRepository;
import com.oneeats.notification.infrastructure.entity.NotificationEntity;
import com.oneeats.notification.infrastructure.mapper.NotificationInfrastructureMapper;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
public class JpaNotificationRepository implements INotificationRepository {

    @Inject
    NotificationInfrastructureMapper mapper;

    @Override
    public Optional<Notification> findById(UUID id) {
        return NotificationEntity.find("id", id)
                .firstResultOptional()
                .map(entity -> mapper.toDomain((NotificationEntity) entity));
    }

    @Override
    public List<Notification> findAll() {
        return NotificationEntity.<NotificationEntity>listAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Notification> findByRecipientId(UUID recipientId) {
        return NotificationEntity.<NotificationEntity>find("recipientId", recipientId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Notification> findByRecipientIdAndStatus(UUID recipientId, NotificationStatus status) {
        return NotificationEntity.<NotificationEntity>find("recipientId = ?1 and status = ?2", recipientId, status).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Notification> findByType(NotificationType type) {
        return NotificationEntity.<NotificationEntity>find("type", type).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Notification save(Notification notification) {
        NotificationEntity entity = mapper.toEntity(notification);
        entity.persistAndFlush();
        return mapper.toDomain(entity);
    }

    @Override
    public void delete(Notification notification) {
        NotificationEntity.deleteById(notification.getId());
    }

    @Override
    public long countUnreadByRecipientId(UUID recipientId) {
        return NotificationEntity.count("recipientId = ?1 and status = ?2", recipientId, NotificationStatus.PENDING);
    }
}