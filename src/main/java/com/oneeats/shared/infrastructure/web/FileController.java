package com.oneeats.shared.infrastructure.web;

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

    @GET
    @Path("/{category}/{filename}")
    public Response getFile(
            @PathParam("category") String category,
            @PathParam("filename") String filename) {

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

            java.nio.file.Path filePath = Paths.get("uploads", category, filename);

            // Check if file exists
            if (!Files.exists(filePath)) {
                return Response.status(Response.Status.NOT_FOUND)
                    .entity("File not found")
                    .build();
            }

            // Get content type based on file extension
            String contentType = getContentType(filename);

            // Create streaming response
            StreamingOutput stream = output -> {
                try (InputStream input = Files.newInputStream(filePath)) {
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
                .build();

        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Internal server error")
                .build();
        }
    }

    private boolean isValidCategory(String category) {
        // Only allow specific categories to prevent directory traversal
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