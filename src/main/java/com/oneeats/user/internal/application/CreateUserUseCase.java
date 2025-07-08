package com.oneeats.user.internal.application;

import com.oneeats.user.api.cqrs.command.CreateUserCommand;
import com.oneeats.user.api.interface_.UserRepository;
import com.oneeats.user.internal.entity.User;
import java.util.UUID;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * Cas d’usage pour la création d’un utilisateur.
 * Orchestration de la validation, du hash du mot de passe et de la persistance via UserRepository.
 * Utilisé lors de l’inscription d’un nouveau client, restaurateur ou administrateur.
 */
@ApplicationScoped
public class CreateUserUseCase {
    private final UserRepository userRepository;

    public CreateUserUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UUID handle(CreateUserCommand command) {
        User user = new User(
            UUID.randomUUID(),
            command.getNom(),
            command.getPrenom(),
            command.getEmail(),
            command.getRole()
        );
        userRepository.save(user);
        return user.getId();
    }
}
