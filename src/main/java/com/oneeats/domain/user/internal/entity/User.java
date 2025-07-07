package com.oneeats.domain.user.internal.entity;

import java.util.UUID;

public class User {
    private UUID id;
    private String nom;
    private String prenom;
    private String email;
    private String role;

    public User(UUID id, String nom, String prenom, String email, String role) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.role = role;
    }

    public UUID getId() { return id; }
    public String getNom() { return nom; }
    public String getPrenom() { return prenom; }
    public String getEmail() { return email; }
    public String getRole() { return role; }

    public void setId(UUID id) { this.id = id; }
    public void setNom(String nom) { this.nom = nom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }
    public void setEmail(String email) { this.email = email; }
    public void setRole(String role) { this.role = role; }
}

