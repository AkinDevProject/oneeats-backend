package com.oneeats.user.application.command;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record UpdateUserCommand(
    UUID id,
    @NotBlank @Size(max = 50) String firstName,
    @NotBlank @Size(max = 50) String lastName
) {}