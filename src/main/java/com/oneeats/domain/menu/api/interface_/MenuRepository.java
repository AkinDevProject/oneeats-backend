package com.oneeats.domain.menu.api.interface_;

import com.oneeats.domain.menu.internal.entity.MenuItem;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MenuRepository {
    Optional<MenuItem> findById(UUID id);
    List<MenuItem> findAll();
    void save(MenuItem menuItem);
    void deleteById(UUID id);
}

