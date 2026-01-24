package com.oneeats.admin.application.dto;

import java.util.List;

/**
 * Réponse paginée pour les alertes
 */
public record AlertsResponse(
    List<AlertDTO> alerts,
    long totalUnread,
    int page,
    int size,
    boolean hasMore
) {}
