# OneEats - Guide de Sécurité

Guide complet de sécurisation de la plateforme OneEats pour l'environnement de production.

---

## 🎯 Vue d'Ensemble Sécurité

### Architecture Sécurisée
```
🌐 Internet
    ↓ [HTTPS + Rate Limiting]
🔒 Reverse Proxy (Nginx + WAF)
    ↓ [JWT Validation]
🛡️ OneEats Backend (Quarkus + Keycloak)
    ↓ [Connection Pooling + Encryption]
💾 PostgreSQL (Network Isolation)
```

### Principes de Sécurité Appliqués
- **Defense in Depth** : Sécurité en couches
- **Principle of Least Privilege** : Accès minimal nécessaire
- **Zero Trust** : Vérification à chaque étape
- **Security by Design** : Sécurité intégrée dès la conception

---

## 🔐 Authentification et Autorisation

### 1. Configuration Keycloak

#### Installation Keycloak
```yaml
# docker-compose.keycloak.yml
version: '3.8'
services:
  keycloak:
    image: quay.io/keycloak/keycloak:22.0
    environment:
      - KEYCLOAK_ADMIN=admin
      - KEYCLOAK_ADMIN_PASSWORD=${KEYCLOAK_ADMIN_PASSWORD}
      - KC_DB=postgres
      - KC_DB_URL=jdbc:postgresql://postgres:5432/keycloak
      - KC_DB_USERNAME=keycloak_user
      - KC_DB_PASSWORD=${KEYCLOAK_DB_PASSWORD}
      - KC_HOSTNAME_STRICT=false
      - KC_HTTP_ENABLED=true
    ports:
      - "8081:8080"
    command: start-dev
    depends_on:
      - postgres
```

#### Configuration Realm OneEats
```json
{
  "realm": "oneeats",
  "enabled": true,
  "sslRequired": "external",
  "registrationAllowed": true,
  "loginWithEmailAllowed": true,
  "duplicateEmailsAllowed": false,
  "resetPasswordAllowed": true,
  "editUsernameAllowed": false,
  "bruteForceProtected": true,
  "permanentLockout": false,
  "maxFailureWait": 900,
  "minimumQuickLoginWait": 60,
  "waitIncrementSeconds": 60,
  "quickLoginCheckMilliSeconds": 1000,
  "maxDeltaTimeSeconds": 43200,
  "failureFactor": 30
}
```

### 2. Configuration Quarkus OIDC

#### application-prod.yml
```yaml
quarkus:
  oidc:
    auth-server-url: https://auth.yourdomain.com/realms/oneeats
    client-id: oneeats-backend
    credentials:
      secret: ${KEYCLOAK_CLIENT_SECRET}
    tls:
      verification: required
    token:
      issuer: https://auth.yourdomain.com/realms/oneeats
      audience: oneeats-backend
      verify-access-token-with-user-info: true

  security:
    jaxrs:
      deny-unannotated-endpoints: true
    cors:
      ~: true
      origins: https://yourdomain.com,https://mobile.yourdomain.com
      methods: GET,POST,PUT,DELETE,OPTIONS
      headers: Origin,Content-Type,Accept,Authorization
      exposed-headers: Content-Disposition
      access-control-max-age: 86400
```

### 3. Rôles et Permissions

#### Définition des Rôles
```java
// Roles.java
public final class Roles {
    public static final String ADMIN = "admin";
    public static final String RESTAURANT_OWNER = "restaurant_owner";
    public static final String CUSTOMER = "customer";
    
    // Permissions granulaires
    public static final String MANAGE_RESTAURANTS = "manage:restaurants";
    public static final String MANAGE_ORDERS = "manage:orders";
    public static final String VIEW_ANALYTICS = "view:analytics";
    public static final String PLACE_ORDERS = "place:orders";
}
```

