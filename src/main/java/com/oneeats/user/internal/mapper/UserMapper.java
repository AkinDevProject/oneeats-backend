package com.oneeats.user.internal.mapper;

import com.oneeats.user.internal.entity.User;
import com.oneeats.user.api.model.UserDto;

public class UserMapper {
    public static UserDto toDto(User user) {
        if (user == null) return null;
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setNom(user.getNom());
        dto.setPrenom(user.getPrenom());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        return dto;
    }
}

