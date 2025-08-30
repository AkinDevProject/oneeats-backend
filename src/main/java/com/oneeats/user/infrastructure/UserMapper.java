package com.oneeats.user.infrastructure;

import com.oneeats.user.api.UserDto;
import com.oneeats.user.domain.User;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

/**
 * Mapper pour convertir entre entités User et DTOs
 */
@ApplicationScoped
public class UserMapper {
    
    /**
     * Convertir une entité User vers un DTO
     */
    public UserDto toDto(User user) {
        if (user == null) {
            return null;
        }
        
        return new UserDto(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getFullName(),
            user.getPhone(),
            user.getAddress(),
            user.isActive(),
            user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }
    
    /**
     * Convertir une liste d'entités vers une liste de DTOs
     */
    public List<UserDto> toDtoList(List<User> users) {
        return users.stream()
            .map(this::toDto)
            .toList();
    }
}