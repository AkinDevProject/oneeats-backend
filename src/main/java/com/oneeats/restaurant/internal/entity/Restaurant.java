package com.oneeats.restaurant.internal.entity;

import java.util.UUID;
import com.oneeats.restaurant.internal.valueobject.Adresse;
import com.oneeats.user.internal.entity.User;
import java.time.LocalTime;
import java.util.List;

public class Restaurant {
    private UUID id;
    private String nom;
    private String description;
    private Adresse adresse;
    private String telephone;
    private String email;
    private List<LocalTime[]> horairesOuverture;
    private StatutValidation statutValidation;
    private User proprietaire;

    public enum StatutValidation {
        EN_ATTENTE, VALIDE, REFUSE
    }

    // Constructeur, getters, setters, etc.
    public Restaurant(UUID id, String nom, String description, Adresse adresse, String telephone, String email, List<LocalTime[]> horairesOuverture, StatutValidation statutValidation, User proprietaire) {
        this.id = id;
        this.nom = nom;
        this.description = description;
        this.adresse = adresse;
        this.telephone = telephone;
        this.email = email;
        this.horairesOuverture = horairesOuverture;
        this.statutValidation = statutValidation;
        this.proprietaire = proprietaire;
    }

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

    public List<LocalTime[]> getHorairesOuverture() {
        return horairesOuverture;
    }

    public void setHorairesOuverture(List<LocalTime[]> horairesOuverture) {
        this.horairesOuverture = horairesOuverture;
    }

    public StatutValidation getStatutValidation() {
        return statutValidation;
    }

    public void setStatutValidation(StatutValidation statutValidation) {
        this.statutValidation = statutValidation;
    }

    public User getProprietaire() {
        return proprietaire;
    }

    public void setProprietaire(User proprietaire) {
        this.proprietaire = proprietaire;
    }
}
