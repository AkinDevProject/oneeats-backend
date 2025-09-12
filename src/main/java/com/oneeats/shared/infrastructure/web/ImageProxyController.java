package com.oneeats.shared.infrastructure.web;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Path("/api/proxy/image")
public class ImageProxyController {

    private final HttpClient httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(10))
        .build();

    @GET
    public Response proxyImage(@QueryParam("url") String imageUrl) {
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity("Image URL is required")
                .build();
        }

        try {
            // Validate URL
            URI uri = URI.create(imageUrl);
            if (!uri.getScheme().equals("https") && !uri.getScheme().equals("http")) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Only HTTP and HTTPS URLs are allowed")
                    .build();
            }

            // Make request to external image
            HttpRequest request = HttpRequest.newBuilder()
                .uri(uri)
                .timeout(Duration.ofSeconds(30))
                .header("User-Agent", "OneEats/1.0")
                .GET()
                .build();

            HttpResponse<InputStream> response = httpClient.send(request, 
                HttpResponse.BodyHandlers.ofInputStream());

            if (response.statusCode() != 200) {
                return Response.status(Response.Status.NOT_FOUND)
                    .entity("Image not found")
                    .build();
            }

            // Determine content type
            String contentType = response.headers().firstValue("content-type")
                .orElse("application/octet-stream");

            // Only allow image content types
            if (!contentType.startsWith("image/")) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity("URL does not point to an image")
                    .build();
            }

            return Response.ok(response.body(), contentType)
                .header("Cache-Control", "public, max-age=3600") // 1 hour cache
                .header("Access-Control-Allow-Origin", "*")
                .build();

        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Failed to fetch image: " + e.getMessage())
                .build();
        }
    }
}