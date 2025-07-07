package com.oneeats.domain.admin.internal.application;

import com.oneeats.domain.admin.api.cqrs.command.UpdateAdminCommand;
import com.oneeats.domain.admin.api.interface_.AdminRepository;
import com.oneeats.domain.admin.internal.entity.Admin;
import java.util.Optional;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class UpdateAdminUseCase {
    private final AdminRepository adminRepository;

    public UpdateAdminUseCase(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    public boolean handle(UpdateAdminCommand command) {
        Optional<Admin> optAdmin = adminRepository.findById(command.getId());
        if (optAdmin.isEmpty()) {
            return false;
        }
        Admin admin = optAdmin.get();
        admin.setNom(command.getNom());
        admin.setPrenom(command.getPrenom());
        admin.setEmail(command.getEmail());
        admin.setStatut(command.getStatut());
        adminRepository.save(admin);
        return true;
    }
}
