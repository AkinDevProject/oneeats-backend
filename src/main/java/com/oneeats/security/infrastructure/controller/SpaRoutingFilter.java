package com.oneeats.security.infrastructure.controller;

import io.vertx.ext.web.Router;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import org.jboss.logging.Logger;

/**
 * Filtre pour gérer le SPA routing des routes frontend.
 * Redirige les routes SPA (comme /login, /callback) vers index.html
 * pour que React Router puisse les gérer.
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
            router.get(route).order(-1).handler(ctx -> {
                LOG.debugf("SPA routing: %s -> /index.html", route);
                ctx.reroute("/index.html");
            });
        }
        LOG.info("SPA routing filter initialized for: " + String.join(", ", SPA_ROUTES));
    }
}
