package com.oneeats.menu.application.command;

import com.oneeats.menu.application.dto.MenuItemDTO;
import com.oneeats.menu.application.mapper.MenuItemApplicationMapper;
import com.oneeats.menu.domain.model.MenuItem;
import com.oneeats.menu.domain.repository.IMenuItemRepository;
import com.oneeats.shared.domain.exception.EntityNotFoundException;
import com.oneeats.shared.infrastructure.service.FileStorageService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.io.IOException;

@ApplicationScoped
public class UploadMenuItemImageCommandHandler {

    @Inject
    IMenuItemRepository menuItemRepository;

    @Inject
    FileStorageService fileStorageService;

    @Inject
    MenuItemApplicationMapper mapper;

    @Transactional
    public MenuItemDTO handle(UploadMenuItemImageCommand command) {
        // Find menu item
        MenuItem menuItem = menuItemRepository.findById(command.menuItemId())
            .orElseThrow(() -> new EntityNotFoundException("Menu item not found"));

        try {
            // Delete old image if exists and it's a local file (not external URL)
            if (menuItem.getImageUrl() != null &&
                !menuItem.getImageUrl().startsWith("http://") &&
                !menuItem.getImageUrl().startsWith("https://")) {
                fileStorageService.deleteFile(menuItem.getImageUrl());
            }

            // Save new image
            String imageUrl = fileStorageService.saveMenuItemImage(
                command.inputStream(),
                command.filename(),
                command.fileSize()
            );

            // Update menu item
            menuItem.updateImageUrl(imageUrl);
            MenuItem savedMenuItem = menuItemRepository.save(menuItem);

            return mapper.toDTO(savedMenuItem);

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image: " + e.getMessage(), e);
        }
    }
}