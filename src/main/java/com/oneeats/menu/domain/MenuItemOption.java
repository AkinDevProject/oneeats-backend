package com.oneeats.menu.domain;

import com.oneeats.common.domain.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Entité MenuItemOption - Option de personnalisation d'un article de menu
 */
@Entity
@Table(name = "menu_item_option")
public class MenuItemOption extends BaseEntity {
    
    @NotNull(message = "L'ID de l'article de menu est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;
    
    @NotBlank(message = "Le nom de l'option est obligatoire")
    @Column(nullable = false)
    private String name;
    
    @NotNull(message = "Le type d'option est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(name = "option_type", nullable = false)
    private MenuItemOptionType type;
    
    @Column(name = "is_required", nullable = false)
    private Boolean isRequired = false;
    
    @Column(name = "max_choices")
    private Integer maxChoices;
    
    @Column(name = "display_order")
    private Integer displayOrder = 0;
    
    @OneToMany(mappedBy = "menuItemOption", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<MenuItemChoice> choices = new ArrayList<>();
    
    // Constructeur protégé pour JPA
    protected MenuItemOption() {}
    
    // Constructeur métier
    public MenuItemOption(MenuItem menuItem, String name, MenuItemOptionType type) {
        this.menuItem = Objects.requireNonNull(menuItem, "L'article de menu ne peut pas être null");
        this.name = Objects.requireNonNull(name, "Le nom ne peut pas être null");
        this.type = Objects.requireNonNull(type, "Le type ne peut pas être null");
    }
    
    // Méthodes métier
    public void updateInfo(String name, MenuItemOptionType type, Boolean isRequired, Integer maxChoices) {
        this.name = Objects.requireNonNull(name, "Le nom ne peut pas être null");
        this.type = Objects.requireNonNull(type, "Le type ne peut pas être null");
        this.isRequired = isRequired != null ? isRequired : false;
        this.maxChoices = maxChoices;
        
        // Validation métier
        if (type == MenuItemOptionType.CHOICE && maxChoices != null && maxChoices < 1) {
            throw new IllegalArgumentException("Le nombre maximum de choix doit être positif");
        }
    }
    
    public void addChoice(MenuItemChoice choice) {
        Objects.requireNonNull(choice, "Le choix ne peut pas être null");
        choice.setMenuItemOption(this);
        this.choices.add(choice);
    }
    
    public void removeChoice(MenuItemChoice choice) {
        if (this.choices.remove(choice)) {
            choice.setMenuItemOption(null);
        }
    }
    
    public boolean canHaveMultipleChoices() {
        return type == MenuItemOptionType.CHOICE && (maxChoices == null || maxChoices > 1);
    }
    
    public boolean hasPrice() {
        return type == MenuItemOptionType.EXTRA;
    }
    
    // Getters
    public MenuItem getMenuItem() { return menuItem; }
    public String getName() { return name; }
    public MenuItemOptionType getType() { return type; }
    public Boolean getIsRequired() { return isRequired; }
    public Integer getMaxChoices() { return maxChoices; }
    public Integer getDisplayOrder() { return displayOrder; }
    public List<MenuItemChoice> getChoices() { return List.copyOf(choices); }
    
    // Setters pour JPA et migration
    public void setMenuItem(MenuItem menuItem) { this.menuItem = menuItem; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
}