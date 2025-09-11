package com.oneeats.user.domain.service;

import com.oneeats.user.domain.model.User;
import com.oneeats.user.domain.repository.IUserRepository;
import com.oneeats.user.domain.specification.UniqueEmailSpecification;
import com.oneeats.shared.domain.vo.Email;
import com.oneeats.shared.domain.exception.ValidationException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class UserDomainService implements IUserDomainService {
    
    @Inject
    IUserRepository userRepository;
    
    @Inject
    UniqueEmailSpecification uniqueEmailSpec;
    
    @Override
    public void validateUserCreation(String firstName, String lastName, Email email) {
        if (!uniqueEmailSpec.isSatisfiedBy(email)) {
            throw new ValidationException("Email already exists: " + email.getValue());
        }
        // Autres validations métier...
    }
    
    @Override
    public void validateUserUpdate(User user, String firstName, String lastName) {
        // Validations métier pour la mise à jour
    }
    
    @Override
    public boolean canDeleteUser(User user) {
        return user.canBeDeleted();
    }
}