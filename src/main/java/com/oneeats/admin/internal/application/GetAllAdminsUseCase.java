package com.oneeats.admin.internal.application;

import com.oneeats.admin.api.model.AdminDto;
import com.oneeats.admin.api.interface_.AdminRepository;
import com.oneeats.admin.internal.entity.Admin;
import com.oneeats.admin.internal.mapper.AdminMapper;
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
