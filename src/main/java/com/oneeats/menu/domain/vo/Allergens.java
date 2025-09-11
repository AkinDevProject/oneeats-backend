package com.oneeats.menu.domain.vo;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Value Object pour les allergènes d'un item de menu
 */
public class Allergens {
    private final Set<AllergenType> allergens;
    
    public Allergens(Set<AllergenType> allergens) {
        this.allergens = allergens != null ? 
            Collections.unmodifiableSet(new HashSet<>(allergens)) : 
            Collections.emptySet();
    }
    
    public static Allergens empty() {
        return new Allergens(Collections.emptySet());
    }
    
    public static Allergens of(AllergenType... allergens) {
        return new Allergens(Set.of(allergens));
    }
    
    public static Allergens of(Collection<AllergenType> allergens) {
        return new Allergens(new HashSet<>(allergens));
    }
    
    public static Allergens fromStrings(Collection<String> allergenStrings) {
        if (allergenStrings == null || allergenStrings.isEmpty()) {
            return empty();
        }
        
        Set<AllergenType> types = allergenStrings.stream()
            .map(String::toUpperCase)
            .map(AllergenType::valueOf)
            .collect(Collectors.toSet());
        
        return new Allergens(types);
    }
    
    public static Allergens fromCommaSeparated(String allergensString) {
        if (allergensString == null || allergensString.trim().isEmpty()) {
            return empty();
        }
        
        List<String> allergenStrings = Arrays.stream(allergensString.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .collect(Collectors.toList());
        
        return fromStrings(allergenStrings);
    }
    
    public boolean contains(AllergenType allergen) {
        return allergens.contains(allergen);
    }
    
    public boolean containsAny(Collection<AllergenType> otherAllergens) {
        return otherAllergens.stream().anyMatch(allergens::contains);
    }
    
    public boolean isEmpty() {
        return allergens.isEmpty();
    }
    
    public Set<AllergenType> getAllergens() {
        return allergens;
    }
    
    public String toCommaSeparatedString() {
        if (allergens.isEmpty()) {
            return "";
        }
        
        return allergens.stream()
            .map(AllergenType::name)
            .sorted()
            .collect(Collectors.joining(","));
    }
    
    public List<String> toStringList() {
        return allergens.stream()
            .map(AllergenType::name)
            .sorted()
            .collect(Collectors.toList());
    }
    
    public List<String> getValues() {
        return toStringList();
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Allergens allergens1 = (Allergens) o;
        return Objects.equals(allergens, allergens1.allergens);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(allergens);
    }
    
    @Override
    public String toString() {
        return toCommaSeparatedString();
    }
    
    /**
     * Types d'allergènes possibles
     */
    public enum AllergenType {
        GLUTEN("Gluten"),
        DAIRY("Produits laitiers"),
        EGGS("Œufs"),
        FISH("Poisson"),
        SHELLFISH("Crustacés"),
        TREE_NUTS("Fruits à coque"),
        PEANUTS("Arachides"),
        SOY("Soja"),
        SESAME("Sésame"),
        CELERY("Céleri"),
        MUSTARD("Moutarde"),
        SULFITES("Sulfites"),
        LUPIN("Lupin"),
        MOLLUSKS("Mollusques");
        
        private final String displayName;
        
        AllergenType(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
}