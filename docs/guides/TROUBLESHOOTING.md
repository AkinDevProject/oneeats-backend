# OneEats - Guide de Dépannage

Guide complet pour diagnostiquer et résoudre les problèmes courants de OneEats.

---

## Diagnostic Rapide

### Vérifications Initiales
```bash
# 1. Statut des services
docker-compose ps
kubectl get pods -n oneeats

# 2. Health checks
curl http://localhost:8080/q/health
curl http://localhost:8080/q/health/ready
curl http://localhost:8080/q/health/live

# 3. Logs récents
docker-compose logs -f oneeats-app
kubectl logs -f deployment/oneeats-app

# 4. Métriques
curl http://localhost:8080/q/metrics
```

### Indicateurs de Santé
- **✅ Sain** : Health check 200, logs normaux, métriques OK
- **⚠️ Dégradé** : Lenteurs, erreurs intermittentes
- **❌ En panne** : Health check échoue, erreurs 500, service injoignable

---

## Problèmes de Démarrage

### 1. Application ne démarre pas

#### **Symptôme** : Erreur au démarrage de Quarkus
```
Failed to start application
Caused by: java.lang.RuntimeException: Failed to start
```

#### **Diagnostic**
```bash
# Vérifier les logs de démarrage
./mvnw quarkus:dev
# ou
docker-compose logs oneeats-app

# Vérifier la configuration
cat src/main/resources/application-dev.yml

# Vérifier les dépendances
./mvnw dependency:tree
```

#### **Solutions**
```bash
# 1. Clean rebuild
./mvnw clean compile

# 2. Vérifier Java version
java -version  # Doit être 21+

# 3. Vérifier variables d'environnement
echo $JAVA_HOME

# 4. Supprimer cache Maven
rm -rf ~/.m2/repository/com/oneeats

# 5. Redémarrage propre
./mvnw quarkus:dev -Dquarkus.args=--clean
```

### 2. Erreur de port occupé

#### **Symptôme**
```
Port 8080 required by Quarkus is already in use
```

#### **Solutions**
```bash
# 1. Trouver le processus utilisant le port
netstat -tlnp | grep :8080
lsof -i :8080  # macOS/Linux

# 2. Tuer le processus
kill -9 <PID>

# 3. Utiliser un port différent
./mvnw quarkus:dev -Dquarkus.http.port=8081

# 4. Configuration permanente
echo "quarkus.http.port=8081" >> src/main/resources/application-dev.yml
```

---

## 💾 Problèmes Base de Données

### 1. Connexion à la base de données échoue

#### **Symptôme**
```
Unable to create requested service [org.hibernate.engine.jdbc.env.spi.JdbcEnvironment]
Connection refused: localhost:5432
```

#### **Diagnostic**
```bash
# 1. Vérifier que PostgreSQL fonctionne
docker-compose ps postgres
pg_isready -h localhost -p 5432

# 2. Test de connexion manuelle
psql -h localhost -U oneeats_user -d oneeats_dev

# 3. Vérifier les logs PostgreSQL
docker-compose logs postgres
```

#### **Solutions**
```bash
# 1. Redémarrer PostgreSQL
docker-compose restart postgres

# 2. Recréer complètement
docker-compose down -v
docker-compose up -d postgres

# 3. Vérifier les variables de connexion
echo "POSTGRES_DB=oneeats_dev"
echo "POSTGRES_USER=oneeats_user" 
echo "POSTGRES_PASSWORD=oneeats_password"

# 4. Nettoyer et recréer
docker-compose down
docker volume prune
docker-compose up -d
```

### 2. Erreurs de migration/schéma

#### **Symptôme**
```
Schema validation: wrong column type encountered in column [xxx] in table [xxx]
Table "restaurant" doesn't exist
```

