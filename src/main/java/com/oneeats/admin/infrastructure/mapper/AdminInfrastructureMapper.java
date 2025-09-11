package com.oneeats.admin.infrastructure.mapper;

import com.oneeats.admin.domain.model.Admin;
import com.oneeats.admin.infrastructure.entity.AdminEntity;
import com.oneeats.shared.domain.vo.Email;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class AdminInfrastructureMapper {

    public Admin toDomain(AdminEntity entity) {
        return new Admin(
            entity.getId(),
            entity.getFirstName(),
            entity.getLastName(),
            new Email(entity.getEmail()),
            entity.getPasswordHash(),
            entity.getRole(),
            entity.getStatus()
        );
    }

    public AdminEntity toEntity(Admin admin) {
        return new AdminEntity(
            admin.getId(),
            admin.getFirstName(),
            admin.getLastName(),
            admin.getEmail().getValue(),
            admin.getPasswordHash(),
            admin.getRole(),
            admin.getStatus(),
            admin.getCreatedAt(),
            admin.getUpdatedAt()
        );
    }
}