#### Sécurisation des Endpoints
```java
// RestaurantResource.java
@Path("/api/restaurants")
@Authenticated
public class RestaurantResource {

    @GET
    @RolesAllowed({Roles.CUSTOMER, Roles.RESTAURANT_OWNER, Roles.ADMIN})
    public List<RestaurantDto> getRestaurants() {
        // Public endpoint - tous les utilisateurs authentifiés
    }

    @POST
    @RolesAllowed({Roles.RESTAURANT_OWNER, Roles.ADMIN})
    public RestaurantDto createRestaurant(CreateRestaurantRequest request) {
        // Seuls les propriétaires et admins peuvent créer
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed({Roles.RESTAURANT_OWNER, Roles.ADMIN})
    public RestaurantDto updateRestaurant(@PathParam("id") UUID id, 
                                         UpdateRestaurantRequest request) {
        // Vérification propriétaire du restaurant
        securityService.checkRestaurantOwnership(id, jwt.getSubject());
        // ...
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed(Roles.ADMIN)
    public void deleteRestaurant(@PathParam("id") UUID id) {
        // Seuls les admins peuvent supprimer
    }
}
```

### 4. Sécurité au Niveau Métier
```java
// SecurityService.java
@ApplicationScoped
public class SecurityService {
    
    @Inject
    JsonWebToken jwt;
    
    @Inject
    RestaurantRepository restaurantRepository;

    public void checkRestaurantOwnership(UUID restaurantId, String userId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId);
        if (restaurant == null) {
            throw new NotFoundException("Restaurant not found");
        }
        
        if (!restaurant.getOwnerId().equals(UUID.fromString(userId))) {
            throw new ForbiddenException("Not authorized to access this restaurant");
        }
    }

    public void checkOrderOwnership(UUID orderId, String userId) {
        Order order = orderRepository.findById(orderId);
        if (order == null) {
            throw new NotFoundException("Order not found");
        }
        
        // Un client ne peut voir que ses commandes
        if (hasRole(Roles.CUSTOMER) && !order.getUserId().equals(UUID.fromString(userId))) {
            throw new ForbiddenException("Not authorized to access this order");
        }
        
        // Un restaurant ne peut voir que ses commandes
        if (hasRole(Roles.RESTAURANT_OWNER)) {
            checkRestaurantOwnership(order.getRestaurantId(), userId);
        }
    }

    private boolean hasRole(String role) {
        return jwt.getGroups().contains(role);
    }
}
```

---

## 🛡️ Protection des Données

### 1. Chiffrement des Mots de Passe
```java
// PasswordService.java
@ApplicationScoped
public class PasswordService {
    
    private static final BCryptPasswordEncoder encoder = 
        new BCryptPasswordEncoder(12); // Force 12 pour sécurité renforcée

    public String hashPassword(String plainPassword) {
        validatePasswordStrength(plainPassword);
        return encoder.encode(plainPassword);
    }

    public boolean verifyPassword(String plainPassword, String hashedPassword) {
        return encoder.matches(plainPassword, hashedPassword);
    }

    private void validatePasswordStrength(String password) {
        if (password == null || password.length() < 12) {
            throw new IllegalArgumentException("Password must be at least 12 characters long");
        }
        
        if (!password.matches(".*[A-Z].*")) {
            throw new IllegalArgumentException("Password must contain uppercase letter");
        }
        
        if (!password.matches(".*[a-z].*")) {
            throw new IllegalArgumentException("Password must contain lowercase letter");
        }
        
        if (!password.matches(".*[0-9].*")) {
            throw new IllegalArgumentException("Password must contain digit");
        }
        
        if (!password.matches(".*[!@#$%^&*(),.?\":{}|<>].*")) {
            throw new IllegalArgumentException("Password must contain special character");
        }
    }
}
```

