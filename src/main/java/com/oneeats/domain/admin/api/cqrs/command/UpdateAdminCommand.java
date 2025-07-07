package com.oneeats.domain.admin.api.cqrs.command;

import java.util.UUID;

public class UpdateAdminCommand {
    private UUID id;
    private String nom;
    private String prenom;
    private String email;
    private String statut;

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

