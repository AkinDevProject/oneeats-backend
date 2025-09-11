package com.oneeats.admin.domain.service;

import com.oneeats.admin.domain.repository.IAdminRepository;
import com.oneeats.shared.domain.vo.Email;
import com.oneeats.shared.domain.exception.ValidationException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.UUID;

@ApplicationScoped
public class AdminDomainService {

    @Inject
    IAdminRepository adminRepository;

    public void validateAdminCreation(String firstName, String lastName, String email) {
        if (firstName == null || firstName.trim().isEmpty()) {
            throw new ValidationException("Admin first name cannot be empty");
        }
        
        if (lastName == null || lastName.trim().isEmpty()) {
            throw new ValidationException("Admin last name cannot be empty");
        }
        
        if (firstName.length() > 50) {
            throw new ValidationException("Admin first name cannot exceed 50 characters");
        }
        
        if (lastName.length() > 50) {
            throw new ValidationException("Admin last name cannot exceed 50 characters");
        }

        Email emailVO = new Email(email);
        if (adminRepository.existsByEmail(emailVO)) {
            throw new ValidationException("Admin with this email already exists");
        }
    }

    public boolean canDeleteAdmin(UUID adminId) {
        long activeAdminsCount = adminRepository.countActiveAdmins();
        // Ne pas permettre la suppression du dernier admin actif
        return activeAdminsCount > 1;
    }
}