### 2. Protection des Données Sensibles
```java
// User.java
@Entity
@Table(name = "users")
public class User extends BaseEntity {
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(name = "password_hash", nullable = false)
    @JsonIgnore // Ne jamais exposer le hash
    private String passwordHash;
    
    @Column(name = "phone")
    @Convert(converter = PhoneEncryptionConverter.class) // Chiffrement au niveau DB
    private String phone;
    
    @Column(name = "address") 
    @Convert(converter = AddressEncryptionConverter.class) // Chiffrement au niveau DB
    private String address;
    
    // Données audit
    @Column(name = "last_login")
    private LocalDateTime lastLogin;
    
    @Column(name = "failed_login_attempts")
    private int failedLoginAttempts = 0;
    
    @Column(name = "account_locked_until")
    private LocalDateTime accountLockedUntil;
}
```

### 3. Chiffrement Base de Données
```java
// EncryptionConverter.java
@Component
public class PhoneEncryptionConverter implements AttributeConverter<String, String> {
    
    @Value("${app.encryption.key}")
    private String encryptionKey;
    
    private final AESUtil aesUtil = new AESUtil();

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null) return null;
        try {
            return aesUtil.encrypt(attribute, encryptionKey);
        } catch (Exception e) {
            throw new RuntimeException("Error encrypting phone number", e);
        }
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        try {
            return aesUtil.decrypt(dbData, encryptionKey);
        } catch (Exception e) {
            throw new RuntimeException("Error decrypting phone number", e);
        }
    }
}
```

---

## 🚫 Protection contre les Attaques

### 1. Rate Limiting
```java
// RateLimitingFilter.java
@Provider
@PreMatching
public class RateLimitingFilter implements ContainerRequestFilter {
    
    private final Cache<String, Integer> requestCounts = 
        Caffeine.newBuilder()
            .maximumSize(10000)
            .expireAfterWrite(1, TimeUnit.MINUTES)
            .build();
    
    @Override
    public void filter(ContainerRequestContext requestContext) {
        String clientIP = getClientIP(requestContext);
        String key = clientIP + ":" + getCurrentMinute();
        
        Integer count = requestCounts.get(key, k -> 0);
        if (count >= 100) { // 100 requêtes/minute max
            requestContext.abortWith(
                Response.status(429)
                    .entity("Rate limit exceeded")
                    .build()
            );
            return;
        }
        
        requestCounts.put(key, count + 1);
    }
    
    private String getClientIP(ContainerRequestContext context) {
        String xForwardedFor = context.getHeaderString("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return context.getHeaderString("X-Real-IP");
    }
}
```

### 2. Protection CSRF
```java
// CSRFProtectionFilter.java
@Provider
public class CSRFProtectionFilter implements ContainerRequestFilter {
    
    @Override
    public void filter(ContainerRequestContext requestContext) {
        String method = requestContext.getMethod();
        
        // Protection sur mutations uniquement
        if ("POST".equals(method) || "PUT".equals(method) || "DELETE".equals(method)) {
            String csrfToken = requestContext.getHeaderString("X-CSRF-Token");
            String sessionToken = getSessionCSRFToken(requestContext);
            
            if (csrfToken == null || !csrfToken.equals(sessionToken)) {
                requestContext.abortWith(
                    Response.status(403)
                        .entity("CSRF token invalid")
                        .build()
                );
            }
        }
    }
}
```

### 3. Validation et Sanitisation
```java
// InputValidationService.java
@ApplicationScoped
public class InputValidationService {
    
    private static final Pattern EMAIL_PATTERN = 
        Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    
    private static final Pattern PHONE_PATTERN = 
        Pattern.compile("^\\+?[1-9]\\d{1,14}$");
        
    private static final Sanitizer HTML_SANITIZER = 
        Sanitizers.FORMATTING.and(Sanitizers.LINKS);

    public void validateEmail(String email) {
        if (email == null || !EMAIL_PATTERN.matcher(email).matches()) {
            throw new ValidationException("Invalid email format");
        }
    }

    public void validatePhone(String phone) {
        if (phone != null && !PHONE_PATTERN.matcher(phone).matches()) {
            throw new ValidationException("Invalid phone format");
        }
    }

    public String sanitizeHtml(String input) {
        if (input == null) return null;
        return HTML_SANITIZER.sanitize(input);
    }

    public void validateNoSQLInjection(String input) {
        if (input != null && containsSQLKeywords(input)) {
            throw new SecurityException("Potentially malicious input detected");
        }
    }
    
    private boolean containsSQLKeywords(String input) {
        String upperInput = input.toUpperCase();
        String[] sqlKeywords = {"SELECT", "INSERT", "UPDATE", "DELETE", "DROP", "UNION", "SCRIPT"};
        return Arrays.stream(sqlKeywords).anyMatch(upperInput::contains);
    }
}
```

