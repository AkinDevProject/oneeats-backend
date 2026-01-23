package com.oneeats.integration;

import io.quarkus.test.junit.QuarkusTestProfile;
import java.util.Map;

/**
 * Profil de test pour les tests d'intégration OneEats
 * Configure l'environnement de test pour éviter les conflits CDI avec les classes nested
 * et désactive l'authentification OIDC/Keycloak
 */
public class IntegrationTestProfile implements QuarkusTestProfile {

    @Override
    public Map<String, String> getConfigOverrides() {
        return Map.ofEntries(
            // Désactive le scanning CDI pour les classes de test nested
            Map.entry("quarkus.arc.exclude-types", "com.oneeats.integration.**.*$*"),
            // Port aléatoire pour éviter les conflits avec le serveur de dev
            Map.entry("quarkus.http.test-port", "0"),
            // Configuration de test pour PostgreSQL (docker-compose postgres-test)
            Map.entry("quarkus.datasource.db-kind", "postgresql"),
            Map.entry("quarkus.datasource.jdbc.url", "jdbc:postgresql://localhost:5433/oneeats_test"),
            Map.entry("quarkus.datasource.username", "oneeats_test_user"),
            Map.entry("quarkus.datasource.password", "oneeats_test_password"),
            Map.entry("quarkus.hibernate-orm.database.generation", "drop-and-create"),
            Map.entry("quarkus.hibernate-orm.sql-load-script", "import.sql"),
            // Désactiver complètement OIDC (default tenant et mobile tenant)
            Map.entry("quarkus.oidc.enabled", "false"),
            // Désactiver TOUTES les politiques de sécurité HTTP pour les tests
            // Cela permet aux annotations JAX-RS (@RolesAllowed, @PermitAll) de gérer la sécurité
            Map.entry("quarkus.http.auth.permission.api-protected.enabled", "false"),
            Map.entry("quarkus.http.auth.permission.restaurant-pages.enabled", "false"),
            Map.entry("quarkus.http.auth.permission.admin-pages.enabled", "false"),
            Map.entry("quarkus.http.auth.permission.api-public-read.enabled", "false"),
            Map.entry("quarkus.http.auth.permission.api-menu-items-write.enabled", "false"),
            Map.entry("quarkus.http.auth.permission.public-pages.enabled", "false"),
            Map.entry("quarkus.http.auth.permission.system-endpoints.enabled", "false"),
            // Activer la sécurité proactive pour que @TestSecurity fonctionne avec @RolesAllowed
            Map.entry("quarkus.security.auth.enabled-in-dev-mode", "true"),
            // Désactiver Quinoa pour les tests
            Map.entry("quarkus.quinoa.enabled", "false"),
            // Logs pour les tests
            Map.entry("quarkus.log.level", "INFO")
        );
    }

    @Override
    public String getConfigProfile() {
        return "test";
    }
}