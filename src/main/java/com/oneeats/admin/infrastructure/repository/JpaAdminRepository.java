package com.oneeats.admin.infrastructure.repository;

import com.oneeats.admin.domain.model.Admin;
import com.oneeats.admin.domain.model.AdminRole;
import com.oneeats.admin.domain.model.AdminStatus;
import com.oneeats.admin.domain.repository.IAdminRepository;
import com.oneeats.admin.infrastructure.entity.AdminEntity;
import com.oneeats.admin.infrastructure.mapper.AdminInfrastructureMapper;
import com.oneeats.shared.domain.vo.Email;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
public class JpaAdminRepository implements IAdminRepository {

    @Inject
    AdminInfrastructureMapper mapper;

    @Override
    public Optional<Admin> findById(UUID id) {
        return AdminEntity.find("id", id)
                .firstResultOptional()
                .map(entity -> mapper.toDomain((AdminEntity) entity));
    }

    @Override
    public Optional<Admin> findByEmail(Email email) {
        return AdminEntity.find("email", email.getValue())
                .firstResultOptional()
                .map(entity -> mapper.toDomain((AdminEntity) entity));
    }

    @Override
    public List<Admin> findAll() {
        return AdminEntity.<AdminEntity>listAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Admin> findByRole(AdminRole role) {
        return AdminEntity.<AdminEntity>find("role", role).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Admin> findActiveAdmins() {
        return AdminEntity.<AdminEntity>find("status", AdminStatus.ACTIVE).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Admin save(Admin admin) {
        AdminEntity entity = mapper.toEntity(admin);
        entity.persistAndFlush();
        return mapper.toDomain(entity);
    }

    @Override
    public void delete(Admin admin) {
        AdminEntity.deleteById(admin.getId());
    }

    @Override
    public boolean existsByEmail(Email email) {
        return AdminEntity.count("email", email.getValue()) > 0;
    }

    @Override
    public long countActiveAdmins() {
        return AdminEntity.count("status", AdminStatus.ACTIVE);
    }
}