package com.oneeats.domain.restaurant.internal.valueobject;

public class Adresse {
    private final String rue;
    private final String ville;
    private final String codePostal;
    private final String pays;

    public Adresse(String rue, String ville, String codePostal, String pays) {
        this.rue = rue;
        this.ville = ville;
        this.codePostal = codePostal;
        this.pays = pays;
    }

    public String getRue() { return rue; }
    public String getVille() { return ville; }
    public String getCodePostal() { return codePostal; }
    public String getPays() { return pays; }
}

