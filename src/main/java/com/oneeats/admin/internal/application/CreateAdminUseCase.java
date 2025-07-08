package com.oneeats.admin.internal.application;

import com.oneeats.admin.api.cqrs.command.CreateAdminCommand;
import com.oneeats.admin.api.interface_.AdminRepository;
import com.oneeats.admin.internal.entity.Admin;
import java.util.UUID;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * Cas d’usage pour la création d’un administrateur (Admin).
 * Orchestration de la validation des données et de la persistance via AdminRepository.
 * Utilisé lors de l’ajout d’un nouvel administrateur à la plateforme.
 */
@ApplicationScoped
public class CreateAdminUseCase {
    private final AdminRepository adminRepository;

    public CreateAdminUseCase(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    public UUID handle(CreateAdminCommand command) {
        Admin admin = new Admin(
            UUID.randomUUID(),
            command.getNom(),
            command.getPrenom(),
            command.getEmail(),
            command.getStatut()
        );
        adminRepository.save(admin);
        return admin.getId();
    }
}
