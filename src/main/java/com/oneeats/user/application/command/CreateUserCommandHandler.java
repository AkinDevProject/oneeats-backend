package com.oneeats.user.application.command;

import com.oneeats.user.application.dto.UserDTO;
import com.oneeats.user.application.mapper.UserApplicationMapper;
import com.oneeats.user.domain.model.User;
import com.oneeats.user.domain.repository.IUserRepository;
import com.oneeats.user.domain.service.IUserDomainService;
import com.oneeats.shared.domain.vo.Email;
import com.oneeats.shared.domain.event.DomainEventPublisher;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class CreateUserCommandHandler {
    
    @Inject
    IUserRepository userRepository;
    
    @Inject
    IUserDomainService userDomainService;
    
    @Inject
    UserApplicationMapper mapper;
    
    @Inject
    DomainEventPublisher eventPublisher;
    
    @Transactional
    public UserDTO handle(CreateUserCommand command) {
        Email email = new Email(command.email());
        
        // Validation métier
        userDomainService.validateUserCreation(command.firstName(), command.lastName(), email);
        
        // Création
        User user = User.create(command.firstName(), command.lastName(), command.email(), command.password());
        
        // Sauvegarde
        User savedUser = userRepository.save(user);
        
        // Publication d'événements
        savedUser.getDomainEvents().forEach(eventPublisher::publishEvent);
        savedUser.clearDomainEvents();
        
        return mapper.toDTO(savedUser);
    }
}