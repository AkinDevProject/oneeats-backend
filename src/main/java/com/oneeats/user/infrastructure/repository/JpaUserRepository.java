package com.oneeats.user.infrastructure.repository;

import com.oneeats.shared.domain.vo.Email;
import com.oneeats.user.domain.model.User;
import com.oneeats.user.domain.repository.IUserRepository;
import com.oneeats.user.infrastructure.entity.UserEntity;
import com.oneeats.user.infrastructure.mapper.UserInfrastructureMapper;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
public class JpaUserRepository implements IUserRepository {

    @Inject
    UserInfrastructureMapper mapper;

    @Override
    public Optional<User> findById(UUID id) {
        return UserEntity.find("id", id)
                .firstResultOptional()
                .map(entity -> mapper.toDomain((UserEntity) entity));
    }

    @Override
    public Optional<User> findByEmail(Email email) {
        return UserEntity.find("email", email.getValue())
                .firstResultOptional()
                .map(entity -> mapper.toDomain((UserEntity) entity));
    }

    @Override
    public List<User> findAll() {
        return UserEntity.<UserEntity>listAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public User save(User user) {
        if (user.getId() != null) {
            // Vérifier si l'entité existe déjà en base
            UserEntity existingEntity = UserEntity.findById(user.getId());
            if (existingEntity != null) {
                // Update: mettre à jour l'entité existante
                existingEntity.setFirstName(user.getFirstName());
                existingEntity.setLastName(user.getLastName());
                existingEntity.setEmail(user.getEmail().getValue());
                existingEntity.setStatus(user.getStatus());
                existingEntity.setUpdatedAt(user.getUpdatedAt());
                // L'entité est automatiquement synchronisée avec la base
                return mapper.toDomain(existingEntity);
            } else {
                // Create: l'ID est généré par le domaine mais l'entité n'existe pas en base
                UserEntity entity = mapper.toEntity(user);
                entity.persistAndFlush();
                return mapper.toDomain(entity);
            }
        } else {
            // Création: créer une nouvelle entité
            UserEntity entity = mapper.toEntity(user);
            entity.persistAndFlush();
            return mapper.toDomain(entity);
        }
    }

    public void delete(User user) {
        deleteById(user.getId());
    }

    @Override
    public void deleteById(UUID id) {
        UserEntity.deleteById(id);
    }

    @Override
    public boolean existsByEmail(Email email) {
        return UserEntity.count("email", email.getValue()) > 0;
    }

    /**
     * Trouve un utilisateur par son ID Keycloak.
     * Retourne l'entite JPA directement pour l'AuthService.
     */
    public Optional<UserEntity> findByKeycloakId(String keycloakId) {
        return UserEntity.find("keycloakId", keycloakId).firstResultOptional();
    }

    /**
     * Trouve un utilisateur par son ID (base de donnees) OU son Keycloak ID.
     * Utile quand l'ID peut provenir du mobile (Keycloak) ou du backend (DB).
     * Retourne le modele de domaine (avec validation).
     */
    public Optional<User> findByIdOrKeycloakId(UUID id) {
        if (id == null) {
            return Optional.empty();
        }

        // 1. Chercher par ID de base de donnees
        Optional<User> user = findById(id);
        if (user.isPresent()) {
            return user;
        }

        // 2. Chercher par Keycloak ID (l'UUID pourrait etre un Keycloak ID)
        String keycloakId = id.toString();
        Optional<UserEntity> entityOpt = findByKeycloakId(keycloakId);
        return entityOpt.map(mapper::toDomain);
    }

    /**
     * Trouve un utilisateur par son ID (base de donnees) OU son Keycloak ID.
     * Retourne l'entite JPA directement (sans validation du domaine).
     * Utile pour les cas ou les donnees peuvent etre incompletes.
     */
    public Optional<UserEntity> findEntityByIdOrKeycloakId(UUID id) {
        if (id == null) {
            return Optional.empty();
        }

        // 1. Chercher par ID de base de donnees
        Optional<UserEntity> entity = UserEntity.find("id", id).firstResultOptional();
        if (entity.isPresent()) {
            return entity;
        }

        // 2. Chercher par Keycloak ID (l'UUID pourrait etre un Keycloak ID)
        return findByKeycloakId(id.toString());
    }

    /**
     * Trouve un utilisateur par son email (recherche insensible a la casse).
     * Retourne l'entite JPA directement pour l'AuthService (liaison compte Keycloak).
     */
    public Optional<UserEntity> findEntityByEmail(String email) {
        if (email == null) {
            return Optional.empty();
        }
        return UserEntity.find("LOWER(email) = LOWER(?1)", email.trim()).firstResultOptional();
    }

    /**
     * Persiste une nouvelle entite utilisateur (pour creation depuis Keycloak)
     */
    public void persist(UserEntity entity) {
        entity.persistAndFlush();
    }
}