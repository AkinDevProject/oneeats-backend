package com.oneeats;

import io.quarkus.runtime.Quarkus;
import io.quarkus.runtime.QuarkusApplication;
import io.quarkus.runtime.annotations.QuarkusMain;
import org.jboss.logging.Logger;

/**
 * Application principale OneEats
 * Point d'entrée de l'application Quarkus monolithique
 * avec architecture modulaire
 */
@QuarkusMain
public class OneEatsApplication implements QuarkusApplication {
    
    private static final Logger LOG = Logger.getLogger(OneEatsApplication.class);
    
    public static void main(String... args) {
        Quarkus.run(OneEatsApplication.class, args);
    }
    
    @Override
    public int run(String... args) throws Exception {
        LOG.info("🚀 OneEats Backend Monolithique démarré avec succès!");
        LOG.info("📱 Application de commande en ligne pour restaurants");
        LOG.info("🏗️ Architecture: Monolith avec structure modulaire");
        LOG.info("🔗 API disponible sur: http://localhost:8080");
        LOG.info("📚 Documentation: http://localhost:8080/q/swagger-ui");
        LOG.info("💊 Health Check: http://localhost:8080/q/health");
        LOG.info("📊 Métriques: http://localhost:8080/q/metrics");
        
        Quarkus.waitForExit();
        return 0;
    }
}