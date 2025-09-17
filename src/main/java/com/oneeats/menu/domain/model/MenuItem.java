package com.oneeats.menu.domain.model;

import com.oneeats.shared.domain.entity.BaseEntity;
import com.oneeats.shared.domain.exception.ValidationException;
import com.oneeats.menu.domain.vo.*;
import com.oneeats.menu.domain.event.MenuItemCreatedEvent;
import com.oneeats.menu.domain.event.MenuItemUpdatedEvent;
import com.oneeats.menu.domain.event.MenuItemAvailabilityChangedEvent;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Agrégat MenuItem - Article de menu d'un restaurant
 * Suit les principes DDD avec encapsulation des règles métier
 */
public class MenuItem extends BaseEntity {
    
    private UUID restaurantId;
    private MenuItemName name;
    private String description;
    private Price price;
    private Category category;
    private String imageUrl;
    private boolean isAvailable;
    private PreparationTime preparationTime;
    private boolean isVegetarian;
    private boolean isVegan;
    private Allergens allergens;
    private final List<MenuItemOption> options;
    private LocalDateTime lastUpdated;
    
    // Constructeur privé - utiliser les factory methods
    private MenuItem(UUID restaurantId, MenuItemName name, String description, 
                    Price price, Category category) {
        this.restaurantId = validateRestaurantId(restaurantId);
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.isAvailable = true; // Disponible par défaut
        this.preparationTime = PreparationTime.standard(); // 15 minutes par défaut
        this.isVegetarian = false;
        this.isVegan = false;
        this.allergens = Allergens.empty();
        this.options = new ArrayList<>();
        this.lastUpdated = LocalDateTime.now();
    }
    
    // Factory method pour création
    public static MenuItem create(UUID restaurantId, String name, String description, 
                                 Price price, String category) {
        MenuItem menuItem = new MenuItem(
            restaurantId,
            new MenuItemName(name),
            description,
            price,
            Category.of(category)
        );
        
        // Publier l'événement de création
        menuItem.addDomainEvent(new MenuItemCreatedEvent(
            menuItem.getId(),
            menuItem.getRestaurantId(),
            menuItem.getName().getValue(),
            menuItem.getPrice().getAmount(),
            menuItem.getCategory().getValue()
        ));
        
        return menuItem;
    }
    
    // Factory method pour reconstruction depuis la persistence
    public static MenuItem fromPersistence(UUID id, UUID restaurantId, String name, String description,
                                          Price price, String category, String imageUrl, boolean isAvailable,
                                          Integer preparationTimeMinutes, boolean isVegetarian, boolean isVegan,
                                          String allergensString, LocalDateTime createdAt, LocalDateTime updatedAt) {
        MenuItem menuItem = new MenuItem(restaurantId, new MenuItemName(name), description, price, Category.of(category));
        menuItem.setId(id);
        menuItem.imageUrl = imageUrl;
        menuItem.isAvailable = isAvailable;
        if (preparationTimeMinutes != null) {
            menuItem.preparationTime = PreparationTime.ofMinutes(preparationTimeMinutes);
        }
        menuItem.isVegetarian = isVegetarian;
        menuItem.isVegan = isVegan;
        menuItem.allergens = Allergens.fromCommaSeparated(allergensString);
        menuItem.setCreatedAt(createdAt);
        menuItem.lastUpdated = updatedAt;
        
        return menuItem;
    }
    
    // Méthodes métier
    
    /**
     * Mise à jour des informations de base
     */
    public void updateBasicInfo(String name, String description, Price price, String category) {
        MenuItemName newName = new MenuItemName(name);
        Category newCategory = Category.of(category);
        
        boolean hasChanged = !this.name.equals(newName) || 
                           !this.description.equals(description) || 
                           !this.price.equals(price) || 
                           !this.category.equals(newCategory);
        
        if (hasChanged) {
            this.name = newName;
            this.description = description;
            this.price = price;
            this.category = newCategory;
            this.lastUpdated = LocalDateTime.now();
            
            addDomainEvent(new MenuItemUpdatedEvent(getId(), getRestaurantId()));
        }
    }
    
