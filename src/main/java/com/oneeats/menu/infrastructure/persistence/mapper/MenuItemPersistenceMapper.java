package com.oneeats.menu.infrastructure.persistence.mapper;

import com.oneeats.menu.domain.model.MenuItem;
import com.oneeats.menu.domain.model.MenuItemChoice;
import com.oneeats.menu.domain.model.MenuItemOption;
import com.oneeats.menu.domain.vo.Price;
import com.oneeats.menu.infrastructure.persistence.entity.MenuItemChoiceEntity;
import com.oneeats.menu.infrastructure.persistence.entity.MenuItemEntity;
import com.oneeats.menu.infrastructure.persistence.entity.MenuItemOptionEntity;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

/**
 * Mapper pour convertir entre les entités JPA et les modèles de domaine
 * Couche anti-corruption entre persistence et domaine
 */
@ApplicationScoped
public class MenuItemPersistenceMapper {
    
    /**
     * Convertit une entité JPA vers un modèle de domaine
     */
    public MenuItem toDomain(MenuItemEntity entity) {
        if (entity == null) {
            return null;
        }
        
        // Utilisation du factory method pour reconstruction
        MenuItem menuItem = MenuItem.fromPersistence(
            entity.getId(),
            entity.getRestaurantId(),
            entity.getName(),
            entity.getDescription(),
            Price.of(entity.getPrice()),
            entity.getCategory(),
            entity.getImageUrl(),
            entity.getIsAvailable(),
            entity.getPreparationTimeMinutes(),
            entity.getIsVegetarian(),
            entity.getIsVegan(),
            entity.getAllergens(),
            entity.getCreatedAt(),
            LocalDateTime.now()
        );
        
        // Conversion des options si présentes (utilisation temporaire de getOptionsAsList pour compatibilité)
        if (entity.getOptions() != null && !entity.getOptions().isEmpty()) {
            entity.getOptionsAsList().forEach(optionEntity -> {
                MenuItemOption option = toOptionDomain(optionEntity);
                menuItem.addOption(option);
            });
        }
        
        return menuItem;
    }
    
    /**
     * Convertit un modèle de domaine vers une entité JPA (nouvelle entité)
     */
    public MenuItemEntity toEntity(MenuItem domain) {
        if (domain == null) {
            return null;
        }

        MenuItemEntity entity = new MenuItemEntity();
        // Ne PAS copier l'ID pour une nouvelle entité - laisser JPA le générer
        updateEntityFromDomainWithoutId(entity, domain);

        return entity;
    }
    
    /**
     * Met à jour une entité existante avec les données du domaine (pour update)
     */
    public void updateEntityFromDomain(MenuItemEntity entity, MenuItem domain) {
        // L'ID est déjà défini sur l'entité existante, ne pas le modifier
        updateEntityFromDomainWithoutId(entity, domain);
    }

    /**
     * Met à jour une entité avec les données du domaine sans toucher à l'ID
     */
    private void updateEntityFromDomainWithoutId(MenuItemEntity entity, MenuItem domain) {
        entity.setRestaurantId(domain.getRestaurantId());
        entity.setName(domain.getName().getValue());
        entity.setDescription(domain.getDescription());
        entity.setPrice(domain.getPrice().getAmount());
        entity.setCategory(domain.getCategory().getValue());
        entity.setImageUrl(domain.getImageUrl());
        entity.setIsAvailable(domain.getIsAvailable());
        entity.setPreparationTimeMinutes(domain.getPreparationTimeMinutes());
        entity.setIsVegetarian(domain.getIsVegetarian());
        entity.setIsVegan(domain.getIsVegan());
        entity.setAllergens(domain.getAllergens().toCommaSeparatedString());
        entity.setCreatedAt(domain.getCreatedAt());
        entity.setUpdatedAt(domain.getLastUpdated());

        // Conversion des options
        entity.getOptions().clear();
        if (domain.getOptions() != null) {
            domain.getOptions().forEach(optionDomain -> {
                MenuItemOptionEntity optionEntity = toOptionEntity(optionDomain);
                optionEntity.setMenuItem(entity);
                entity.getOptions().add(optionEntity);
            });
        }
    }
    
    /**
     * Convertit une option d'entité vers domaine
     */
    private MenuItemOption toOptionDomain(MenuItemOptionEntity entity) {
        if (entity == null) {
            return null;
        }
        
        MenuItemOption option = new MenuItemOption(
            entity.getName(),
            entity.getDescription(),
            entity.getType(),
            entity.getIsRequired(),
            entity.getMaxChoices() != null ? entity.getMaxChoices() : 0,
            entity.getDisplayOrder()
        );
        
        // Reconstituer l'ID pour l'option
        option.setId(entity.getId());
        option.setCreatedAt(entity.getCreatedAt());
        // Note: Domain objects should be immutable
        
        // Conversion des choix
        if (entity.getChoices() != null) {
            entity.getChoices().forEach(choiceEntity -> {
                MenuItemChoice choice = toChoiceDomain(choiceEntity);
                option.addChoice(choice);
            });
        }
        
        return option;
    }
    
    /**
     * Convertit un choix d'entité vers domaine
     */
    private MenuItemChoice toChoiceDomain(MenuItemChoiceEntity entity) {
        if (entity == null) {
            return null;
        }
        
        MenuItemChoice choice = MenuItemChoice.create(
            entity.getName(),
            entity.getDescription(),
            Price.of(entity.getAdditionalPrice()),
            entity.getDisplayOrder()
        );
        
        // Reconstituer l'ID et les propriétés
        choice.setId(entity.getId());
        choice.setCreatedAt(entity.getCreatedAt());
        // Note: Domain objects should be immutable
        
        if (!entity.getIsAvailable()) {
            choice.makeUnavailable();
        }
        
        return choice;
    }
    
    /**
     * Convertit une option de domaine vers entité
     */
    private MenuItemOptionEntity toOptionEntity(MenuItemOption domain) {
        if (domain == null) {
            return null;
        }
        
        MenuItemOptionEntity entity = new MenuItemOptionEntity();
        entity.setId(domain.getId());
        entity.setName(domain.getName());
        entity.setDescription(domain.getDescription());
        entity.setType(domain.getType());
        entity.setIsRequired(domain.getIsRequired());
        entity.setMaxChoices(domain.getMaxChoices());
        entity.setDisplayOrder(domain.getDisplayOrder());
        entity.setCreatedAt(domain.getCreatedAt());
        entity.setUpdatedAt(LocalDateTime.now());
        
        // Conversion des choix
        if (domain.getChoices() != null) {
            domain.getChoices().forEach(choiceDomain -> {
                MenuItemChoiceEntity choiceEntity = toChoiceEntity(choiceDomain);
                choiceEntity.setOption(entity);
                entity.getChoices().add(choiceEntity);
            });
        }
        
        return entity;
    }
    
    /**
     * Convertit un choix de domaine vers entité
     */
    private MenuItemChoiceEntity toChoiceEntity(MenuItemChoice domain) {
        if (domain == null) {
            return null;
        }
        
        MenuItemChoiceEntity entity = new MenuItemChoiceEntity();
        entity.setId(domain.getId());
        entity.setName(domain.getName());
        entity.setDescription(domain.getDescription());
        entity.setAdditionalPrice(domain.getAdditionalPrice().getAmount());
        entity.setDisplayOrder(domain.getDisplayOrder());
        entity.setIsAvailable(domain.getIsAvailable());
        entity.setCreatedAt(domain.getCreatedAt());
        entity.setUpdatedAt(LocalDateTime.now());
        
        return entity;
    }
}