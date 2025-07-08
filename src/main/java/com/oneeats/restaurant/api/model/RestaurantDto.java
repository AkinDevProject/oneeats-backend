package com.oneeats.restaurant.api.model;

import java.util.UUID;
import com.oneeats.restaurant.internal.valueobject.Adresse;
import com.oneeats.restaurant.internal.entity.Restaurant.StatutValidation;

public class RestaurantDto {
    private UUID id;
    private String nom;
    private String description;
    private Adresse adresse;
    private String telephone;
    private String email;
    private StatutValidation statutValidation;
    private UUID proprietaireId;

    // Constructeurs, getters, setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

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

    public StatutValidation getStatutValidation() {
        return statutValidation;
    }

    public void setStatutValidation(StatutValidation statutValidation) {
        this.statutValidation = statutValidation;
    }

    public UUID getProprietaireId() {
        return proprietaireId;
    }

    public void setProprietaireId(UUID proprietaireId) {
        this.proprietaireId = proprietaireId;
    }
}
