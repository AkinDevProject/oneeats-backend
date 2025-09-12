package com.oneeats.restaurant.application.command;

import java.io.InputStream;
import java.util.UUID;

public record UploadRestaurantImageCommand(
    UUID restaurantId,
    InputStream inputStream,
    String filename,
    long fileSize
) {}