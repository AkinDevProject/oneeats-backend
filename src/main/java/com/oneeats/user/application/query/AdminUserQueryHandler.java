package com.oneeats.user.application.query;

import com.oneeats.user.application.dto.AdminUserListDTO;
import com.oneeats.user.application.dto.PagedResponse;
import com.oneeats.user.domain.model.UserStatus;
import com.oneeats.user.infrastructure.entity.UserEntity;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Handler for admin user queries with filtering and pagination
 */
@ApplicationScoped
public class AdminUserQueryHandler {

    @Transactional
    public PagedResponse<AdminUserListDTO> handle(AdminUserQuery query) {
        // Build dynamic query
        StringBuilder jpql = new StringBuilder("1=1");
        Map<String, Object> params = new HashMap<>();

        // Search filter (firstName, lastName, email)
        if (query.search() != null && !query.search().isBlank()) {
            jpql.append(" and (lower(firstName) like :search or lower(lastName) like :search or lower(email) like :search)");
            params.put("search", "%" + query.search().toLowerCase() + "%");
        }

        // Role filter - Note: role is not in UserEntity currently, filter on application level
        // For MVP, we skip role filtering as it's managed by Keycloak

        // Status filter
        if (query.status() != null) {
            jpql.append(" and status = :status");
            params.put("status", query.status());
        }

        // Build sort
        Sort sort = Sort.by(query.sortBy());
        if ("desc".equalsIgnoreCase(query.sortDirection())) {
            sort = sort.descending();
        } else {
            sort = sort.ascending();
        }

        // Execute query with pagination
        PanacheQuery<UserEntity> panacheQuery = UserEntity.find(jpql.toString(), sort, params);

        // Get total count
        long total = panacheQuery.count();

        // Get page
        List<UserEntity> entities = panacheQuery
            .page(Page.of(query.page(), query.size()))
            .list();

        // Map to DTOs
        List<AdminUserListDTO> dtos = entities.stream()
            .map(this::toListDTO)
            .collect(Collectors.toList());

        return new PagedResponse<>(dtos, query.page(), query.size(), total);
    }

    private AdminUserListDTO toListDTO(UserEntity entity) {
        return new AdminUserListDTO(
            entity.getId(),
            entity.getFirstName(),
            entity.getLastName(),
            entity.getEmail(),
            entity.getStatus(),
            "USER", // Default role - will be enhanced when Keycloak integration is complete
            entity.getCreatedAt()
        );
    }
}
