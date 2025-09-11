package com.oneeats.user.application.query;

import com.oneeats.user.application.dto.UserDTO;
import com.oneeats.user.application.mapper.UserApplicationMapper;
import com.oneeats.user.domain.model.User;
import com.oneeats.user.domain.repository.IUserRepository;
import com.oneeats.shared.domain.exception.EntityNotFoundException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class GetUserQueryHandler {
    
    @Inject
    IUserRepository userRepository;
    
    @Inject
    UserApplicationMapper mapper;
    
    public UserDTO handle(GetUserQuery query) {
        User user = userRepository.findById(query.id())
            .orElseThrow(() -> new EntityNotFoundException("User", query.id()));
            
        return mapper.toDTO(user);
    }
}