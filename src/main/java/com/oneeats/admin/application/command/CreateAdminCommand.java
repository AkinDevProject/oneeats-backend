package com.oneeats.admin.application.command;

import com.oneeats.admin.domain.model.AdminRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateAdminCommand(
    @NotBlank String firstName,
    @NotBlank String lastName,
    @Email String email,
    @NotBlank String password,
    @NotNull AdminRole role
) {}