package com.oneeats.user.application.query;

import com.oneeats.user.application.dto.UserDTO;
import com.oneeats.user.application.mapper.UserApplicationMapper;
import com.oneeats.user.domain.repository.IUserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class GetAllUsersQueryHandler {
    
    @Inject
    IUserRepository userRepository;
    
    @Inject
    UserApplicationMapper mapper;
    
    public List<UserDTO> handle(GetAllUsersQuery query) {
        return userRepository.findAll().stream()
            .map(mapper::toDTO)
            .collect(Collectors.toList());
    }
}