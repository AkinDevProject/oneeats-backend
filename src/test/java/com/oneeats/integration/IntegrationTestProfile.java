package com.oneeats.integration;

import io.quarkus.test.junit.QuarkusTestProfile;
import java.util.Map;

/**
 * Profil de test pour les tests d'intégration OneEats
 * Configure l'environnement de test pour éviter les conflits CDI avec les classes nested
 */
public class IntegrationTestProfile implements QuarkusTestProfile {

    @Override
    public Map<String, String> getConfigOverrides() {
        return Map.of(
            // Désactive le scanning CDI pour les classes de test nested
            "quarkus.arc.exclude-types", "com.oneeats.integration.**.*$*",
            // Configuration de test pour la base de données
            "quarkus.datasource.db-kind", "h2",
            "quarkus.datasource.jdbc.url", "jdbc:h2:mem:test;DB_CLOSE_DELAY=-1",
            "quarkus.hibernate-orm.database.generation", "drop-and-create",
            // Logs plus verbeux pour les tests
            "quarkus.log.category.\"com.oneeats\".level", "DEBUG"
        );
    }

    @Override
    public String getConfigProfile() {
        return "integration-test";
    }
}