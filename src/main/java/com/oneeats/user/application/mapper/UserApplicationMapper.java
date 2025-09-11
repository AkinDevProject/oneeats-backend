package com.oneeats.user.application.mapper;

import com.oneeats.user.application.dto.UserDTO;
import com.oneeats.user.domain.model.User;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class UserApplicationMapper {
    
    public UserDTO toDTO(User user) {
        return new UserDTO(
            user.getId(),
            user.getFirstName(),
            user.getLastName(),
            user.getEmail().getValue(),
            user.getStatus(),
            user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }
}