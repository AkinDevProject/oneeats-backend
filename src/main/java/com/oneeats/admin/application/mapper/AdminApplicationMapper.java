package com.oneeats.admin.application.mapper;

import com.oneeats.admin.application.dto.AdminDTO;
import com.oneeats.admin.domain.model.Admin;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class AdminApplicationMapper {
    
    public AdminDTO toDTO(Admin admin) {
        return new AdminDTO(
            admin.getId(),
            admin.getFirstName(),
            admin.getLastName(),
            admin.getEmail().getValue(),
            admin.getRole(),
            admin.getStatus(),
            admin.getCreatedAt(),
            admin.getUpdatedAt()
        );
    }
}