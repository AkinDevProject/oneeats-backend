package com.oneeats.menu.application.command;

import java.io.InputStream;
import java.util.UUID;

public record UploadMenuItemImageCommand(
    UUID menuItemId,
    InputStream inputStream,
    String filename,
    long fileSize
) {}