package com.oneeats.domain.admin.internal.application;

import com.oneeats.domain.admin.api.model.AdminDto;
import com.oneeats.domain.admin.api.interface_.AdminRepository;
import com.oneeats.domain.admin.internal.entity.Admin;
import com.oneeats.domain.admin.internal.mapper.AdminMapper;
import java.util.List;
import java.util.stream.Collectors;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class GetAllAdminsUseCase {
    private final AdminRepository adminRepository;

    public GetAllAdminsUseCase(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    public List<AdminDto> handle() {
        List<Admin> admins = adminRepository.findAll();
        return admins.stream().map(AdminMapper::toDto).collect(Collectors.toList());
    }
}
