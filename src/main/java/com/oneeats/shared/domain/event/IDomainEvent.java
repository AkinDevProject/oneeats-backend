package com.oneeats.shared.domain.event;

import java.time.LocalDateTime;

public interface IDomainEvent {
    LocalDateTime occurredOn();
}