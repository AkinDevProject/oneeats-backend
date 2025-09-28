package com.oneeats.shared.infrastructure.service;

import jakarta.enterprise.context.ApplicationScoped;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

@ApplicationScoped
public class ImageResizingService {

    // Standard sizes for different use cases
    public static final int THUMBNAIL_SIZE = 150;
    public static final int MEDIUM_SIZE = 400;
    public static final int LARGE_SIZE = 800;

    public static final float JPEG_QUALITY = 0.85f;
    public static final float WEBP_QUALITY = 0.8f;

    /**
     * Resize image to specified dimensions while maintaining aspect ratio
     */
    public InputStream resizeImage(InputStream inputStream, String originalFormat, int targetWidth, int targetHeight) throws IOException {
        BufferedImage originalImage = ImageIO.read(inputStream);
        if (originalImage == null) {
            throw new IOException("Unable to read image");
        }

        // Calculate new dimensions maintaining aspect ratio
        Dimension newDimensions = calculateDimensions(originalImage.getWidth(), originalImage.getHeight(), targetWidth, targetHeight);

        // Create resized image
        BufferedImage resizedImage = new BufferedImage(
            newDimensions.width,
            newDimensions.height,
            BufferedImage.TYPE_INT_RGB
        );

        Graphics2D g2d = resizedImage.createGraphics();
        try {
            // Set high quality rendering hints
            g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

            // Fill background with white for non-transparent images
            g2d.setColor(Color.WHITE);
            g2d.fillRect(0, 0, newDimensions.width, newDimensions.height);

            // Draw the resized image
            g2d.drawImage(originalImage, 0, 0, newDimensions.width, newDimensions.height, null);
        } finally {
            g2d.dispose();
        }

        // Convert back to InputStream
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        String format = getImageFormat(originalFormat);
        ImageIO.write(resizedImage, format, baos);

        return new ByteArrayInputStream(baos.toByteArray());
    }

    /**
     * Create thumbnail version of image (150x150 max)
     */
    public InputStream createThumbnail(InputStream inputStream, String originalFormat) throws IOException {
        return resizeImage(inputStream, originalFormat, THUMBNAIL_SIZE, THUMBNAIL_SIZE);
    }

    /**
     * Create medium version of image (400x400 max)
     */
    public InputStream createMediumImage(InputStream inputStream, String originalFormat) throws IOException {
        return resizeImage(inputStream, originalFormat, MEDIUM_SIZE, MEDIUM_SIZE);
    }

    /**
     * Optimize image for web use (800x800 max)
     */
    public InputStream optimizeForWeb(InputStream inputStream, String originalFormat) throws IOException {
        return resizeImage(inputStream, originalFormat, LARGE_SIZE, LARGE_SIZE);
    }

    /**
     * Calculate new dimensions maintaining aspect ratio
     */
    private Dimension calculateDimensions(int originalWidth, int originalHeight, int maxWidth, int maxHeight) {
        // If image is already smaller, don't upscale
        if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
            return new Dimension(originalWidth, originalHeight);
        }

        double aspectRatio = (double) originalWidth / originalHeight;

        int newWidth, newHeight;

        if (originalWidth > originalHeight) {
            // Landscape orientation
            newWidth = Math.min(maxWidth, originalWidth);
            newHeight = (int) (newWidth / aspectRatio);
        } else {
            // Portrait orientation
            newHeight = Math.min(maxHeight, originalHeight);
            newWidth = (int) (newHeight * aspectRatio);
        }

        return new Dimension(newWidth, newHeight);
    }

    /**
     * Get appropriate format for ImageIO
     */
    private String getImageFormat(String originalFormat) {
        String format = originalFormat.toLowerCase();
        if (format.equals("jpeg") || format.equals("jpg")) {
            return "jpg";
        } else if (format.equals("png")) {
            return "png";
        } else if (format.equals("webp")) {
            // ImageIO doesn't support WebP by default, fallback to JPEG
            return "jpg";
        }
        return "jpg"; // Default fallback
    }

    /**
     * Get file size of InputStream without consuming it
     */
    public long getImageSize(InputStream inputStream) throws IOException {
        byte[] buffer = inputStream.readAllBytes();
        return buffer.length;
    }
}