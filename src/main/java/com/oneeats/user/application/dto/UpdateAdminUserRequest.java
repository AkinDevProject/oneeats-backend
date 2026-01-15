package com.oneeats.user.application.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for admin user update
 */
public record UpdateAdminUserRequest(
    @Size(min = 1, max = 50, message = "First name must be between 1 and 50 characters")
    String firstName,

    @Size(min = 1, max = 50, message = "Last name must be between 1 and 50 characters")
    String lastName,

    @Email(message = "Invalid email format")
    String email,

    String phone,

    String address,

    String role
) {}
