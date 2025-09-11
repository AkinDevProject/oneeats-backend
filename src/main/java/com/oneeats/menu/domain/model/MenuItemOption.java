package com.oneeats.menu.domain.model;

import com.oneeats.shared.domain.entity.BaseEntity;
import com.oneeats.shared.domain.exception.ValidationException;
import com.oneeats.menu.domain.vo.Price;

import java.util.ArrayList;
import java.util.List;

/**
 * Entité MenuItemOption - Option pour un item de menu (ex: taille, garnitures)
 */
public class MenuItemOption extends BaseEntity {
    
    private final String name;
    private final String description;
    private final MenuItemOptionType type;
    private final boolean isRequired;
    private final int maxChoices;
    private final int displayOrder;
    private final List<MenuItemChoice> choices;
    
    public MenuItemOption(String name, String description, MenuItemOptionType type, 
                         boolean isRequired, int maxChoices, int displayOrder) {
        this.name = validateName(name);
        this.description = description;
        this.type = validateType(type);
        this.isRequired = isRequired;
        this.maxChoices = validateMaxChoices(maxChoices);
        this.displayOrder = displayOrder;
        this.choices = new ArrayList<>();
    }
    
    // Méthodes métier
    
    /**
     * Ajouter un choix à cette option
     */
    public void addChoice(MenuItemChoice choice) {
        if (choice == null) {
            throw new ValidationException("Choice cannot be null");
        }
        
        // Vérifier que le choix n'existe pas déjà
        if (choices.stream().anyMatch(c -> c.getName().equals(choice.getName()))) {
            throw new ValidationException("Choice with name '" + choice.getName() + "' already exists");
        }
        
        choices.add(choice);
    }
    
    /**
     * Supprimer un choix
     */
    public void removeChoice(String choiceName) {
        choices.removeIf(choice -> choice.getName().equals(choiceName));
    }
    
    /**
     * Valider une sélection de choix
     */
    public void validateSelection(List<String> selectedChoiceIds) {
        if (isRequired && (selectedChoiceIds == null || selectedChoiceIds.isEmpty())) {
            throw new ValidationException("Option '" + name + "' is required");
        }
        
        if (selectedChoiceIds != null && selectedChoiceIds.size() > maxChoices) {
            throw new ValidationException("Option '" + name + "' allows maximum " + maxChoices + " choices");
        }
        
        // Vérifier que tous les choix sélectionnés existent
        if (selectedChoiceIds != null) {
            for (String choiceId : selectedChoiceIds) {
                if (choices.stream().noneMatch(c -> c.getId().toString().equals(choiceId))) {
                    throw new ValidationException("Invalid choice ID: " + choiceId);
                }
            }
        }
    }
    
    /**
     * Calculer le prix additionnel pour une sélection
     */
    public Price calculateAdditionalPrice(List<String> selectedChoiceIds) {
        if (selectedChoiceIds == null || selectedChoiceIds.isEmpty()) {
            return Price.of(0);
        }
        
        return choices.stream()
            .filter(choice -> selectedChoiceIds.contains(choice.getId().toString()))
            .map(MenuItemChoice::getAdditionalPrice)
            .reduce(Price.of(0), Price::add);
    }
    
    /**
     * Vérifier si l'option permet plusieurs choix
     */
    public boolean allowsMultipleChoices() {
        return maxChoices > 1;
    }
    
    /**
     * Obtenir les choix disponibles
     */
    public List<MenuItemChoice> getAvailableChoices() {
        return choices.stream()
            .filter(MenuItemChoice::getIsAvailable)
            .toList();
    }
    
    // Validation
    private String validateName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new ValidationException("Option name cannot be null or empty");
        }
        if (name.length() > 100) {
            throw new ValidationException("Option name cannot exceed 100 characters");
        }
        return name.trim();
    }
    
    private MenuItemOptionType validateType(MenuItemOptionType type) {
        if (type == null) {
            throw new ValidationException("Option type cannot be null");
        }
        return type;
    }
    
    private int validateMaxChoices(int maxChoices) {
        // 0 ou -1 signifie illimité (pour les types MODIFICATION ou EXTRA)
        if (maxChoices < 0) {
            return 0; // Normaliser -1 vers 0 pour "illimité"
        }
        if (maxChoices > 50) {
            throw new ValidationException("Max choices cannot exceed 50");
        }
        return maxChoices;
    }
    
    // Getters
    public String getName() { return name; }
    public String getDescription() { return description; }
    public MenuItemOptionType getType() { return type; }
    public boolean getIsRequired() { return isRequired; }
    public int getMaxChoices() { return maxChoices; }
    public int getDisplayOrder() { return displayOrder; }
    public List<MenuItemChoice> getChoices() { return new ArrayList<>(choices); }
    
    @Override
    public String toString() {
        return "MenuItemOption{" +
                "name='" + name + '\'' +
                ", type=" + type +
                ", required=" + isRequired +
                ", maxChoices=" + maxChoices +
                ", choicesCount=" + choices.size() +
                '}';
    }
}