    /**
     * Mise à jour des informations diététiques
     */
    public void updateDietaryInfo(boolean isVegetarian, boolean isVegan, List<String> allergensList) {
        // Règle métier : si végétalien, alors automatiquement végétarien
        if (isVegan && !isVegetarian) {
            isVegetarian = true;
        }
        
        this.isVegetarian = isVegetarian;
        this.isVegan = isVegan;
        this.allergens = allergensList != null ? Allergens.fromStrings(allergensList) : Allergens.empty();
        this.lastUpdated = LocalDateTime.now();
        
        addDomainEvent(new MenuItemUpdatedEvent(getId(), getRestaurantId()));
    }
    
    /**
     * Définir le temps de préparation
     */
    public void setPreparationTime(int minutes) {
        this.preparationTime = PreparationTime.ofMinutes(minutes);
        this.lastUpdated = LocalDateTime.now();
    }
    
    /**
     * Définir l'image
     */
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
        this.lastUpdated = LocalDateTime.now();
    }
    
    /**
     * Rendre disponible
     */
    public void makeAvailable() {
        if (!isAvailable) {
            this.isAvailable = true;
            this.lastUpdated = LocalDateTime.now();
            addDomainEvent(new MenuItemAvailabilityChangedEvent(getId(), getRestaurantId(), true));
        }
    }
    
    /**
     * Rendre indisponible
     */
    public void makeUnavailable() {
        if (isAvailable) {
            this.isAvailable = false;
            this.lastUpdated = LocalDateTime.now();
            addDomainEvent(new MenuItemAvailabilityChangedEvent(getId(), getRestaurantId(), false));
        }
    }
    
    /**
     * Ajouter une option
     */
    public void addOption(MenuItemOption option) {
        if (option == null) {
            throw new ValidationException("Option cannot be null");
        }
        
        // Vérifier que l'option n'existe pas déjà
        if (options.stream().anyMatch(o -> o.getName().equals(option.getName()))) {
            throw new ValidationException("Option with name '" + option.getName() + "' already exists");
        }
        
        options.add(option);
        this.lastUpdated = LocalDateTime.now();
    }
    
    /**
     * Supprimer une option
     */
    public void removeOption(String optionName) {
        options.removeIf(option -> option.getName().equals(optionName));
        this.lastUpdated = LocalDateTime.now();
    }
    
    /**
     * Calculer le prix total avec les options sélectionnées
     */
    public Price calculateTotalPrice(List<String> selectedChoiceIds) {
        Price total = this.price;
        
        for (MenuItemOption option : options) {
            for (MenuItemChoice choice : option.getChoices()) {
                if (selectedChoiceIds.contains(choice.getId().toString())) {
                    total = total.add(choice.getAdditionalPrice());
                }
            }
        }
        
        return total;
    }
    
    /**
     * Vérifier si l'item peut être commandé
     */
    public boolean canBeOrdered() {
        return isAvailable && price.getAmount().compareTo(java.math.BigDecimal.ZERO) > 0;
    }
    
    /**
     * Obtenir le temps de préparation total (incluant les options complexes)
     */
    public PreparationTime getTotalPreparationTime() {
        // Logique pour calculer le temps total en fonction des options
        return preparationTime;
    }
    
    // Validation
    private UUID validateRestaurantId(UUID restaurantId) {
        if (restaurantId == null) {
            throw new ValidationException("Restaurant ID cannot be null");
        }
        return restaurantId;
    }
    
    // Getters
    public UUID getRestaurantId() { return restaurantId; }
    public MenuItemName getName() { return name; }
    public String getDescription() { return description; }
    public Price getPrice() { return price; }
    public Category getCategory() { return category; }
    public String getImageUrl() { return imageUrl; }
    public boolean getIsAvailable() { return isAvailable; }
    public PreparationTime getPreparationTime() { return preparationTime; }
    public boolean getIsVegetarian() { return isVegetarian; }
    public boolean getIsVegan() { return isVegan; }
    public Allergens getAllergens() { return allergens; }
    public List<MenuItemOption> getOptions() { return new ArrayList<>(options); }
    public LocalDateTime getLastUpdated() { return lastUpdated; }
    
    // Pour la compatibilité avec l'ancienne API
    public Integer getPreparationTimeMinutes() {
        return preparationTime != null ? preparationTime.getMinutes() : null;
    }
    
    // Méthodes additionnelles pour les handlers
    public void updateName(String name) {
        this.name = new MenuItemName(name);
        this.lastUpdated = LocalDateTime.now();
        addDomainEvent(new MenuItemUpdatedEvent(getId(), getRestaurantId()));
    }
    
    public void updateDescription(String description) {
        this.description = description;
        this.lastUpdated = LocalDateTime.now();
        addDomainEvent(new MenuItemUpdatedEvent(getId(), getRestaurantId()));
    }
    
    public void updatePrice(Price price) {
        this.price = price;
        this.lastUpdated = LocalDateTime.now();
        addDomainEvent(new MenuItemUpdatedEvent(getId(), getRestaurantId()));
    }
    
    public void updateCategory(String category) {
        this.category = Category.of(category);
        this.lastUpdated = LocalDateTime.now();
        addDomainEvent(new MenuItemUpdatedEvent(getId(), getRestaurantId()));
    }
    
    public void updateImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
        this.lastUpdated = LocalDateTime.now();
        addDomainEvent(new MenuItemUpdatedEvent(getId(), getRestaurantId()));
    }
    
    public void updatePreparationTime(Integer minutes) {
        if (minutes != null) {
            this.preparationTime = PreparationTime.ofMinutes(minutes);
        }
        this.lastUpdated = LocalDateTime.now();
        addDomainEvent(new MenuItemUpdatedEvent(getId(), getRestaurantId()));
    }

    
    public void markAsVegetarian() {
        this.isVegetarian = true;
        this.lastUpdated = LocalDateTime.now();
        addDomainEvent(new MenuItemUpdatedEvent(getId(), getRestaurantId()));
    }
    
    public void unmarkAsVegetarian() {
        this.isVegetarian = false;
        // Si on retire végétarien, on retire aussi végétalien
        if (this.isVegan) {
            this.isVegan = false;
        }
        this.lastUpdated = LocalDateTime.now();
        addDomainEvent(new MenuItemUpdatedEvent(getId(), getRestaurantId()));
    }
    
    public void markAsVegan() {
        this.isVegan = true;
        // Si végétalien, alors végétarien aussi
        this.isVegetarian = true;
        this.lastUpdated = LocalDateTime.now();
        addDomainEvent(new MenuItemUpdatedEvent(getId(), getRestaurantId()));
    }
    
    public void unmarkAsVegan() {
        this.isVegan = false;
        this.lastUpdated = LocalDateTime.now();
        addDomainEvent(new MenuItemUpdatedEvent(getId(), getRestaurantId()));
    }
    
    public void updateAllergens(List<String> allergensList) {
        this.allergens = allergensList != null ? Allergens.fromStrings(allergensList) : Allergens.empty();
        this.lastUpdated = LocalDateTime.now();
        addDomainEvent(new MenuItemUpdatedEvent(getId(), getRestaurantId()));
    }

    /**
     * Remplacer toutes les options par une nouvelle liste
     */
    public void updateOptions(List<MenuItemOption> newOptions) {
        if (newOptions == null) {
            this.options.clear();
        } else {
            this.options.clear();
            this.options.addAll(newOptions);
        }
        this.lastUpdated = LocalDateTime.now();
        addDomainEvent(new MenuItemUpdatedEvent(getId(), getRestaurantId()));
    }
    
    @Override
    public String toString() {
        return "MenuItem{" +
                "name=" + name +
                ", price=" + price +
                ", category=" + category +
                ", available=" + isAvailable +
                '}';
    }
}