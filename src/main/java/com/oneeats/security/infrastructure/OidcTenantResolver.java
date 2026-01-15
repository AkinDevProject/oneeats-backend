package com.oneeats.security.infrastructure;

import io.quarkus.oidc.TenantResolver;
import io.vertx.ext.web.RoutingContext;
import jakarta.enterprise.context.ApplicationScoped;
import org.jboss.logging.Logger;

/**
 * Résolveur de tenant OIDC dynamique.
 * Permet de supporter deux modes d'authentification :
 * - Web (cookies/session) : tenant par défaut
 * - Mobile (Bearer JWT) : tenant "mobile"
 */
@ApplicationScoped
public class OidcTenantResolver implements TenantResolver {

    private static final Logger LOG = Logger.getLogger(OidcTenantResolver.class);

    @Override
    public String resolve(RoutingContext context) {
        String path = context.request().path();
        String authHeader = context.request().getHeader("Authorization");

        // Si Bearer token présent → tenant mobile
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            LOG.debugf("Bearer token detected, using 'mobile' tenant for path: %s", path);
            return "mobile";
        }

        // Routes API sans cookie de session → probablement mobile
        if (path.startsWith("/api/")) {
            // Vérifier s'il y a un cookie de session Quarkus
            var sessionCookie = context.request().getCookie("q_session");
            if (sessionCookie == null) {
                // Pas de session, vérifier si c'est une route publique
                // Les routes publiques n'ont pas besoin de tenant spécifique
                if (isPublicRoute(path)) {
                    LOG.debugf("Public API route, no tenant needed: %s", path);
                    return null;
                }
            }
        }

        // Par défaut → tenant web (cookies/session)
        LOG.debugf("Using default 'web' tenant for path: %s", path);
        return null; // null = tenant par défaut
    }

    /**
     * Vérifie si la route est publique (ne nécessite pas d'auth)
     */
    private boolean isPublicRoute(String path) {
        return path.startsWith("/api/restaurants")
            || path.startsWith("/api/menus")
            || path.equals("/api/auth/status");
    }
}
