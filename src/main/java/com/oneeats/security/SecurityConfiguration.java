package com.oneeats.security;

import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

/**
 * Configuration de sécurité pour OneEats
 * Intégration avec Keycloak pour l'authentification et l'autorisation
 */
@ApplicationScoped
public class SecurityConfiguration {
    
    @ConfigProperty(name = "quarkus.oidc.auth-server-url", defaultValue = "http://localhost:8081/realms/oneeats")
    String keycloakUrl;
    
    @ConfigProperty(name = "quarkus.oidc.client-id", defaultValue = "oneeats-backend")
    String clientId;
    
    @ConfigProperty(name = "quarkus.oidc.credentials.secret", defaultValue = "")
    String clientSecret;
    
    /**
     * Méthode utilitaire pour vérifier si la sécurité est activée
     */
    public boolean isSecurityEnabled() {
        return !clientSecret.isEmpty();
    }
    
    /**
     * URL du serveur Keycloak
     */
    public String getKeycloakUrl() {
        return keycloakUrl;
    }
    
    /**
     * ID du client configuré dans Keycloak
     */
    public String getClientId() {
        return clientId;
    }
}