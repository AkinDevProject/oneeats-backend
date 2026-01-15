package com.oneeats.user.application.query;

import com.oneeats.user.domain.model.UserStatus;

/**
 * Query for admin user list with filters and pagination
 */
public record AdminUserQuery(
    String search,
    String role,
    UserStatus status,
    int page,
    int size,
    String sortBy,
    String sortDirection
) {
    public AdminUserQuery {
        if (page < 0) page = 0;
        if (size <= 0) size = 20;
        if (size > 100) size = 100;
        if (sortBy == null || sortBy.isBlank()) sortBy = "createdAt";
        if (sortDirection == null || sortDirection.isBlank()) sortDirection = "desc";
    }

    public static AdminUserQuery of(String search, String role, UserStatus status, int page, int size) {
        return new AdminUserQuery(search, role, status, page, size, "createdAt", "desc");
    }
}
