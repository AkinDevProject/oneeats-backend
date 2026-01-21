package com.oneeats.security.infrastructure.controller;

import io.vertx.ext.web.Router;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import org.jboss.logging.Logger;

/**
 * Filtre pour gérer le SPA routing des routes frontend.
 * Redirige les routes SPA vers index.html pour que React Router puisse les gérer.
 *
 * Note: L'ordre est important - OIDC doit s'exécuter avant ce filtre.
 * On utilise order(10000) pour s'assurer que ce filtre s'exécute en dernier.
 */
@ApplicationScoped
public class SpaRoutingFilter {

    private static final Logger LOG = Logger.getLogger(SpaRoutingFilter.class);

    // Routes SPA exactes qui doivent servir index.html
    private static final String[] SPA_EXACT_ROUTES = {
        "/login",
        "/callback",
        "/restaurant",
        "/admin"
    };

    // Préfixes de routes SPA (toutes les sous-routes doivent servir index.html)
    private static final String[] SPA_PREFIX_ROUTES = {
        "/restaurant/",
        "/admin/"
    };

    public void init(@Observes Router router) {
        // Routes exactes
        for (String route : SPA_EXACT_ROUTES) {
            router.get(route).order(10000).handler(ctx -> {
                String code = ctx.request().getParam("code");
                String error = ctx.request().getParam("error");

                if (code != null || error != null) {
                    ctx.next();
                    return;
                }

                LOG.debugf("SPA routing (exact): %s -> /index.html", route);
                ctx.reroute("/index.html");
            });
        }

        // Routes avec préfixe (wildcard) - ex: /restaurant/menu, /restaurant/orders
        for (String prefix : SPA_PREFIX_ROUTES) {
            router.get(prefix + "*").order(10000).handler(ctx -> {
                String path = ctx.request().path();

                // Ignorer les fichiers statiques (assets)
                if (path.contains(".") && (path.endsWith(".js") || path.endsWith(".css") ||
                    path.endsWith(".png") || path.endsWith(".jpg") || path.endsWith(".svg") ||
                    path.endsWith(".ico") || path.endsWith(".woff") || path.endsWith(".woff2"))) {
                    ctx.next();
                    return;
                }

                LOG.debugf("SPA routing (prefix): %s -> /index.html", path);
                ctx.reroute("/index.html");
            });
        }

        LOG.info("SPA routing filter initialized for exact routes: " + String.join(", ", SPA_EXACT_ROUTES));
        LOG.info("SPA routing filter initialized for prefix routes: " + String.join(", ", SPA_PREFIX_ROUTES));
    }
}