---

## 🔒 Configuration HTTPS et TLS

### 1. Configuration Nginx SSL
```nginx
# nginx-ssl.conf
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    # Certificats SSL
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/private.key;
    
    # Configuration SSL sécurisée
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Autres headers de sécurité
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;" always;
}
```

### 2. Configuration Application TLS
```yaml
# application-prod.yml
quarkus:
  http:
    ssl:
      certificate:
        files: /etc/ssl/certs/app.crt
        key-files: /etc/ssl/private/app.key
    ssl-port: 8443
    redirect-to-https: true
    
  datasource:
    jdbc:
      url: jdbc:postgresql://postgres:5432/oneeats_prod?sslmode=require&sslcert=/etc/ssl/client.crt&sslkey=/etc/ssl/client.key&sslrootcert=/etc/ssl/ca.crt
```

---

## 📊 Monitoring Sécurité

### 1. Logs de Sécurité
```java
// SecurityAuditService.java
@ApplicationScoped
public class SecurityAuditService {
    
    private static final Logger securityLogger = 
        LoggerFactory.getLogger("SECURITY");

    public void logSuccessfulLogin(String userId, String ipAddress) {
        securityLogger.info("SUCCESSFUL_LOGIN user={} ip={}", userId, ipAddress);
    }

    public void logFailedLogin(String email, String ipAddress, String reason) {
        securityLogger.warn("FAILED_LOGIN email={} ip={} reason={}", email, ipAddress, reason);
    }

    public void logUnauthorizedAccess(String userId, String resource, String ipAddress) {
        securityLogger.error("UNAUTHORIZED_ACCESS user={} resource={} ip={}", 
                           userId, resource, ipAddress);
    }

    public void logSuspiciousActivity(String activity, String ipAddress, Map<String, String> details) {
        securityLogger.error("SUSPICIOUS_ACTIVITY activity={} ip={} details={}", 
                           activity, ipAddress, details);
    }
}
```

### 2. Métriques Sécurité
```java
// SecurityMetrics.java
@ApplicationScoped
public class SecurityMetrics {
    
    @Inject
    MeterRegistry meterRegistry;
    
    private final Counter failedLoginCounter;
    private final Counter unauthorizedAccessCounter;
    private final Timer authenticationTimer;

    public SecurityMetrics(MeterRegistry meterRegistry) {
        this.failedLoginCounter = Counter.builder("security.failed.logins")
            .description("Number of failed login attempts")
            .register(meterRegistry);
            
        this.unauthorizedAccessCounter = Counter.builder("security.unauthorized.access")
            .description("Number of unauthorized access attempts")
            .register(meterRegistry);
            
        this.authenticationTimer = Timer.builder("security.authentication.time")
            .description("Time taken to authenticate requests")
            .register(meterRegistry);
    }

    public void recordFailedLogin() {
        failedLoginCounter.increment();
    }

    public void recordUnauthorizedAccess() {
        unauthorizedAccessCounter.increment();
    }

    public Timer.Sample startAuthenticationTimer() {
        return Timer.start(meterRegistry);
    }
}
```

---

## 🔐 Gestion des Secrets

### 1. Variables d'Environnement Sécurisées
```bash
# secrets.env (JAMAIS commité !)
# Base de données
DB_PASSWORD=VotreMotDePasseTresSecurise123!@#
DB_ENCRYPTION_KEY=base64:your-32-character-encryption-key-here

# JWT et authentification
JWT_SECRET=votre-jwt-secret-de-256-bits-minimum-ici
KEYCLOAK_CLIENT_SECRET=keycloak-client-secret-from-admin-console

# APIs externes
SMTP_PASSWORD=votre-mot-de-passe-smtp
PAYMENT_API_SECRET=payment-gateway-secret-key

# Monitoring
GRAFANA_ADMIN_PASSWORD=secure-grafana-password
PROMETHEUS_PASSWORD=secure-prometheus-password
```

