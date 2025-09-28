package com.oneeats.user.infrastructure.mapper;

import com.oneeats.shared.domain.vo.Email;
import com.oneeats.user.domain.model.User;
import com.oneeats.user.infrastructure.entity.UserEntity;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class UserInfrastructureMapper {

    public User toDomain(UserEntity entity) {
        return User.fromPersistence(
            entity.getId(),
            entity.getFirstName(),
            entity.getLastName(),
            entity.getEmail(),
            entity.getPasswordHash(),
            entity.getStatus(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }

    public UserEntity toEntity(User user) {
        return new UserEntity(
            user.getId(),
            user.getFirstName(),
            user.getLastName(),
            user.getEmail().getValue(),
            user.getHashedPassword(),
            user.getStatus(),
            null, // phone - sera ajouté plus tard
            null, // address - sera ajouté plus tard
            user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }
}