package com.oneeats.user.application.command;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record UpdateUserCommand(
    UUID id,
    @Size(max = 50) String firstName,
    @Size(max = 50) String lastName,
    @Email String email
) {}