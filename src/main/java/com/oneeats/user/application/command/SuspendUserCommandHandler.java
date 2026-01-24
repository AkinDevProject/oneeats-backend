package com.oneeats.user.application.command;

import com.oneeats.user.application.dto.UserDTO;
import com.oneeats.user.domain.model.User;
import com.oneeats.user.domain.repository.IUserRepository;
import com.oneeats.user.infrastructure.entity.UserEntity;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.LocalDateTime;

@ApplicationScoped
public class SuspendUserCommandHandler {

    @Inject
    IUserRepository userRepository;

    @Transactional
    public UserDTO handle(SuspendUserCommand command) {
        User user = userRepository.findById(command.userId())
            .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + command.userId()));

        // Apply suspension with reason and duration
        user.suspendWithReason(command.reason(), command.durationDays());

        // Save the user (domain level)
        User savedUser = userRepository.save(user);

        // Update entity directly for suspension fields
        UserEntity entity = UserEntity.findById(command.userId());
        if (entity != null) {
            entity.setSuspensionReason(command.reason().trim());
            entity.setSuspendedAt(LocalDateTime.now());
            entity.setSuspendedUntil(command.durationDays() != null
                ? LocalDateTime.now().plusDays(command.durationDays())
                : null);
            entity.setUpdatedAt(LocalDateTime.now());
        }

        return new UserDTO(
            savedUser.getId(),
            savedUser.getFirstName(),
            savedUser.getLastName(),
            savedUser.getEmail().getValue(),
            savedUser.getStatus(),
            savedUser.getCreatedAt(),
            savedUser.getUpdatedAt()
        );
    }
}
