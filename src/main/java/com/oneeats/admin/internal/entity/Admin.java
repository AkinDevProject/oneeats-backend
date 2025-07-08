package com.oneeats.admin.internal.entity;

import java.util.UUID;

public class Admin {
    private UUID id;
    private String nom;
    private String prenom;
    private String email;
    private String statut;

    public Admin(UUID id, String nom, String prenom, String email, String statut) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.statut = statut;
    }

    // Getters et setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
}

