package com.oneeats.admin.internal.mapper;

import com.oneeats.admin.internal.entity.Admin;
import com.oneeats.admin.api.model.AdminDto;

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

