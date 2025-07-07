package com.oneeats.domain.admin.internal.application;

import com.oneeats.domain.admin.api.model.AdminDto;
import com.oneeats.domain.admin.api.interface_.AdminRepository;
import com.oneeats.domain.admin.internal.entity.Admin;
import com.oneeats.domain.admin.internal.mapper.AdminMapper;
import java.util.Optional;
import java.util.UUID;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class GetAdminUseCase {
    private final AdminRepository adminRepository;

    public GetAdminUseCase(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    public Optional<AdminDto> handle(UUID adminId) {
        Optional<Admin> optAdmin = adminRepository.findById(adminId);
        return optAdmin.map(AdminMapper::toDto);
    }
}
