package com.oneeats.domain.user.api.interface_;

import com.oneeats.domain.user.internal.entity.User;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository {
    Optional<User> findById(UUID id);
    List<User> findAll();
    void save(User user);
    void deleteById(UUID id);
}

