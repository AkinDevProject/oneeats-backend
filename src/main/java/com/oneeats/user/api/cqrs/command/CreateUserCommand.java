package com.oneeats.user.api.cqrs.command;

public class CreateUserCommand {
    private String nom;
    private String prenom;
    private String email;
    private String role;
    // Ajoute d'autres champs si besoin (ex: mot de passe)

    // Getters et setters
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}

