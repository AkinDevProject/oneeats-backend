package com.oneeats.web;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.net.URI;

/**
 * Contrôleur Web pour servir l'application SPA React
 * Gère le routing côté serveur pour les routes frontend
 */
@ApplicationScoped
@Path("/")
public class WebController {
    
    @ConfigProperty(name = "quarkus.quinoa.enabled", defaultValue = "false")
    boolean quinoaEnabled;
    
    @ConfigProperty(name = "quarkus.quinoa.dev-server.port", defaultValue = "5173")
    int vitePort;
    
    /**
     * Route de test pour vérifier le contrôleur
     */
    @GET
    @Path("/web-test")
    @Produces(MediaType.TEXT_PLAIN)
    public String webTest() {
        return "WebController est actif ! Quinoa enabled: " + quinoaEnabled + ", Vite port: " + vitePort;
    }
    
    /**
     * Route pour les pages restaurant
     * Sert index.html pour permettre à React Router de gérer la navigation
     */
    @GET
    @Path("/restaurant/{path:.*}")
    @Produces(MediaType.TEXT_HTML)
    public Response serveRestaurantPages(@PathParam("path") String path) {
        System.out.println("🌐 WebController: /restaurant/" + path + " - Quinoa enabled: " + quinoaEnabled);
        
        if (quinoaEnabled) {
            // Même si Quinoa est actif, on redirige vers Vite pour SPA routing 
            System.out.println("🔄 Quinoa actif - redirection vers Vite pour SPA routing");
        }
        
        // En développement sans Quinoa, on redirige vers Vite
        String redirectUrl = "http://localhost:" + vitePort + "/restaurant/" + path;
        System.out.println("↗️ Redirection vers: " + redirectUrl);
        
        return Response.temporaryRedirect(URI.create(redirectUrl)).build();
    }
    
    /**
     * Route pour les pages admin
     */
    @GET
    @Path("/admin/{path:.*}")
    @Produces(MediaType.TEXT_HTML)
    public Response serveAdminPages(@PathParam("path") String path) {
        // Toujours rediriger vers Vite pour SPA routing
        
        return Response.temporaryRedirect(
            java.net.URI.create("http://localhost:" + vitePort + "/admin/" + path)
        ).build();
    }
    
    /**
     * Route racine - Dashboard principal
     */
    @GET
    @Path("/dashboard{path:.*}")
    @Produces(MediaType.TEXT_HTML)
    public Response serveDashboard(@PathParam("path") String path) {
        // Toujours rediriger vers Vite pour SPA routing
        
        return Response.temporaryRedirect(
            java.net.URI.create("http://localhost:" + vitePort + "/dashboard" + path)
        ).build();
    }
    
    /**
     * Fallback pour toutes les autres routes SPA
     * Ne capture pas les routes API, métriques, etc.
     */
    @GET
    @Path("/{path:[^api][^q][^health][^metrics].*}")
    @Produces(MediaType.TEXT_HTML)
    public Response serveSPAFallback(@PathParam("path") String path) {
        // Ignorer les fichiers statiques
        if (path.matches(".*\\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$")) {
            return Response.status(404).build();
        }
        
        // Toujours rediriger vers Vite pour SPA routing
        
        // En dev, redirection vers Vite
        return Response.temporaryRedirect(
            java.net.URI.create("http://localhost:" + vitePort + "/" + path)
        ).build();
    }
}