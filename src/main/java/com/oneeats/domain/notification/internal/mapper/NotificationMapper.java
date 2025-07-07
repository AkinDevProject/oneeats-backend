package com.oneeats.domain.notification.internal.mapper;

import com.oneeats.domain.notification.internal.entity.Notification;
import com.oneeats.domain.notification.api.model.NotificationDto;

public class NotificationMapper {
    public static NotificationDto toDto(Notification notification) {
        if (notification == null) return null;
        NotificationDto dto = new NotificationDto();
        dto.setId(notification.getId());
        dto.setDestinataireId(notification.getDestinataireId());
        dto.setType(notification.getType());
        dto.setMessage(notification.getMessage());
        dto.setDateEnvoi(notification.getDateEnvoi());
        dto.setLu(notification.isLu());
        return dto;
    }
}

