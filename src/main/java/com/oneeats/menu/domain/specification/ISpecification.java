package com.oneeats.menu.domain.specification;

/**
 * Interface générique pour les spécifications métier
 * Suit le pattern Specification pour encapsuler les règles métier complexes
 */
public interface ISpecification<T> {
    
    /**
     * Vérifie si le candidat satisfait la spécification
     */
    boolean isSatisfiedBy(T candidate);
    
    /**
     * Combine cette spécification avec une autre en utilisant AND
     */
    default ISpecification<T> and(ISpecification<T> other) {
        return candidate -> this.isSatisfiedBy(candidate) && other.isSatisfiedBy(candidate);
    }
    
    /**
     * Combine cette spécification avec une autre en utilisant OR
     */
    default ISpecification<T> or(ISpecification<T> other) {
        return candidate -> this.isSatisfiedBy(candidate) || other.isSatisfiedBy(candidate);
    }
    
    /**
     * Inverse cette spécification en utilisant NOT
     */
    default ISpecification<T> not() {
        return candidate -> !this.isSatisfiedBy(candidate);
    }
}