#### **Solutions**
```bash
# 1. Drop et recréation (DEV uniquement !)
docker-compose down -v
docker-compose up -d postgres

# 2. Vérifier la configuration Hibernate
quarkus.hibernate-orm.database.generation: drop-and-create

# 3. Forcer la recréation du schéma
./mvnw quarkus:dev -Dquarkus.hibernate-orm.database.generation=drop-and-create

# 4. Exécuter manuellement import-dev.sql
psql -h localhost -U oneeats_user -d oneeats_dev -f src/main/resources/import-dev.sql
```

### 3. Performance base de données lente

#### **Diagnostic**
```sql
-- Connexions actives
SELECT count(*) as active_connections FROM pg_stat_activity;

-- Requêtes lentes
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Taille des tables
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

#### **Solutions**
```sql
-- 1. Ajouter index manquants
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_restaurant_status 
ON "order"(restaurant_id, status);

-- 2. Analyser les statistiques
ANALYZE;

-- 3. Vacuum complet (hors production)
VACUUM FULL;

-- 4. Optimisation configuration PostgreSQL
-- Dans postgresql.conf:
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
```

---

## 🔌 Problèmes d'APIs

### 1. Erreur 404 sur endpoints

#### **Symptôme**
```
HTTP 404 Not Found
GET /api/restaurants
```

#### **Diagnostic**
```bash
# 1. Vérifier les routes disponibles
curl http://localhost:8080/q/openapi
curl http://localhost:8080/q/swagger-ui

# 2. Vérifier les logs de l'application
./mvnw quarkus:dev | grep -i "registered.*endpoint"
```

#### **Solutions**
```java
// 1. Vérifier l'annotation @Path
@Path("/api/restaurants")
@ApplicationScoped

// 2. Vérifier l'enregistrement du Resource
@RegisterForReflection
public class RestaurantResource {

// 3. Vérifier le package scanning
// Dans application.yml:
quarkus:
  package:
    type: jar
```

### 2. Erreur 500 Internal Server Error

#### **Diagnostic**
```bash
# 1. Vérifier les logs détaillés
./mvnw quarkus:dev -Dquarkus.log.level=DEBUG

# 2. Vérifier les métriques d'erreur
curl http://localhost:8080/q/metrics | grep error

# 3. Test avec curl verbose
curl -v -X GET http://localhost:8080/api/restaurants
```

#### **Solutions courantes**
```java
// 1. Gestion d'exceptions globale
@Provider
public class GlobalExceptionMapper implements ExceptionMapper<Exception> {
    @Override
    public Response toResponse(Exception exception) {
        logger.error("Unexpected error", exception);
        return Response.status(500)
                .entity("Internal server error")
                .build();
    }
}

// 2. Validation des données d'entrée
@POST
public Response createRestaurant(@Valid CreateRestaurantRequest request) {
    try {
        // Logique métier
    } catch (BusinessException e) {
        return Response.status(400).entity(e.getMessage()).build();
    }
}
```

### 3. Problèmes CORS

#### **Symptôme**
```
Access to fetch at 'http://localhost:8080/api/restaurants' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

#### **Solutions**
```yaml
# application-dev.yml
quarkus:
  http:
    cors:
      ~: true
      origins: http://localhost:3000,http://localhost:5173
      methods: GET,POST,PUT,DELETE,OPTIONS
      headers: Origin,Content-Type,Accept,Authorization
      exposed-headers: Content-Disposition
      access-control-max-age: 86400

# Test CORS
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:8080/api/restaurants
```

---

## Problèmes d'Authentification

### 1. JWT Token invalide

#### **Symptôme**
```
HTTP 401 Unauthorized
Invalid JWT token
```

#### **Diagnostic**
```bash
# 1. Décoder le token JWT (sans vérification signature)
echo "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9..." | base64 -d

# 2. Vérifier la configuration OIDC
curl http://localhost:8081/realms/oneeats/.well-known/openid_configuration

# 3. Test d'authentification manuelle
curl -X POST http://localhost:8081/realms/oneeats/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=oneeats-backend&username=test@example.com&password=password123"
```

#### **Solutions**
```yaml
# 1. Vérifier la configuration Keycloak
quarkus:
  oidc:
    auth-server-url: http://localhost:8081/realms/oneeats
    client-id: oneeats-backend
    credentials:
      secret: your-client-secret

# 2. Vérifier les rôles dans le token
# 3. Synchroniser l'horloge système
ntpdate -s time.nist.gov
```

### 2. Keycloak inaccessible

#### **Symptôme**
```
OIDC server is not available at 'http://localhost:8081/realms/oneeats'
```

#### **Solutions**
```bash
# 1. Vérifier que Keycloak fonctionne
docker-compose ps keycloak
curl http://localhost:8081/realms/oneeats

# 2. Redémarrer Keycloak
docker-compose restart keycloak

# 3. Mode développement sans auth (temporaire)
quarkus.oidc.tenant-enabled=false
```

---

## Problèmes Frontend Mobile

### 1. App mobile ne se connecte pas au backend

#### **Symptôme**
```
Network Error: Failed to fetch
Connection refused
```

#### **Diagnostic**
```bash
# 1. Vérifier l'URL dans le code mobile
grep -r "localhost:8080" apps/mobile/

# 2. Test réseau depuis mobile
# Android: adb shell ping 10.0.2.2
# iOS Simulator: ping localhost

# 3. Vérifier CORS
curl -H "Origin: http://localhost:3000" http://localhost:8080/api/restaurants
```

#### **Solutions**
```typescript
// 1. Configuration API URL pour mobile
const API_BASE_URL = __DEV__ 
  ? Platform.OS === 'android' 
    ? 'http://10.0.2.2:8080'  // Android emulator
    : 'http://localhost:8080'  // iOS simulator
  : 'https://api.yourdomain.com';

// 2. Test de connectivité
const testConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/q/health`);
    console.log('Backend accessible:', response.ok);
  } catch (error) {
    console.error('Backend connection failed:', error);
  }
};
```

### 2. Push notifications ne fonctionnent pas

#### **Diagnostic**
```typescript
// Vérifier les permissions
import * as Notifications from 'expo-notifications';

const checkNotificationPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  console.log('Notification permission:', existingStatus);
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    console.log('New permission status:', status);
  }
};
```

#### **Solutions**
```json
// 1. Vérifier app.json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff"
        }
      ]
    ]
  }
}

// 2. Vérifier le token Expo Push
const getExpoPushToken = async () => {
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('Expo Push Token:', token);
  return token;
};
```

---

## Problèmes de Build et Déploiement

### 1. Build natif échoue

#### **Symptôme**
```
Build failed with GraalVM native-image
Caused by: com.oracle.svm.core.util.UserError$UserException: 
Classes that should be initialized at run time got initialized during image building
```

#### **Solutions**
```yaml
# 1. Configuration native
quarkus:
  native:
    additional-build-args: --allow-incomplete-classpath,--report-unsupported-elements-at-runtime
    enable-fallback-images: false
    
# 2. Reflection configuration
@RegisterForReflection
public class MyEntity { }

# 3. Build avec plus de mémoire
./mvnw clean package -Dnative -Dquarkus.native.native-image-xmx=4g
```

### 2. Problèmes Docker

#### **Symptômes divers**
```bash
# Image trop lourde
REPOSITORY    TAG      SIZE
oneeats       latest   1.2GB

# Container ne démarre pas
docker: Error response from daemon: failed to create shim
```

#### **Solutions**
```dockerfile
# 1. Optimisation multi-stage
FROM maven:3.8.6-openjdk-21 as build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -Dnative

