package com.oneeats.security.infrastructure.keycloak;

import com.oneeats.security.application.dto.RegisterRequestDTO;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Optional;

/**
 * Service pour interagir avec l'API Admin de Keycloak.
 * Permet de creer des utilisateurs et d'obtenir des tokens.
 */
@ApplicationScoped
public class KeycloakAdminService {

    private static final Logger LOG = Logger.getLogger(KeycloakAdminService.class);

    @ConfigProperty(name = "quarkus.oidc.auth-server-url")
    String keycloakUrl;

    @ConfigProperty(name = "keycloak.admin.client-id", defaultValue = "admin-cli")
    String adminClientId;

    @ConfigProperty(name = "keycloak.admin.client-secret", defaultValue = "")
    Optional<String> adminClientSecret;

    @ConfigProperty(name = "keycloak.admin.username", defaultValue = "admin")
    String adminUsername;

    @ConfigProperty(name = "keycloak.admin.password", defaultValue = "admin")
    String adminPassword;

    @ConfigProperty(name = "quarkus.oidc.mobile.client-id", defaultValue = "oneeats-mobile")
    String mobileClientId;

    private final HttpClient httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(10))
        .build();

    /**
     * Obtient un token admin pour l'API Keycloak
     */
    public String getAdminToken() {
        try {
            // Extraire le realm et la base URL de Keycloak
            // Format attendu: http://host:port/realms/realm-name
            String baseUrl = keycloakUrl.replaceAll("/realms/[^/]+$", "");

            String tokenUrl = baseUrl + "/realms/master/protocol/openid-connect/token";

            String body;
            if (adminClientSecret.isPresent() && !adminClientSecret.get().isEmpty()) {
                // Client credentials flow
                body = String.format(
                    "grant_type=client_credentials&client_id=%s&client_secret=%s",
                    adminClientId,
                    adminClientSecret.get()
                );
            } else {
                // Resource owner password grant
                body = String.format(
                    "grant_type=password&client_id=%s&username=%s&password=%s",
                    adminClientId,
                    adminUsername,
                    adminPassword
                );
            }

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(tokenUrl))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                LOG.error("Failed to get admin token: " + response.body());
                throw new WebApplicationException("Failed to authenticate with Keycloak admin", Response.Status.INTERNAL_SERVER_ERROR);
            }

            // Parse JSON response to get access_token
            String responseBody = response.body();
            int start = responseBody.indexOf("\"access_token\":\"") + 16;
            int end = responseBody.indexOf("\"", start);
            return responseBody.substring(start, end);

        } catch (Exception e) {
            LOG.error("Error getting admin token", e);
            throw new WebApplicationException("Keycloak admin authentication failed", Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Cree un nouvel utilisateur dans Keycloak
     *
     * @param request Les donnees d'inscription
     * @return L'ID Keycloak du nouvel utilisateur
     * @throws WebApplicationException si l'email existe deja ou autre erreur
     */
    public String createUser(RegisterRequestDTO request) {
        try {
            String adminToken = getAdminToken();

            // Extraire le realm de l'URL
            String realm = extractRealm(keycloakUrl);
            String baseUrl = keycloakUrl.replaceAll("/realms/[^/]+$", "");
            String usersUrl = baseUrl + "/admin/realms/" + realm + "/users";

            String userJson = String.format("""
                {
                    "username": "%s",
                    "email": "%s",
                    "firstName": "%s",
                    "lastName": "%s",
                    "enabled": true,
                    "emailVerified": true,
                    "requiredActions": [],
                    "credentials": [{
                        "type": "password",
                        "value": "%s",
                        "temporary": false
                    }]
                }
                """,
                request.email(),
                request.email(),
                escapeJson(request.firstName()),
                escapeJson(request.lastName() != null ? request.lastName() : ""),
                escapeJson(request.password())
            );

            HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(usersUrl))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + adminToken)
                .POST(HttpRequest.BodyPublishers.ofString(userJson))
                .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 201) {
                // Extract user ID from Location header
                String location = response.headers().firstValue("Location").orElse("");
                String userId = location.substring(location.lastIndexOf("/") + 1);
                LOG.info("Created Keycloak user: " + userId);

                // Supprimer toutes les required actions de l'utilisateur
                clearRequiredActions(adminToken, baseUrl, realm, userId);

                return userId;
            } else if (response.statusCode() == 409) {
                LOG.warn("Email already exists in Keycloak: " + request.email());
                throw new WebApplicationException("email_exists", Response.Status.CONFLICT);
            } else {
                LOG.error("Failed to create user in Keycloak: " + response.statusCode() + " - " + response.body());
                throw new WebApplicationException("Failed to create user", Response.Status.INTERNAL_SERVER_ERROR);
            }

        } catch (WebApplicationException e) {
            throw e;
        } catch (Exception e) {
            LOG.error("Error creating Keycloak user", e);
            throw new WebApplicationException("User creation failed", Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Obtient des tokens pour un utilisateur via Resource Owner Password Grant
     *
     * @param email Email de l'utilisateur
     * @param password Mot de passe
     * @return TokenResponse avec access_token et refresh_token
     */
    public TokenResponse getTokensForUser(String email, String password) {
        try {
            String tokenUrl = keycloakUrl + "/protocol/openid-connect/token";

            // Utiliser le client mobile pour l'authentification (depuis config)
            String body = String.format(
                "grant_type=password&client_id=%s&username=%s&password=%s&scope=openid profile email",
                mobileClientId,
                java.net.URLEncoder.encode(email, "UTF-8"),
                java.net.URLEncoder.encode(password, "UTF-8")
            );

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(tokenUrl))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                LOG.errorf("Failed to get user tokens for %s - Status: %d - Response: %s",
                    email, response.statusCode(), response.body());
                if (response.statusCode() == 401 || response.statusCode() == 400) {
                    // Check if it's an invalid grant (wrong credentials or client not configured)
                    String errorBody = response.body();
                    if (errorBody.contains("invalid_grant") || errorBody.contains("Invalid user credentials")) {
                        throw new WebApplicationException("invalid_credentials", Response.Status.UNAUTHORIZED);
                    }
                    if (errorBody.contains("unauthorized_client") || errorBody.contains("Direct grants are not allowed")) {
                        LOG.error("Client oneeats-mobile is not configured for Direct Access Grants in Keycloak!");
                        throw new WebApplicationException("Client configuration error: Direct Access Grants not enabled", Response.Status.INTERNAL_SERVER_ERROR);
                    }
                }
                throw new WebApplicationException("Authentication failed: " + response.body(), Response.Status.INTERNAL_SERVER_ERROR);
            }

            return parseTokenResponse(response.body());

        } catch (WebApplicationException e) {
            throw e;
        } catch (Exception e) {
            LOG.error("Error getting user tokens", e);
            throw new WebApplicationException("Token retrieval failed", Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Supprime toutes les required actions d'un utilisateur Keycloak
     * Necessaire car les default actions du realm sont appliquees meme avec requiredActions: []
     */
    private void clearRequiredActions(String adminToken, String baseUrl, String realm, String userId) {
        try {
            String userUrl = baseUrl + "/admin/realms/" + realm + "/users/" + userId;

            // Mettre a jour l'utilisateur pour supprimer les required actions
            String updateJson = """
                {
                    "requiredActions": []
                }
                """;

            HttpRequest updateRequest = HttpRequest.newBuilder()
                .uri(URI.create(userUrl))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + adminToken)
                .PUT(HttpRequest.BodyPublishers.ofString(updateJson))
                .build();

            HttpResponse<String> updateResponse = httpClient.send(updateRequest, HttpResponse.BodyHandlers.ofString());

            if (updateResponse.statusCode() == 204) {
                LOG.info("Cleared required actions for user: " + userId);
            } else {
                LOG.warnf("Failed to clear required actions for user %s: %d - %s",
                    userId, updateResponse.statusCode(), updateResponse.body());
            }
        } catch (Exception e) {
            LOG.warn("Error clearing required actions for user: " + userId, e);
            // Ne pas echouer l'inscription pour ca
        }
    }

    private String extractRealm(String url) {
        // Format: http://host:port/realms/realm-name
        int lastSlash = url.lastIndexOf("/");
        if (lastSlash > 0 && url.contains("/realms/")) {
            return url.substring(lastSlash + 1);
        }
        return "oneeats"; // default
    }

    private String escapeJson(String value) {
        if (value == null) return "";
        return value
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "\\r")
            .replace("\t", "\\t");
    }

    private TokenResponse parseTokenResponse(String json) {
        // Simple JSON parsing without external library
        String accessToken = extractJsonValue(json, "access_token");
        String refreshToken = extractJsonValue(json, "refresh_token");
        int expiresIn = Integer.parseInt(extractJsonValue(json, "expires_in"));
        String tokenType = extractJsonValue(json, "token_type");

        return new TokenResponse(accessToken, refreshToken, expiresIn, tokenType);
    }

    private String extractJsonValue(String json, String key) {
        String pattern = "\"" + key + "\":";
        int start = json.indexOf(pattern);
        if (start == -1) return "";

        start += pattern.length();
        // Skip whitespace
        while (start < json.length() && Character.isWhitespace(json.charAt(start))) {
            start++;
        }

        if (json.charAt(start) == '"') {
            // String value
            start++;
            int end = json.indexOf("\"", start);
            return json.substring(start, end);
        } else {
            // Numeric value
            int end = start;
            while (end < json.length() && (Character.isDigit(json.charAt(end)) || json.charAt(end) == '.')) {
                end++;
            }
            return json.substring(start, end);
        }
    }

    /**
     * Response object for token requests
     */
    public record TokenResponse(
        String accessToken,
        String refreshToken,
        int expiresIn,
        String tokenType
    ) {}
}
