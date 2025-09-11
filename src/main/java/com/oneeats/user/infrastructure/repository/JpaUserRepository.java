package com.oneeats.user.infrastructure.repository;

import com.oneeats.shared.domain.vo.Email;
import com.oneeats.user.domain.model.User;
import com.oneeats.user.domain.repository.IUserRepository;
import com.oneeats.user.infrastructure.entity.UserEntity;
import com.oneeats.user.infrastructure.mapper.UserInfrastructureMapper;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
public class JpaUserRepository implements IUserRepository {

    @Inject
    UserInfrastructureMapper mapper;

    @Override
    public Optional<User> findById(UUID id) {
        return UserEntity.find("id", id)
                .firstResultOptional()
                .map(entity -> mapper.toDomain((UserEntity) entity));
    }

    @Override
    public Optional<User> findByEmail(Email email) {
        return UserEntity.find("email", email.getValue())
                .firstResultOptional()
                .map(entity -> mapper.toDomain((UserEntity) entity));
    }

    @Override
    public List<User> findAll() {
        return UserEntity.<UserEntity>listAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public User save(User user) {
        UserEntity entity = mapper.toEntity(user);
        entity.persistAndFlush();
        return mapper.toDomain(entity);
    }

    public void delete(User user) {
        deleteById(user.getId());
    }

    @Override
    public void deleteById(UUID id) {
        UserEntity.deleteById(id);
    }

    @Override
    public boolean existsByEmail(Email email) {
        return UserEntity.count("email", email.getValue()) > 0;
    }
}