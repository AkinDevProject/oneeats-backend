package com.oneeats.configuration;

import io.quarkus.arc.config.ConfigProperties;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * Configuration centralisée de l'application OneEats
 * Regroupe toutes les propriétés métier
 */
@ApplicationScoped
@ConfigProperties(prefix = "oneeats")
public class ApplicationConfiguration {
    
    /**
     * Configuration métier
     */
    public Business business = new Business();
    
    /**
     * Configuration API
     */
    public Api api = new Api();
    
    /**
     * Configuration debug
     */
    public Debug debug = new Debug();
    
    /**
     * Configuration des règles métier
     */
    public static class Business {
        public Order order = new Order();
        public Restaurant restaurant = new Restaurant();
        public Notification notification = new Notification();
        
        public static class Order {
            public int maxItemsPerOrder = 50;
            public int defaultPreparationTimeMinutes = 20;
            public int maxPreparationTimeMinutes = 120;
            public int pickupReminderMinutes = 5;
        }
        
        public static class Restaurant {
            public int maxDistanceKm = 50;
            public double defaultRating = 0.0;
        }
        
        public static class Notification {
            public boolean enabled = true;
            public boolean emailEnabled = false;
            public boolean smsEnabled = false;
        }
    }
    
    /**
     * Configuration API
     */
    public static class Api {
        public RateLimit rateLimit = new RateLimit();
        public Pagination pagination = new Pagination();
        
        public static class RateLimit {
            public boolean enabled = false;
            public int requestsPerMinute = 60;
        }
        
        public static class Pagination {
            public int defaultPageSize = 20;
            public int maxPageSize = 100;
        }
    }
    
    /**
     * Configuration debug/développement
     */
    public static class Debug {
        public boolean logRequests = false;
        public boolean logResponses = false;
        public boolean fakeData = false;
    }
    
    // Getters pour accès facile
    public Business getBusiness() { return business; }
    public Api getApi() { return api; }
    public Debug getDebug() { return debug; }
}