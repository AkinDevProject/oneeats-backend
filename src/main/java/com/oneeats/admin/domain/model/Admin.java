package com.oneeats.admin.domain.model;

import com.oneeats.shared.domain.entity.BaseEntity;
import com.oneeats.shared.domain.vo.Email;
import com.oneeats.admin.domain.event.AdminCreatedEvent;

import java.util.UUID;

public class Admin extends BaseEntity {
    
    private String firstName;
    private String lastName;
    private Email email;
    private String passwordHash;
    private AdminRole role;
    private AdminStatus status;

    protected Admin() {}

    public Admin(UUID id, String firstName, String lastName, Email email, String passwordHash, 
                AdminRole role, AdminStatus status) {
        super(id);
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.status = status;
    }

    public static Admin create(String firstName, String lastName, String email, String password, AdminRole role) {
        Admin admin = new Admin(
            UUID.randomUUID(),
            firstName,
            lastName,
            new Email(email),
            hashPassword(password),
            role,
            AdminStatus.ACTIVE
        );
        
        admin.addDomainEvent(new AdminCreatedEvent(
            admin.getId(),
            admin.getEmail(),
            admin.getRole()
        ));
        
        return admin;
    }

    private static String hashPassword(String password) {
        // TODO: Implement proper password hashing
        return password; // Placeholder
    }

    public void activate() {
        this.status = AdminStatus.ACTIVE;
        this.markAsModified();
    }

    public void deactivate() {
        this.status = AdminStatus.INACTIVE;
        this.markAsModified();
    }

    public void suspend() {
        this.status = AdminStatus.SUSPENDED;
        this.markAsModified();
    }

    public boolean isActive() {
        return this.status == AdminStatus.ACTIVE;
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }

    // Getters
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public Email getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public AdminRole getRole() { return role; }
    public AdminStatus getStatus() { return status; }
}