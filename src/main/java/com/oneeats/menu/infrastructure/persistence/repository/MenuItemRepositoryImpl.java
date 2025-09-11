package com.oneeats.menu.infrastructure.persistence.repository;

import com.oneeats.menu.domain.model.MenuItem;
import com.oneeats.menu.domain.repository.IMenuItemRepository;
import com.oneeats.menu.domain.vo.Category;
import com.oneeats.menu.infrastructure.persistence.entity.MenuItemEntity;
import com.oneeats.menu.infrastructure.persistence.mapper.MenuItemPersistenceMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.TypedQuery;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implémentation de l'adaptateur repository pour MenuItem
 * Traduit les opérations de domaine vers la persistence JPA
 */
@ApplicationScoped
public class MenuItemRepositoryImpl implements IMenuItemRepository {
    
    @Inject
    EntityManager entityManager;
    
    @Inject
    MenuItemPersistenceMapper mapper;
    
    @Override
    public MenuItem save(MenuItem menuItem) {
        MenuItemEntity entity;
        
        if (menuItem.getId() == null) {
            // Création
            entity = mapper.toEntity(menuItem);
            entityManager.persist(entity);
        } else {
            // Mise à jour
            entity = entityManager.find(MenuItemEntity.class, menuItem.getId());
            if (entity == null) {
                entity = mapper.toEntity(menuItem);
                entityManager.persist(entity);
            } else {
                mapper.updateEntityFromDomain(entity, menuItem);
                entity = entityManager.merge(entity);
            }
        }
        
        entityManager.flush();
        return mapper.toDomain(entity);
    }
    
    @Override
    public Optional<MenuItem> findById(UUID id) {
        MenuItemEntity entity = entityManager.createQuery(
            "SELECT mi FROM MenuItemEntity mi " +
            "LEFT JOIN FETCH mi.options o " +
            "LEFT JOIN FETCH o.choices " +
            "WHERE mi.id = :id", MenuItemEntity.class)
            .setParameter("id", id)
            .getResultStream()
            .findFirst()
            .orElse(null);
        
        return entity != null ? Optional.of(mapper.toDomain(entity)) : Optional.empty();
    }
    
    @Override
    public void deleteById(UUID id) {
        MenuItemEntity entity = entityManager.find(MenuItemEntity.class, id);
        if (entity != null) {
            entityManager.remove(entity);
        }
    }
    
    @Override
    public boolean existsById(UUID id) {
        Long count = entityManager.createQuery(
            "SELECT COUNT(mi) FROM MenuItemEntity mi WHERE mi.id = :id", Long.class)
            .setParameter("id", id)
            .getSingleResult();
        return count > 0;
    }
    
