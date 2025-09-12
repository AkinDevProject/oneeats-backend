package com.oneeats.restaurant.application.command;

import java.util.UUID;

public record ToggleRestaurantStatusCommand(UUID id, boolean isOpen) {
}