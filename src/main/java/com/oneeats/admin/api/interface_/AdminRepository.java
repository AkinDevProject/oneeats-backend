package com.oneeats.admin.api.interface_;

import com.oneeats.admin.internal.entity.Admin;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AdminRepository {
    Optional<Admin> findById(UUID id);
    List<Admin> findAll();
    void save(Admin admin);
    void deleteById(UUID id);
}

