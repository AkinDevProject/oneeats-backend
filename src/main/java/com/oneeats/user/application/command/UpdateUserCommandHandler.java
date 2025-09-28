package com.oneeats.user.application.command;

import com.oneeats.user.application.dto.UserDTO;
import com.oneeats.user.application.mapper.UserApplicationMapper;
import com.oneeats.user.domain.model.User;
import com.oneeats.user.domain.repository.IUserRepository;
import com.oneeats.user.domain.service.IUserDomainService;
import com.oneeats.shared.domain.vo.Email;
import com.oneeats.shared.domain.event.DomainEventPublisher;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class UpdateUserCommandHandler {

    @Inject
    IUserRepository userRepository;

    @Inject
    IUserDomainService userDomainService;

    @Inject
    UserApplicationMapper mapper;

    @Inject
    DomainEventPublisher eventPublisher;

    @Transactional
    public UserDTO handle(UpdateUserCommand command) {
        // Récupérer l'utilisateur existant
        User user = userRepository.findById(command.id())
            .orElseThrow(() -> new RuntimeException("User not found with id: " + command.id()));

        // Mettre à jour les informations si elles sont fournies
        if (command.firstName() != null && command.lastName() != null) {
            user.updateProfile(command.firstName(), command.lastName());
        } else if (command.firstName() != null) {
            user.updateProfile(command.firstName(), user.getLastName());
        } else if (command.lastName() != null) {
            user.updateProfile(user.getFirstName(), command.lastName());
        }

        // Mettre à jour l'email si fourni
        if (command.email() != null) {
            user.updateEmail(command.email());
        }

        // Sauvegarde
        User updatedUser = userRepository.save(user);

        // Publication d'événements
        updatedUser.getDomainEvents().forEach(eventPublisher::publishEvent);
        updatedUser.clearDomainEvents();

        return mapper.toDTO(updatedUser);
    }
}