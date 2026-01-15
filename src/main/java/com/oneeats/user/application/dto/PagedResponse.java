package com.oneeats.user.application.dto;

import java.util.List;

/**
 * Generic paginated response wrapper
 * @param <T> Type of items in the page
 */
public record PagedResponse<T>(
    List<T> content,
    int currentPage,
    int pageSize,
    long totalElements,
    int totalPages,
    boolean hasNext,
    boolean hasPrevious
) {
    public PagedResponse(List<T> content, int page, int size, long total) {
        this(
            content,
            page,
            size,
            total,
            (int) Math.ceil((double) total / size),
            (page + 1) * size < total,
            page > 0
        );
    }
}
