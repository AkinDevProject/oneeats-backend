package com.oneeats.shared.infrastructure.service;

import jakarta.enterprise.context.ApplicationScoped;
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
    
    private static final String UPLOAD_DIR = "uploads";
    private static final String RESTAURANTS_DIR = "restaurants";
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "webp");
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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
        Files.createDirectories(uploadPath);
        
        // Generate unique filename
        String uniqueFilename = UUID.randomUUID().toString() + "." + extension;
        Path filePath = uploadPath.resolve(uniqueFilename);
        
        // Save file and get actual size
        long actualFileSize = Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
        
        // Validate actual file size after saving
        if (actualFileSize > MAX_FILE_SIZE) {
            // Delete the file if it's too large
            Files.deleteIfExists(filePath);
            throw new IllegalArgumentException("File size exceeds maximum limit of 5MB");
        }
        
        if (actualFileSize == 0) {
            Files.deleteIfExists(filePath);
            throw new IllegalArgumentException("Empty file");
        }
        
        // Return relative path for URL
        return "/" + UPLOAD_DIR + "/" + RESTAURANTS_DIR + "/" + uniqueFilename;
    }
    
    public void deleteFile(String filePath) {
        if (filePath != null && !filePath.isEmpty()) {
            try {
                // Remove leading slash if present
                String cleanPath = filePath.startsWith("/") ? filePath.substring(1) : filePath;
                Path path = Paths.get(cleanPath);
                Files.deleteIfExists(path);
            } catch (IOException e) {
                // Log error but don't throw - file deletion is not critical
                System.err.println("Failed to delete file: " + filePath + " - " + e.getMessage());
            }
        }
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