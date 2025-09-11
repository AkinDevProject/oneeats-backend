package com.oneeats.user.domain.repository;

import com.oneeats.user.domain.model.User;
import com.oneeats.shared.domain.vo.Email;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IUserRepository {
    User save(User user);
    Optional<User> findById(UUID id);
    Optional<User> findByEmail(Email email);
    List<User> findAll();
    boolean existsByEmail(Email email);
    void deleteById(UUID id);
}