package com.oneeats.user.domain.model;

import com.oneeats.shared.domain.entity.BaseEntity;
import com.oneeats.shared.domain.vo.Email;
import com.oneeats.shared.domain.exception.ValidationException;
import com.oneeats.user.domain.event.UserCreatedEvent;
import com.oneeats.user.domain.event.UserUpdatedEvent;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

public class User extends BaseEntity {
    private String firstName;
    private String lastName;
    private Email email;
    private String hashedPassword;
    private UserStatus status;
    private LocalDateTime updatedAt;
    
    // Constructeur privé - utiliser les factory methods
    private User(UUID id, String firstName, String lastName, Email email, String hashedPassword, UserStatus status) {
        this.setId(id);
        this.firstName = validateName(firstName);
        this.lastName = validateName(lastName);
        this.email = email;
        this.hashedPassword = hashedPassword;
        this.status = status != null ? status : UserStatus.ACTIVE;
        this.updatedAt = LocalDateTime.now();
    }
    
    // Factory method pour création
    public static User create(String firstName, String lastName, String email, String password) {
        User user = new User(null, firstName, lastName, new Email(email), hashPassword(password), UserStatus.ACTIVE);
        user.addDomainEvent(new UserCreatedEvent(user.getId(), user.getEmail(), user.getFullName()));
        return user;
    }
    
    // Factory method pour reconstruction depuis la persistence
    public static User fromPersistence(UUID id, String firstName, String lastName, String email, 
                                      String hashedPassword, UserStatus status, LocalDateTime createdAt, LocalDateTime updatedAt) {
        User user = new User(id, firstName, lastName, new Email(email), hashedPassword, status);
        user.setCreatedAt(createdAt);
        user.updatedAt = updatedAt;
        return user;
    }
    
    // Méthodes métier
    public void updateProfile(String firstName, String lastName) {
        this.firstName = validateName(firstName);
        this.lastName = validateName(lastName);
        this.updatedAt = LocalDateTime.now();
        addDomainEvent(new UserUpdatedEvent(getId(), getEmail()));
    }
    
    public void changeEmail(String newEmail) {
        this.email = new Email(newEmail);
        this.updatedAt = LocalDateTime.now();
        addDomainEvent(new UserUpdatedEvent(getId(), getEmail()));
    }
    
    public void activate() {
        this.status = UserStatus.ACTIVE;
        this.updatedAt = LocalDateTime.now();
        addDomainEvent(new UserUpdatedEvent(getId(), getEmail()));
    }
    
    public void deactivate() {
        this.status = UserStatus.INACTIVE;
        this.updatedAt = LocalDateTime.now();
        addDomainEvent(new UserUpdatedEvent(getId(), getEmail()));
    }
    
    public boolean canBeDeleted() {
        return status == UserStatus.INACTIVE;
    }
    
    public String getFullName() {
        return firstName + " " + lastName;
    }
    
    // Validation
    private String validateName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new ValidationException("Name cannot be null or empty");
        }
        if (name.length() > 50) {
            throw new ValidationException("Name cannot exceed 50 characters");
        }
        return name.trim();
    }
    
    private static String hashPassword(String password) {
        if (password == null || password.length() < 6) {
            throw new ValidationException("Password must be at least 6 characters");
        }
        // Utiliser BCrypt en production
        return "hashed_" + password;
    }
    
    // Getters
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public Email getEmail() { return email; }
    public String getHashedPassword() { return hashedPassword; }
    public UserStatus getStatus() { return status; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(getId(), user.getId());
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(getId());
    }
}