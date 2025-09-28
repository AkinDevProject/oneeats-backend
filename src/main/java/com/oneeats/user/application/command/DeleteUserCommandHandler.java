package com.oneeats.user.application.command;

import com.oneeats.user.domain.model.User;
import com.oneeats.user.domain.repository.IUserRepository;
import com.oneeats.shared.domain.event.DomainEventPublisher;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class DeleteUserCommandHandler {

    @Inject
    IUserRepository userRepository;

    @Inject
    DomainEventPublisher eventPublisher;

    @Transactional
    public void handle(DeleteUserCommand command) {
        // Récupérer l'utilisateur existant
        User user = userRepository.findById(command.id())
            .orElseThrow(() -> new RuntimeException("User not found with id: " + command.id()));

        // Supprimer l'utilisateur
        userRepository.deleteById(user.getId());

        // Publication d'événements si nécessaire
        user.getDomainEvents().forEach(eventPublisher::publishEvent);
        user.clearDomainEvents();
    }
}