package com.oneeats.shared.repository;

import com.oneeats.shared.domain.entity.BaseEntity;
import com.oneeats.shared.domain.exception.EntityNotFoundException;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import io.quarkus.panache.common.Parameters;
import io.quarkus.panache.common.Sort;

import java.util.List;
import java.util.UUID;

/**
 * Classe de base pour tous les repositories utilisant PanacheRepositoryBase avec UUID
 * Fournit les opérations CRUD de base et des méthodes utilitaires communes
 */
public abstract class BaseRepository<T extends BaseEntity> implements PanacheRepositoryBase<T, UUID> {
    
    /**
     * Recherche générique par terme
     * À implémenter dans chaque repository selon les besoins métier
     */
    public abstract List<T> search(String searchTerm);
    
    /**
     * Trouver une entité par ID avec vérification d'existence
     */
    public T findByIdRequired(UUID id) {
        T entity = findById(id);
        if (entity == null) {
            throw new EntityNotFoundException("Entity", id);
        }
        return entity;
    }
    
    /**
     * Vérifier si une entité existe par ID
     */
    public boolean existsById(UUID id) {
        return findById(id) != null;
    }
    
    /**
     * Trouver toutes les entités avec tri
     */
    public List<T> findAllSorted(Sort sort) {
        return findAll(sort).list();
    }
    
    /**
     * Trouver avec pagination
     */
    public List<T> findWithPagination(int page, int size, Sort sort) {
        return findAll(sort).page(page, size).list();
    }
    
    /**
     * Compter le nombre total d'entités
     */
    public long countAll() {
        return count();
    }
    
    /**
     * Supprimer par ID avec vérification
     */
    public boolean deleteByIdSafe(UUID id) {
        T entity = findById(id);
        if (entity == null) {
            return false;
        }
        delete(entity);
        return true;
    }
    
    /**
     * Trouver par critères multiples avec paramètres
     */
    protected List<T> findByCriteria(String query, Parameters parameters, Sort sort) {
        return find(query, sort, parameters).list();
    }
    
    /**
     * Compter par critères
     */
    protected long countByCriteria(String query, Parameters parameters) {
        return count(query, parameters);
    }
}