### 2. Rotation des Secrets
```bash
#!/bin/bash
# rotate-secrets.sh

# Rotation JWT secret (tous les 30 jours)
if [ "$(($(date +%s) - $(stat -c %Y /etc/secrets/jwt.key)))" -gt 2592000 ]; then
    echo "Rotating JWT secret..."
    openssl rand -base64 32 > /etc/secrets/jwt.key.new
    mv /etc/secrets/jwt.key.new /etc/secrets/jwt.key
    # Redémarrage progressif des services
    kubectl rollout restart deployment/oneeats-app
fi

# Rotation certificats SSL (avant expiration)
if openssl x509 -checkend 604800 -noout -in /etc/ssl/certs/app.crt; then
    echo "SSL certificate expires in 7 days, renewing..."
    certbot renew --nginx
fi
```

---

## ✅ Checklist Sécurité

### 🔐 Authentification et Autorisation
- [ ] **Keycloak** configuré avec realm OneEats
- [ ] **OIDC** configuré sur Quarkus avec vérification token
- [ ] **Rôles** définis (admin, restaurant_owner, customer)
- [ ] **Endpoints** sécurisés avec `@RolesAllowed`
- [ ] **Ownership checks** implémentés au niveau métier
- [ ] **Session management** configuré (timeout, renouvellement)

### 🛡️ Protection des Données  
- [ ] **Mots de passe** hashés avec BCrypt (force 12+)
- [ ] **Données sensibles** chiffrées en base (téléphone, adresse)
- [ ] **Clés de chiffrement** stockées séparément et sécurisées
- [ ] **PII (Personal Identifiable Information)** identifiées et protégées
- [ ] **Logs** ne contiennent aucune donnée sensible

### 🚫 Protection contre Attaques
- [ ] **Rate limiting** activé (100 req/min par IP)
- [ ] **CSRF protection** implémentée sur mutations
- [ ] **Input validation** systématique avec sanitisation
- [ ] **SQL injection** protection via PreparedStatement/JPA
- [ ] **XSS protection** via sanitisation HTML
- [ ] **File upload** sécurisé avec validation type/taille

### 🔒 Configuration HTTPS/TLS
- [ ] **Certificats SSL** valides et automatiquement renouvelés
- [ ] **TLS 1.2+** uniquement, ciphers sécurisés
- [ ] **HSTS** activé avec includeSubDomains
- [ ] **Security headers** configurés (CSP, X-Frame-Options, etc.)
- [ ] **Redirection HTTP → HTTPS** automatique

### 📊 Monitoring et Alertes
- [ ] **Logs sécurité** centralisés et monitored
- [ ] **Métriques sécurité** (failed logins, unauthorized access)
- [ ] **Alertes** configurées sur activités suspectes
- [ ] **SIEM** intégration pour détection avancée
- [ ] **Backup logs** sécurisés et rétention définie

### 🔐 Gestion Secrets et Configurations
- [ ] **Variables sensibles** dans secrets non committés
- [ ] **Rotation automatique** des secrets critiques
- [ ] **Accès secrets** restreint (RBAC, least privilege)
- [ ] **Audit trail** sur accès aux secrets
- [ ] **Chiffrement au repos** pour tous les secrets

### 🏠 Infrastructure et Réseau
- [ ] **Firewall** configuré (ports minimums ouverts)
- [ ] **Base de données** non exposée publiquement
- [ ] **Network segmentation** entre services
- [ ] **VPN/Bastion** pour accès admin
- [ ] **Vulnerability scanning** automatisé

Ce guide de sécurité vous assure une protection robuste de OneEats contre les menaces courantes ! 🛡️