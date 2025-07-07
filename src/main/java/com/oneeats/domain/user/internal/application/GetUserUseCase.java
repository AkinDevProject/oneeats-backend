package com.oneeats.domain.user.internal.application;

import com.oneeats.domain.user.api.model.UserDto;
import com.oneeats.domain.user.api.interface_.UserRepository;
import com.oneeats.domain.user.internal.entity.User;
import com.oneeats.domain.user.internal.mapper.UserMapper;
import java.util.Optional;
import java.util.UUID;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class GetUserUseCase {
    private final UserRepository userRepository;

    public GetUserUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<UserDto> handle(UUID userId) {
        Optional<User> optUser = userRepository.findById(userId);
        return optUser.map(UserMapper::toDto);
    }
}