FROM registry.access.redhat.com/ubi8/ubi-minimal:8.8
COPY --from=build /app/target/*-runner /application
EXPOSE 8080
ENTRYPOINT ["./application", "-Dquarkus.http.host=0.0.0.0"]

# 2. Diagnostic container
docker run -it --rm oneeats:latest /bin/bash
docker logs -f oneeats-container
docker exec -it oneeats-container ps aux
```

---

## Problèmes de Performance

### 1. Réponses lentes

#### **Diagnostic**
```bash
# 1. Métriques HTTP
curl http://localhost:8080/q/metrics | grep http_server_requests

# 2. Profiling avec JFR (Java Flight Recorder)
./mvnw quarkus:dev -Dquarkus.jfr.enabled=true

# 3. Test de charge
ab -n 1000 -c 10 http://localhost:8080/api/restaurants
wrk -t12 -c400 -d30s http://localhost:8080/api/restaurants
```

#### **Solutions**
```java
// 1. Cache à tous les niveaux
@CacheResult(cacheName = "restaurants")
public List<Restaurant> findAllActive() { }

// 2. Optimisation requêtes
@Query("SELECT r FROM Restaurant r WHERE r.isActive = true")
List<Restaurant> findAllActive();

// 3. Pagination systématique
public List<RestaurantDto> getRestaurants(@QueryParam("page") @DefaultValue("0") int page,
                                         @QueryParam("size") @DefaultValue("20") int size) {
    return restaurantService.findAll(page, size);
}
```

### 2. Consommation mémoire élevée

#### **Diagnostic**
```bash
# 1. Métriques JVM
curl http://localhost:8080/q/metrics | grep jvm_memory

# 2. Heap dump
jcmd <PID> GC.run_finalization
jcmd <PID> VM.classloader_stats

# 3. Monitoring continu
docker stats oneeats-container
```

#### **Solutions**
```yaml
# 1. Configuration JVM
quarkus:
  native:
    additional-build-args: -H:+UnlockExperimentalVMOptions,-H:+UseSeriallGC
    
# 2. Limitations container
services:
  oneeats-app:
    mem_limit: 512m
    memswap_limit: 512m
```

---

## 🚨 Procédures d'Urgence

### 1. Service complètement en panne

```bash
# 1. Diagnostic rapide (2 min)
curl -f http://yourdomain.com/q/health || echo "SERVICE DOWN"
docker-compose ps
kubectl get pods -n oneeats

# 2. Redémarrage d'urgence (5 min)
docker-compose restart oneeats-app
# ou
kubectl rollout restart deployment/oneeats-app

# 3. Rollback version précédente (10 min)
kubectl rollout undo deployment/oneeats-app
docker-compose down && docker-compose up -d

# 4. Escalade si nécessaire
echo "Service restored at $(date)" | mail -s "URGENT: OneEats restored" ops@company.com
```

### 2. Base de données corrompue

```bash
# 1. Arrêt immédiat des écritures
kubectl scale deployment oneeats-app --replicas=0

# 2. Vérification intégrité
docker exec postgres-container pg_check

# 3. Restauration depuis backup
gunzip < backup-20240101.sql.gz | psql -h postgres -U oneeats_user oneeats_prod

# 4. Tests avant remise en service
psql -h postgres -U oneeats_user -c "SELECT count(*) FROM restaurant;"
curl http://localhost:8080/q/health/ready

# 5. Remise en service progressive
kubectl scale deployment oneeats-app --replicas=1
# Attendre validation, puis scale à la normale
kubectl scale deployment oneeats-app --replicas=3
```

---

## 📞 Contacts et Escalade

### Niveaux de Support
1. **Level 1** : Auto-diagnostic avec ce guide (0-30 min)
2. **Level 2** : Support technique équipe (30 min - 2h)  
3. **Level 3** : Architectes/DevOps seniors (2h+)
4. **Level 4** : Fournisseurs externes (Postgres, Keycloak, etc.)

### Templates d'Escalade

#### Incident Report Template
```
INCIDENT: OneEats Service Disruption
SEVERITY: Critical/High/Medium/Low
START TIME: 2024-01-01 14:30:00 UTC
AFFECTED USERS: Estimated X users
SYMPTOMS: Brief description
IMPACT: Business impact description
ACTIONS TAKEN: What was already attempted
NEXT STEPS: Immediate actions planned
CONTACT: Your contact information
```

Ce guide de dépannage vous permet de résoudre 95% des problèmes courants de OneEats rapidement ! 🔧