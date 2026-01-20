package com.oneeats.shared.infrastructure.web;

import com.oneeats.shared.infrastructure.service.FileStorageService;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.StreamingOutput;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;

@Path("/uploads")
public class FileController {

    private static final String THUMBNAILS_DIR = "thumbnails";

    /**
     * Serve image files with optional size parameter for thumbnails
     *
     * @param category Category folder (restaurants, menu-items)
     * @param filename The image filename
     * @param size Optional size parameter: "small" (150px), "medium" (400px), or null for original (800px)
     * @return The image file
     *
     * Examples:
     * - /uploads/menu-items/abc123.jpg          -> Returns original (800px max)
     * - /uploads/menu-items/abc123.jpg?size=small  -> Returns 150px thumbnail
     * - /uploads/menu-items/abc123.jpg?size=medium -> Returns 400px thumbnail
     */
    @GET
    @Path("/{category}/{filename}")
    public Response getFile(
            @PathParam("category") String category,
            @PathParam("filename") String filename,
            @QueryParam("size") String size) {

        try {
            // Validate category to prevent directory traversal
            if (!isValidCategory(category)) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Invalid category")
                    .build();
            }

            // Validate filename to prevent directory traversal
            if (!isValidFilename(filename)) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Invalid filename")
                    .build();
            }

            // Determine which file to serve based on size parameter
            java.nio.file.Path filePath = resolveFilePath(category, filename, size);

            // Check if file exists
            if (!Files.exists(filePath)) {
                // If thumbnail doesn't exist, fall back to original
                if (size != null && !size.isEmpty()) {
                    filePath = Paths.get("uploads", category, filename);
                    if (!Files.exists(filePath)) {
                        return Response.status(Response.Status.NOT_FOUND)
                            .entity("File not found")
                            .build();
                    }
                } else {
                    return Response.status(Response.Status.NOT_FOUND)
                        .entity("File not found")
                        .build();
                }
            }

            // Get content type based on file extension
            String contentType = getContentType(filename);

            // Create streaming response
            final java.nio.file.Path finalPath = filePath;
            StreamingOutput stream = output -> {
                try (InputStream input = Files.newInputStream(finalPath)) {
                    byte[] buffer = new byte[8192];
                    int bytesRead;
                    while ((bytesRead = input.read(buffer)) != -1) {
                        output.write(buffer, 0, bytesRead);
                    }
                    output.flush();
                }
            };

            return Response.ok(stream)
                .type(contentType)
                .header("Cache-Control", "public, max-age=31536000") // Cache for 1 year
                .header("Vary", "Accept") // Vary by Accept header for content negotiation
                .build();

        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Internal server error")
                .build();
        }
    }

    /**
     * Resolve the file path based on size parameter
     */
    private java.nio.file.Path resolveFilePath(String category, String filename, String size) {
        if (size == null || size.isEmpty()) {
            // Return original image
            return Paths.get("uploads", category, filename);
        }

        // Get base filename and extension
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex == -1) {
            return Paths.get("uploads", category, filename);
        }

        String baseFilename = filename.substring(0, dotIndex);
        String extension = filename.substring(dotIndex);

        // Determine suffix based on size
        String suffix;
        switch (size.toLowerCase()) {
            case "small":
            case "thumbnail":
            case "thumb":
                suffix = FileStorageService.SUFFIX_SMALL;
                break;
            case "medium":
            case "med":
                suffix = FileStorageService.SUFFIX_MEDIUM;
                break;
            case "large":
            case "original":
            default:
                // Return original for large or unknown sizes
                return Paths.get("uploads", category, filename);
        }

        // Build thumbnail path
        String thumbnailFilename = baseFilename + suffix + extension;
        return Paths.get("uploads", category, THUMBNAILS_DIR, thumbnailFilename);
    }

    private boolean isValidCategory(String category) {
        // Only allow specific categories to prevent directory traversal
        // Note: thumbnails are served via size query parameter, not as a separate category
        return "restaurants".equals(category) || "menu-items".equals(category);
    }

    private boolean isValidFilename(String filename) {
        // Basic validation to prevent directory traversal and ensure safe filename
        if (filename == null || filename.trim().isEmpty()) {
            return false;
        }

        // Check for directory traversal attempts
        if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
            return false;
        }

        // Check for valid image extensions
        String lowerFilename = filename.toLowerCase();
        return lowerFilename.endsWith(".jpg") ||
               lowerFilename.endsWith(".jpeg") ||
               lowerFilename.endsWith(".png") ||
               lowerFilename.endsWith(".webp");
    }

    private String getContentType(String filename) {
        String lowerFilename = filename.toLowerCase();

        if (lowerFilename.endsWith(".jpg") || lowerFilename.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (lowerFilename.endsWith(".png")) {
            return "image/png";
        } else if (lowerFilename.endsWith(".webp")) {
            return "image/webp";
        }

        // Default to octet-stream for unknown types
        return MediaType.APPLICATION_OCTET_STREAM;
    }
}