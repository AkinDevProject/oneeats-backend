package com.oneeats.user.domain.specification;

import com.oneeats.user.domain.repository.IUserRepository;
import com.oneeats.shared.domain.vo.Email;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class UniqueEmailSpecification implements ISpecification<Email> {
    
    @Inject
    IUserRepository userRepository;
    
    @Override
    public boolean isSatisfiedBy(Email email) {
        return !userRepository.existsByEmail(email);
    }
}