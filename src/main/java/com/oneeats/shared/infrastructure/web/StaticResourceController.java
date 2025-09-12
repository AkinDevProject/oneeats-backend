package com.oneeats.shared.infrastructure.web;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;

@Path("/uploads")
public class StaticResourceController {

    @GET
    @Path("/{directory}/{filename}")
    public Response serveFile(@PathParam("directory") String directory, @PathParam("filename") String filename) {
        try {
            java.nio.file.Path filePath = Paths.get("uploads", directory, filename);

            if (!Files.exists(filePath)) {
                return Response.status(Response.Status.NOT_FOUND).build();
            }

            // Determine content type based on file extension
            String contentType = getContentType(filename);

            InputStream fileStream = Files.newInputStream(filePath);
            return Response.ok(fileStream, contentType)
                .header("Cache-Control", "public, max-age=31536000") // 1 year cache
                .build();

        } catch (IOException e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }

    private String getContentType(String filename) {
        String lowerName = filename.toLowerCase();
        if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (lowerName.endsWith(".png")) {
            return "image/png";
        } else if (lowerName.endsWith(".webp")) {
            return "image/webp";
        }
        return MediaType.APPLICATION_OCTET_STREAM;
    }
}
