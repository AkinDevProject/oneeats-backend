package com.oneeats.domain.admin.internal.mapper;

import com.oneeats.domain.admin.internal.entity.Admin;
import com.oneeats.domain.admin.api.model.AdminDto;

public class AdminMapper {
    public static AdminDto toDto(Admin admin) {
        if (admin == null) return null;
        AdminDto dto = new AdminDto();
        dto.setId(admin.getId());
        dto.setNom(admin.getNom());
        dto.setPrenom(admin.getPrenom());
        dto.setEmail(admin.getEmail());
        dto.setStatut(admin.getStatut());
        return dto;
    }
}

