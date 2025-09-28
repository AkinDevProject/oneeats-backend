package com.oneeats.menu.application.command;

import java.util.UUID;

public record DeleteMenuItemImageCommand(
    UUID menuItemId
) {}