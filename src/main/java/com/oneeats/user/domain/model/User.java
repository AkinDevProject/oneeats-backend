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
    private String phone;
    private String hashedPassword;
    private UserStatus status;
    private boolean emailVerified = true;
    private String emailVerificationToken;
    private LocalDateTime updatedAt;
    
    // Constructeur privé - utiliser les factory methods (avec password hash)
    private User(UUID id, String firstName, String lastName, Email email, String hashedPassword, UserStatus status) {
        this.setId(id);
        this.firstName = validateName(firstName);
        this.lastName = validateName(lastName);
        this.email = email;
        this.hashedPassword = hashedPassword;
        this.status = status != null ? status : UserStatus.ACTIVE;
        this.emailVerified = true;
        this.updatedAt = LocalDateTime.now();
    }

    // Constructeur public pour les tests (avec phone, différent ordre)
    public User(UUID id, String firstName, String lastName, Email email, UserStatus status, String phone) {
        this.setId(id);
        this.firstName = validateName(firstName);
        this.lastName = validateName(lastName);
        this.email = email;
        this.phone = phone;
        this.status = status != null ? status : UserStatus.ACTIVE;
        this.emailVerified = true;
        this.updatedAt = LocalDateTime.now();
    }
    
    // Factory method pour création
    public static User create(String firstName, String lastName, String email, String password) {
        User user = new User(UUID.randomUUID(), firstName, lastName, new Email(email), hashPassword(password), UserStatus.ACTIVE);
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

    public void updateProfile(String firstName, String lastName, String phone) {
        if (firstName != null) this.firstName = validateName(firstName);
        if (lastName != null) this.lastName = validateName(lastName);
        if (phone != null) this.phone = phone;
        this.updatedAt = LocalDateTime.now();
        addDomainEvent(new UserUpdatedEvent(getId(), getEmail()));
    }
    
    public void changeEmail(String newEmail) {
        this.email = new Email(newEmail);
        this.updatedAt = LocalDateTime.now();
        addDomainEvent(new UserUpdatedEvent(getId(), getEmail()));
    }

    public void updateEmail(String newEmail) {
        this.email = new Email(newEmail);
        this.emailVerified = false; // Reset verification when email changes
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

    public void suspend() {
        this.status = UserStatus.SUSPENDED;
        this.updatedAt = LocalDateTime.now();
        addDomainEvent(new UserUpdatedEvent(getId(), getEmail()));
    }

    public void reactivate() {
        if (this.status == UserStatus.INACTIVE) {
            throw new IllegalStateException("Cannot reactivate deactivated user");
        }
        this.status = UserStatus.ACTIVE;
        this.updatedAt = LocalDateTime.now();
        addDomainEvent(new UserUpdatedEvent(getId(), getEmail()));
    }
    
    public boolean canBeDeleted() {
        return status == UserStatus.INACTIVE;
    }

    public boolean isActive() {
        return status == UserStatus.ACTIVE;
    }

    public boolean canPlaceOrders() {
        return status == UserStatus.ACTIVE;
    }

    // Email verification methods
    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void verifyEmail() {
        this.emailVerified = true;
        this.emailVerificationToken = null;
        this.updatedAt = LocalDateTime.now();
    }

    public String generateEmailVerificationToken() {
        this.emailVerificationToken = "token_" + UUID.randomUUID().toString().replace("-", "");
        return this.emailVerificationToken;
    }

    public boolean isValidEmailVerificationToken(String token) {
        return token != null && token.equals(this.emailVerificationToken);
    }

    // Password methods
    public void setPassword(String password) {
        if (!isValidPassword(password)) {
            throw new IllegalArgumentException("Password does not meet requirements");
        }
        this.hashedPassword = hashPassword(password);
        this.updatedAt = LocalDateTime.now();
    }

    public boolean checkPassword(String password) {
        if (password == null) return false;
        return ("hashed_" + password).equals(this.hashedPassword);
    }

    public boolean isValidPassword(String password) {
        if (password == null) return false;
        return password.length() >= 8 &&
               password.matches(".*[A-Z].*") &&
               password.matches(".*[0-9].*") &&
               password.matches(".*[!@#$%^&*()].*");
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
    public String getPhone() { return phone; }
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