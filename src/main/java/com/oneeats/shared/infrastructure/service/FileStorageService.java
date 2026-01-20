package com.oneeats.shared.infrastructure.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class FileStorageService {

    private static final Logger LOG = Logger.getLogger(FileStorageService.class);

    @Inject
    ImageResizingService imageResizingService;

    private static final String UPLOAD_DIR = "uploads";
    private static final String RESTAURANTS_DIR = "restaurants";
    private static final String MENU_ITEMS_DIR = "menu-items";
    private static final String THUMBNAILS_DIR = "thumbnails";
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "webp");
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    // Suffixes pour les differentes tailles
    public static final String SUFFIX_SMALL = "_small";   // 150x150
    public static final String SUFFIX_MEDIUM = "_medium"; // 400x400
    public static final String SUFFIX_LARGE = "_large";   // 800x800

    public String saveRestaurantImage(InputStream inputStream, String originalFilename, long estimatedFileSize) throws IOException {
        // Basic filename validation first
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            throw new IllegalArgumentException("Filename cannot be empty");
        }

        String extension = getFileExtension(originalFilename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Only JPG, PNG, and WebP files are allowed");
        }

        // Create directories if they don't exist
        Path uploadPath = Paths.get(UPLOAD_DIR, RESTAURANTS_DIR);
        Path thumbnailPath = Paths.get(UPLOAD_DIR, RESTAURANTS_DIR, THUMBNAILS_DIR);
        Files.createDirectories(uploadPath);
        Files.createDirectories(thumbnailPath);

        // Generate unique base filename (without extension)
        String uniqueBaseFilename = UUID.randomUUID().toString();
        String uniqueFilename = uniqueBaseFilename + "." + extension;

        // Read the original image into memory for multiple resizing operations
        byte[] originalBytes = inputStream.readAllBytes();

        // Validate file size before processing
        if (originalBytes.length > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 5MB");
        }

        if (originalBytes.length == 0) {
            throw new IllegalArgumentException("Empty file");
        }

        // Save optimized large version (800x800 max) as the main image
        Path mainFilePath = uploadPath.resolve(uniqueFilename);
        InputStream largeImage = imageResizingService.optimizeForWeb(
            new ByteArrayInputStream(originalBytes), extension);
        Files.copy(largeImage, mainFilePath, StandardCopyOption.REPLACE_EXISTING);
        LOG.infof("Saved large image: %s", mainFilePath);

        // Generate and save thumbnails asynchronously in background
        generateThumbnails(originalBytes, extension, uniqueBaseFilename, thumbnailPath);

        // Return relative path for URL (main image)
        return "/" + UPLOAD_DIR + "/" + RESTAURANTS_DIR + "/" + uniqueFilename;
    }

    /**
     * Generate thumbnails in multiple sizes (small, medium)
     */
    private void generateThumbnails(byte[] originalBytes, String extension, String baseFilename, Path thumbnailPath) {
        try {
            // Generate small thumbnail (150x150)
            String smallFilename = baseFilename + SUFFIX_SMALL + "." + extension;
            InputStream smallImage = imageResizingService.createThumbnail(
                new ByteArrayInputStream(originalBytes), extension);
            Files.copy(smallImage, thumbnailPath.resolve(smallFilename), StandardCopyOption.REPLACE_EXISTING);
            LOG.infof("Generated small thumbnail: %s", smallFilename);

            // Generate medium thumbnail (400x400)
            String mediumFilename = baseFilename + SUFFIX_MEDIUM + "." + extension;
            InputStream mediumImage = imageResizingService.createMediumImage(
                new ByteArrayInputStream(originalBytes), extension);
            Files.copy(mediumImage, thumbnailPath.resolve(mediumFilename), StandardCopyOption.REPLACE_EXISTING);
            LOG.infof("Generated medium thumbnail: %s", mediumFilename);

        } catch (IOException e) {
            LOG.warnf("Failed to generate thumbnails for %s: %s", baseFilename, e.getMessage());
            // Don't fail the main upload if thumbnail generation fails
        }
    }
    
    public void deleteFile(String filePath) {
        if (filePath != null && !filePath.isEmpty()) {
            try {
                // Remove leading slash if present
                String cleanPath = filePath.startsWith("/") ? filePath.substring(1) : filePath;
                Path path = Paths.get(cleanPath);
                Files.deleteIfExists(path);

                // Also delete associated thumbnails
                deleteThumbnails(cleanPath);
            } catch (IOException e) {
                LOG.warnf("Failed to delete file: %s - %s", filePath, e.getMessage());
            }
        }
    }

    /**
     * Delete thumbnails associated with a main image
     */
    private void deleteThumbnails(String mainFilePath) {
        try {
            // Extract directory and filename parts
            Path mainPath = Paths.get(mainFilePath);
            String filename = mainPath.getFileName().toString();
            String parentDir = mainPath.getParent().toString();

            // Get base filename without extension
            int dotIndex = filename.lastIndexOf('.');
            if (dotIndex == -1) return;

            String baseFilename = filename.substring(0, dotIndex);
            String extension = filename.substring(dotIndex);

            // Delete thumbnails in the thumbnails subdirectory
            Path thumbnailDir = Paths.get(parentDir, THUMBNAILS_DIR);
            if (Files.exists(thumbnailDir)) {
                Files.deleteIfExists(thumbnailDir.resolve(baseFilename + SUFFIX_SMALL + extension));
                Files.deleteIfExists(thumbnailDir.resolve(baseFilename + SUFFIX_MEDIUM + extension));
                LOG.infof("Deleted thumbnails for: %s", baseFilename);
            }
        } catch (IOException e) {
            LOG.warnf("Failed to delete thumbnails: %s", e.getMessage());
        }
    }

    public String saveMenuItemImage(InputStream inputStream, String originalFilename, long estimatedFileSize) throws IOException {
        // Basic filename validation first
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            throw new IllegalArgumentException("Filename cannot be empty");
        }

        String extension = getFileExtension(originalFilename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Only JPG, PNG, and WebP files are allowed");
        }

        // Create directories if they don't exist
        Path uploadPath = Paths.get(UPLOAD_DIR, MENU_ITEMS_DIR);
        Path thumbnailPath = Paths.get(UPLOAD_DIR, MENU_ITEMS_DIR, THUMBNAILS_DIR);
        Files.createDirectories(uploadPath);
        Files.createDirectories(thumbnailPath);

        // Generate unique base filename (without extension)
        String uniqueBaseFilename = UUID.randomUUID().toString();
        String uniqueFilename = uniqueBaseFilename + "." + extension;

        // Read the original image into memory for multiple resizing operations
        byte[] originalBytes = inputStream.readAllBytes();

        // Validate file size before processing
        if (originalBytes.length > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 5MB");
        }

        if (originalBytes.length == 0) {
            throw new IllegalArgumentException("Empty file");
        }

        // Save optimized large version (800x800 max) as the main image
        Path mainFilePath = uploadPath.resolve(uniqueFilename);
        InputStream largeImage = imageResizingService.optimizeForWeb(
            new ByteArrayInputStream(originalBytes), extension);
        Files.copy(largeImage, mainFilePath, StandardCopyOption.REPLACE_EXISTING);
        LOG.infof("Saved large menu item image: %s", mainFilePath);

        // Generate and save thumbnails
        generateThumbnails(originalBytes, extension, uniqueBaseFilename, thumbnailPath);

        // Return relative path for URL (main image)
        return "/" + UPLOAD_DIR + "/" + MENU_ITEMS_DIR + "/" + uniqueFilename;
    }

    private void validateFile(String filename, long fileSize) {
        if (filename == null || filename.trim().isEmpty()) {
            throw new IllegalArgumentException("Filename cannot be empty");
        }
        
        if (fileSize > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 5MB");
        }
        
        String extension = getFileExtension(filename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Only JPG, PNG, and WebP files are allowed");
        }
    }
    
    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1 || lastDotIndex == filename.length() - 1) {
            throw new IllegalArgumentException("File must have a valid extension");
        }
        return filename.substring(lastDotIndex + 1).toLowerCase();
    }
}