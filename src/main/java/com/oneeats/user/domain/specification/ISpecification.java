package com.oneeats.user.domain.specification;

public interface ISpecification<T> {
    boolean isSatisfiedBy(T candidate);
}