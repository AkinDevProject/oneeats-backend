package com.oneeats.user.application.command;

import com.oneeats.user.application.dto.UserDTO;
import com.oneeats.user.application.mapper.UserApplicationMapper;
import com.oneeats.user.domain.repository.IUserRepository;
import com.oneeats.user.domain.model.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class UpdateUserStatusCommandHandler {

    @Inject
    IUserRepository userRepository;

    @Inject
    UserApplicationMapper userApplicationMapper;

    @Transactional
    public UserDTO handle(UpdateUserStatusCommand command) {
        User user = userRepository.findById(command.id())
            .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + command.id()));

        user.updateStatus(command.status());
        User updatedUser = userRepository.save(user);

        return userApplicationMapper.toDTO(updatedUser);
    }
}