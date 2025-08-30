package com.oneeats.user.infrastructure;

import com.oneeats.user.domain.User;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository pour les utilisateurs
 * Utilise PanacheRepositoryBase avec UUID pour simplifier les opérations CRUD
 */
@ApplicationScoped
public class UserRepository implements PanacheRepositoryBase<User, UUID> {
    
    /**
     * Trouver un utilisateur par email
     */
    public Optional<User> findByEmail(String email) {
        return find("email", email).firstResultOptional();
    }
    
    /**
     * Vérifier si un email existe déjà
     */
    public boolean existsByEmail(String email) {
        return count("email", email) > 0;
    }
    
    /**
     * Trouver tous les utilisateurs actifs
     */
    public List<User> findActiveUsers() {
        return list("isActive", true);
    }
    
    /**
     * Rechercher des utilisateurs par nom (prénom ou nom)
     */
    public List<User> searchByName(String searchTerm) {
        return list("firstName ilike ?1 or lastName ilike ?1", "%" + searchTerm + "%");
    }
    
    /**
     * Compter les utilisateurs actifs
     */
    public long countActiveUsers() {
        return count("isActive", true);
    }
    
    /**
     * Trouver un utilisateur par ID avec vérification d'existence
     */
    public User findByIdRequired(UUID id) {
        User user = findById(id);
        if (user == null) {
            throw new RuntimeException("Utilisateur introuvable avec l'ID: " + id);
        }
        return user;
    }
}