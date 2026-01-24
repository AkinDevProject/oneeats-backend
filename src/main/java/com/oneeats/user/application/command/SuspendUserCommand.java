package com.oneeats.user.application.command;

import java.util.UUID;

/**
 * Command to suspend a user with reason and optional duration
 */
public record SuspendUserCommand(
    UUID userId,
    String reason,
    Integer durationDays  // null = indefinite
) {
    // Predefined durations for convenience
    public static final int ONE_DAY = 1;
    public static final int ONE_WEEK = 7;
    public static final int ONE_MONTH = 30;
}