    @Override
    public List<MenuItem> findByRestaurantId(UUID restaurantId) {
        List<MenuItemEntity> entities = entityManager.createQuery(
            "SELECT DISTINCT mi FROM MenuItemEntity mi " +
            "LEFT JOIN FETCH mi.options o " +
            "LEFT JOIN FETCH o.choices " +
            "WHERE mi.restaurantId = :restaurantId " +
            "ORDER BY mi.category, mi.name", MenuItemEntity.class)
            .setParameter("restaurantId", restaurantId)
            .getResultList();
            
        return entities.stream()
            .map(mapper::toDomain)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<MenuItem> findAvailableByRestaurantId(UUID restaurantId) {
        List<MenuItemEntity> entities = entityManager.createQuery(
            "SELECT DISTINCT mi FROM MenuItemEntity mi " +
            "LEFT JOIN FETCH mi.options o " +
            "LEFT JOIN FETCH o.choices " +
            "WHERE mi.restaurantId = :restaurantId AND mi.isAvailable = true " +
            "ORDER BY mi.category, mi.name", MenuItemEntity.class)
            .setParameter("restaurantId", restaurantId)
            .getResultList();
            
        return entities.stream()
            .map(mapper::toDomain)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<MenuItem> findByRestaurantIdAndCategory(UUID restaurantId, Category category) {
        List<MenuItemEntity> entities = entityManager.createQuery(
            "SELECT DISTINCT mi FROM MenuItemEntity mi " +
            "LEFT JOIN FETCH mi.options o " +
            "LEFT JOIN FETCH o.choices " +
            "WHERE mi.restaurantId = :restaurantId AND mi.category = :category " +
            "ORDER BY mi.name", MenuItemEntity.class)
            .setParameter("restaurantId", restaurantId)
            .setParameter("category", category.getValue())
            .getResultList();
            
        return entities.stream()
            .map(mapper::toDomain)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<MenuItem> findVegetarianByRestaurantId(UUID restaurantId) {
        List<MenuItemEntity> entities = entityManager.createQuery(
            "SELECT mi FROM MenuItemEntity mi " +
            "WHERE mi.restaurantId = :restaurantId AND mi.isVegetarian = true " +
            "ORDER BY mi.category, mi.name", MenuItemEntity.class)
            .setParameter("restaurantId", restaurantId)
            .getResultList();
            
        return entities.stream()
            .map(mapper::toDomain)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<MenuItem> findVeganByRestaurantId(UUID restaurantId) {
        List<MenuItemEntity> entities = entityManager.createQuery(
            "SELECT mi FROM MenuItemEntity mi " +
            "WHERE mi.restaurantId = :restaurantId AND mi.isVegan = true " +
            "ORDER BY mi.category, mi.name", MenuItemEntity.class)
            .setParameter("restaurantId", restaurantId)
            .getResultList();
            
        return entities.stream()
            .map(mapper::toDomain)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<MenuItem> searchInRestaurant(UUID restaurantId, String searchTerm) {
        String searchPattern = "%" + searchTerm.toLowerCase() + "%";
        
        List<MenuItemEntity> entities = entityManager.createQuery(
            "SELECT mi FROM MenuItemEntity mi " +
            "WHERE mi.restaurantId = :restaurantId " +
            "AND (LOWER(mi.name) LIKE :searchTerm OR LOWER(mi.description) LIKE :searchTerm) " +
            "ORDER BY mi.name", MenuItemEntity.class)
            .setParameter("restaurantId", restaurantId)
            .setParameter("searchTerm", searchPattern)
            .getResultList();
            
        return entities.stream()
            .map(mapper::toDomain)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<MenuItem> findWithFilters(UUID restaurantId, String category, Boolean vegetarian, 
                                         Boolean vegan, Boolean available, int page, int size) {
        
        StringBuilder jpql = new StringBuilder("SELECT mi FROM MenuItemEntity mi WHERE mi.restaurantId = :restaurantId");
        
        if (category != null) {
            jpql.append(" AND mi.category = :category");
        }
        if (vegetarian != null) {
            jpql.append(" AND mi.isVegetarian = :vegetarian");
        }
        if (vegan != null) {
            jpql.append(" AND mi.isVegan = :vegan");
        }
        if (available != null) {
            jpql.append(" AND mi.isAvailable = :available");
        }
        
        jpql.append(" ORDER BY mi.category, mi.name");
        
        TypedQuery<MenuItemEntity> query = entityManager.createQuery(jpql.toString(), MenuItemEntity.class);
        query.setParameter("restaurantId", restaurantId);
        
        if (category != null) {
            query.setParameter("category", category);
        }
        if (vegetarian != null) {
            query.setParameter("vegetarian", vegetarian);
        }
        if (vegan != null) {
            query.setParameter("vegan", vegan);
        }
        if (available != null) {
            query.setParameter("available", available);
        }
        
        query.setFirstResult(page * size);
        query.setMaxResults(size);
        
        List<MenuItemEntity> entities = query.getResultList();
        
        return entities.stream()
            .map(mapper::toDomain)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<String> findCategoriesByRestaurantId(UUID restaurantId) {
        return entityManager.createQuery(
            "SELECT DISTINCT mi.category FROM MenuItemEntity mi " +
            "WHERE mi.restaurantId = :restaurantId " +
            "ORDER BY mi.category", String.class)
            .setParameter("restaurantId", restaurantId)
            .getResultList();
    }
    
    @Override
    public boolean deleteByIdSafe(UUID id) {
        int deletedCount = entityManager.createQuery(
            "DELETE FROM MenuItemEntity mi WHERE mi.id = :id")
            .setParameter("id", id)
            .executeUpdate();
        return deletedCount > 0;
    }
    
    @Override
    public long countByRestaurantId(UUID restaurantId) {
        return entityManager.createQuery(
            "SELECT COUNT(mi) FROM MenuItemEntity mi WHERE mi.restaurantId = :restaurantId", Long.class)
            .setParameter("restaurantId", restaurantId)
            .getSingleResult();
    }
    
    @Override
    public List<MenuItem> findMostPopular(UUID restaurantId, int limit) {
        // Implémentation simplifiée - pourrait être basée sur les statistiques de commande
        List<MenuItemEntity> entities = entityManager.createQuery(
            "SELECT mi FROM MenuItemEntity mi " +
            "WHERE mi.restaurantId = :restaurantId AND mi.isAvailable = true " +
            "ORDER BY mi.updatedAt DESC", MenuItemEntity.class)
            .setParameter("restaurantId", restaurantId)
            .setMaxResults(limit)
            .getResultList();
            
        return entities.stream()
            .map(mapper::toDomain)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<MenuItem> search(String searchTerm) {
        String searchPattern = "%" + searchTerm.toLowerCase() + "%";
        
        List<MenuItemEntity> entities = entityManager.createQuery(
            "SELECT mi FROM MenuItemEntity mi " +
            "WHERE LOWER(mi.name) LIKE :searchTerm OR LOWER(mi.description) LIKE :searchTerm " +
            "ORDER BY mi.name", MenuItemEntity.class)
            .setParameter("searchTerm", searchPattern)
            .setMaxResults(100) // Limiter les résultats globaux
            .getResultList();
            
        return entities.stream()
            .map(mapper::toDomain)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<MenuItem> findByPriceRange(UUID restaurantId, Double minPrice, Double maxPrice) {
        List<MenuItemEntity> entities = entityManager.createQuery(
            "SELECT mi FROM MenuItemEntity mi " +
            "WHERE mi.restaurantId = :restaurantId " +
            "AND mi.price BETWEEN :minPrice AND :maxPrice " +
            "ORDER BY mi.price", MenuItemEntity.class)
            .setParameter("restaurantId", restaurantId)
            .setParameter("minPrice", minPrice)
            .setParameter("maxPrice", maxPrice)
            .getResultList();
            
        return entities.stream()
            .map(mapper::toDomain)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<MenuItem> saveAll(List<MenuItem> menuItems) {
        return menuItems.stream()
            .map(this::save)
            .collect(Collectors.toList());
    }
    
    @Override
    public void deleteAllByRestaurantId(UUID restaurantId) {
        entityManager.createQuery(
            "DELETE FROM MenuItemEntity mi WHERE mi.restaurantId = :restaurantId")
            .setParameter("restaurantId", restaurantId)
            .executeUpdate();
    }
}