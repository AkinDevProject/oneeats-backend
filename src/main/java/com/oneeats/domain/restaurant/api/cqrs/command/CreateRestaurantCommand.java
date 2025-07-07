package com.oneeats.domain.restaurant.api.cqrs.command;

import com.oneeats.domain.restaurant.internal.valueobject.Adresse;
import java.util.UUID;

public class CreateRestaurantCommand {
    private String nom;
    private String description;
    private Adresse adresse;
    private String telephone;
    private String email;
    private UUID proprietaireId;

    // Constructeurs, getters, setters

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Adresse getAdresse() {
        return adresse;
    }

    public void setAdresse(Adresse adresse) {
        this.adresse = adresse;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public UUID getProprietaireId() {
        return proprietaireId;
    }

    public void setProprietaireId(UUID proprietaireId) {
        this.proprietaireId = proprietaireId;
    }
}
