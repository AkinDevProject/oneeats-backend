package com.oneeats.admin.domain.repository;

import com.oneeats.admin.domain.model.Admin;
import com.oneeats.admin.domain.model.AdminRole;
import com.oneeats.shared.domain.vo.Email;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IAdminRepository {
    
    Optional<Admin> findById(UUID id);
    
    Optional<Admin> findByEmail(Email email);
    
    List<Admin> findAll();
    
    List<Admin> findByRole(AdminRole role);
    
    List<Admin> findActiveAdmins();
    
    Admin save(Admin admin);
    
    void delete(Admin admin);
    
    boolean existsByEmail(Email email);
    
    long countActiveAdmins();
}