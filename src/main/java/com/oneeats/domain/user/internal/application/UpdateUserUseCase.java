package com.oneeats.domain.user.internal.application;

import com.oneeats.domain.user.api.cqrs.command.UpdateUserCommand;
import com.oneeats.domain.user.api.interface_.UserRepository;
import com.oneeats.domain.user.internal.entity.User;
import java.util.Optional;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class UpdateUserUseCase {
    private final UserRepository userRepository;

    public UpdateUserUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public boolean handle(UpdateUserCommand command) {
        Optional<User> optUser = userRepository.findById(command.getId());
        if (optUser.isEmpty()) {
            return false;
        }
        User user = optUser.get();
        user.setNom(command.getNom());
        user.setPrenom(command.getPrenom());
        user.setEmail(command.getEmail());
        user.setRole(command.getRole());
        userRepository.save(user);
        return true;
    }
}
