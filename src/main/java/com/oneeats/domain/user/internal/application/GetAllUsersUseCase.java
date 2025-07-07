package com.oneeats.domain.user.internal.application;

import com.oneeats.domain.user.api.model.UserDto;
import com.oneeats.domain.user.api.interface_.UserRepository;
import com.oneeats.domain.user.internal.entity.User;
import com.oneeats.domain.user.internal.mapper.UserMapper;
import java.util.List;
import java.util.stream.Collectors;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class GetAllUsersUseCase {
    private final UserRepository userRepository;

    public GetAllUsersUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserDto> handle() {
        List<User> users = userRepository.findAll();
        return users.stream().map(UserMapper::toDto).collect(Collectors.toList());
    }
}
