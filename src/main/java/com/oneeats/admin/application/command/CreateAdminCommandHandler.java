package com.oneeats.admin.application.command;

import com.oneeats.admin.application.dto.AdminDTO;
import com.oneeats.admin.application.mapper.AdminApplicationMapper;
import com.oneeats.admin.domain.model.Admin;
import com.oneeats.admin.domain.repository.IAdminRepository;
import com.oneeats.admin.domain.service.AdminDomainService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class CreateAdminCommandHandler {

    @Inject
    IAdminRepository adminRepository;

    @Inject
    AdminDomainService adminDomainService;

    @Inject
    AdminApplicationMapper mapper;

    @Transactional
    public AdminDTO handle(CreateAdminCommand command) {
        adminDomainService.validateAdminCreation(
            command.firstName(), 
            command.lastName(),
            command.email()
        );

        Admin admin = Admin.create(
            command.firstName(),
            command.lastName(),
            command.email(),
            command.password(),
            command.role()
        );

        Admin savedAdmin = adminRepository.save(admin);
        return mapper.toDTO(savedAdmin);
    }
}