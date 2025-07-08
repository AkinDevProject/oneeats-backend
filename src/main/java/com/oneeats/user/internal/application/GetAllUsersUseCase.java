package com.oneeats.user.internal.application;

import com.oneeats.user.api.model.UserDto;
import com.oneeats.user.api.interface_.UserRepository;
import com.oneeats.user.internal.entity.User;
import com.oneeats.user.internal.mapper.UserMapper;
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
