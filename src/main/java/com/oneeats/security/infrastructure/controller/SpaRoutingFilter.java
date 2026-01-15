package com.oneeats.security.infrastructure.controller;

import io.vertx.ext.web.Router;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import org.jboss.logging.Logger;

/**
 * Filtre pour gérer le SPA routing des routes frontend.
 * Redirige les routes SPA (comme /login, /callback) vers index.html
 * pour que React Router puisse les gérer.
 *
 * Note: L'ordre est important - OIDC doit s'exécuter avant ce filtre.
 * On utilise order(10000) pour s'assurer que ce filtre s'exécute en dernier.
 */
@ApplicationScoped
public class SpaRoutingFilter {

    private static final Logger LOG = Logger.getLogger(SpaRoutingFilter.class);

    // Routes SPA qui doivent servir index.html
    private static final String[] SPA_ROUTES = {
        "/login",
        "/callback"
    };

    public void init(@Observes Router router) {
        for (String route : SPA_ROUTES) {
            // order(10000) pour s'exécuter APRÈS OIDC et autres filtres de sécurité
            router.get(route).order(10000).handler(ctx -> {
                // Ne pas intercepter si c'est une requête OIDC (avec code ou error param)
                String code = ctx.request().getParam("code");
                String error = ctx.request().getParam("error");

                if (code != null || error != null) {
                    // Laisser OIDC gérer cette requête
                    ctx.next();
                    return;
                }

                LOG.debugf("SPA routing: %s -> /index.html", route);
                ctx.reroute("/index.html");
            });
        }
        LOG.info("SPA routing filter initialized for: " + String.join(", ", SPA_ROUTES));
    }
}
