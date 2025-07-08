package com.oneeats.admin.internal.application;

import com.oneeats.admin.api.interface_.AdminRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class DeleteAdminUseCase {
    private final AdminRepository adminRepository;

    public DeleteAdminUseCase(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    public boolean handle(UUID id) {
        Optional<?> admin = adminRepository.findById(id);
        if (admin.isPresent()) {
            adminRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
