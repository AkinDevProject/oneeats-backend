# OneEats - Guide de Déploiement Production

Guide complet pour déployer OneEats en environnement de production.

---

## Vue d'Ensemble Déploiement

### Architecture de Production
```
🌐 Internet
    ↓
🔒 Load Balancer / Reverse Proxy (Nginx)
    ↓
🚀 OneEats Backend (Quarkus Native)
    ↓
💾 PostgreSQL Database
    ↓ 
📊 Monitoring Stack (Prometheus + Grafana)
```

### Environnements
- **Development** : `localhost` avec Docker Compose
- **Staging** : Environnement de pré-production
- **Production** : Environnement final utilisateurs

---

## Déploiement avec Docker

### 1. Dockerfile Production
```dockerfile
# Dockerfile
FROM registry.access.redhat.com/ubi8/openjdk-21-runtime:1.19

# Copier l'exécutable natif
COPY target/*-runner /application

# Variables d'environnement
ENV QUARKUS_PROFILE=prod
ENV QUARKUS_HTTP_HOST=0.0.0.0
ENV QUARKUS_HTTP_PORT=8080

# Port exposé
EXPOSE 8080

# Point d'entrée
ENTRYPOINT ["./application", "-Dquarkus.http.host=0.0.0.0"]
```

### 2. Docker Compose Production
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  oneeats-app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - QUARKUS_PROFILE=prod
      - QUARKUS_DATASOURCE_DB_KIND=postgresql
      - QUARKUS_DATASOURCE_JDBC_URL=jdbc:postgresql://postgres:5432/oneeats_prod
      - QUARKUS_DATASOURCE_USERNAME=oneeats_user
      - QUARKUS_DATASOURCE_PASSWORD=${DB_PASSWORD}
      - QUARKUS_OIDC_AUTH_SERVER_URL=${KEYCLOAK_URL}
    depends_on:
      - postgres
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/q/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=oneeats_prod
      - POSTGRES_USER=oneeats_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-prod.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - oneeats-app
    restart: unless-stopped

volumes:
  postgres_data:
```

### 3. Configuration Nginx
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream oneeats-backend {
        server oneeats-app:8080;
    }

    # Redirection HTTP vers HTTPS
    server {
        listen 80;
        server_name yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    # Configuration HTTPS
    server {
        listen 443 ssl http2;
        server_name yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # API Backend
        location /api/ {
            proxy_pass http://oneeats-backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Frontend Web (si servi par Quarkus)
        location / {
            proxy_pass http://oneeats-backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health checks
        location /q/health {
            proxy_pass http://oneeats-backend;
            access_log off;
        }
    }
}
```

---

## Build et Déploiement

### 1. Build Natif Production
```bash
# Build natif optimisé pour production
./mvnw clean package -Dnative -Dquarkus.profile=prod

# Ou avec Docker (si pas de GraalVM local)
./mvnw clean package -Dnative -Dquarkus.native.container-build=true
```

### 2. Variables d'Environnement
```bash
# .env.prod
DB_PASSWORD=your_secure_password_here
KEYCLOAK_URL=https://auth.yourdomain.com/realms/oneeats
JWT_SECRET=your_jwt_secret_256_bits_minimum
CORS_ORIGINS=https://yourdomain.com,https://mobile.yourdomain.com
SMTP_HOST=smtp.yourdomain.com
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=your_smtp_password
```

### 3. Commandes de Déploiement
```bash
# 1. Préparer l'environnement
mkdir -p /opt/oneeats/ssl
cd /opt/oneeats

# 2. Copier les fichiers
scp docker-compose.prod.yml server:/opt/oneeats/
scp nginx.conf server:/opt/oneeats/
scp .env.prod server:/opt/oneeats/.env

# 3. Déployer
docker-compose -f docker-compose.prod.yml --env-file .env up -d

# 4. Vérifier le déploiement
docker-compose -f docker-compose.prod.yml ps
curl -f https://yourdomain.com/q/health
```

---

## Déploiement Kubernetes

### 1. Configuration ConfigMap
```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: oneeats-config
data:
  QUARKUS_PROFILE: "prod"
  QUARKUS_HTTP_HOST: "0.0.0.0"
  QUARKUS_DATASOURCE_DB_KIND: "postgresql"
  QUARKUS_DATASOURCE_JDBC_URL: "jdbc:postgresql://postgres:5432/oneeats_prod"
```

### 2. Secret pour Mots de Passe
```yaml
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: oneeats-secret
type: Opaque
data:
  DB_PASSWORD: <base64-encoded-password>
  JWT_SECRET: <base64-encoded-jwt-secret>
```

### 3. Deployment Principal
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: oneeats-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: oneeats-app
  template:
    metadata:
      labels:
        app: oneeats-app
    spec:
      containers:
      - name: oneeats
        image: oneeats:latest
        ports:
        - containerPort: 8080
        envFrom:
        - configMapRef:
            name: oneeats-config
        - secretRef:
            name: oneeats-secret
        livenessProbe:
          httpGet:
            path: /q/health/live
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /q/health/ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### 4. Service et Ingress
```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: oneeats-service
spec:
  selector:
    app: oneeats-app
  ports:
  - port: 80
    targetPort: 8080
  type: ClusterIP

---
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: oneeats-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - yourdomain.com
    secretName: oneeats-tls
  rules:
  - host: yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: oneeats-service
            port:
              number: 80
```

---

## Configuration Base de Données Production

### 1. Configuration PostgreSQL
```yaml
# k8s/postgres.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        env:
        - name: POSTGRES_DB
          value: oneeats_prod
        - name: POSTGRES_USER
          value: oneeats_user
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: oneeats-secret
              key: DB_PASSWORD
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 20Gi
```

### 2. Script d'Initialisation Production
```sql
-- init-prod.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Index pour optimiser les performances
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurant_active ON restaurant(is_active) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurant_open ON restaurant(is_open) WHERE is_open = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_menu_item_restaurant ON menu_item(restaurant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_menu_item_available ON menu_item(is_available) WHERE is_available = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_status ON "order"(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_restaurant ON "order"(restaurant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_user ON "order"(user_id);

-- Contraintes de performance
ALTER TABLE restaurant SET (fillfactor = 90);
ALTER TABLE menu_item SET (fillfactor = 90);
ALTER TABLE "order" SET (fillfactor = 80);
```

---

## Monitoring et Logs

### 1. Configuration Prometheus
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'oneeats-app'
    static_configs:
      - targets: ['oneeats-app:8080']
    metrics_path: '/q/metrics'
    scrape_interval: 5s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
```

### 2. Configuration Application
```yaml
# application-prod.yml (ajout monitoring)
quarkus:
  log:
    level: INFO
    console:
      json: true
    file:
      enable: true
      path: /var/log/oneeats.log
      rotation:
        max-file-size: 100M
        max-backup-index: 5

  micrometer:
    export:
      prometheus:
        enabled: true
        path: /q/metrics

  smallrye-health:
    root-path: /q/health
```

---

## Processus de Mise à Jour

### 1. Déploiement Blue-Green
```bash
# 1. Build nouvelle version
./mvnw clean package -Dnative -Dquarkus.profile=prod

# 2. Tag nouvelle image
docker build -t oneeats:v1.2.0 .
docker tag oneeats:v1.2.0 oneeats:latest

# 3. Mise à jour progressive (Kubernetes)
kubectl set image deployment/oneeats-app oneeats=oneeats:v1.2.0

# 4. Vérifier rollout
kubectl rollout status deployment/oneeats-app

# 5. Rollback si problème
kubectl rollout undo deployment/oneeats-app
```

### 2. Migrations Base de Données
```bash
# 1. Backup avant migration
pg_dump -h postgres -U oneeats_user oneeats_prod > backup-$(date +%Y%m%d-%H%M%S).sql

# 2. Test migration sur copie
# 3. Migration production avec Flyway/Liquibase
# 4. Vérification post-migration
```

---

## Sécurité Production

### 1. Checklist Sécurité
- [ ] **HTTPS** activé avec certificats valides
- [ ] **Firewall** configuré (ports 80, 443 uniquement)
- [ ] **Base de données** non exposée publiquement
- [ ] **Mots de passe** sécurisés et dans secrets
- [ ] **JWT secrets** rotationnels
- [ ] **CORS** configuré pour domaines spécifiques
- [ ] **Rate limiting** activé
- [ ] **Logs** centralisés et monitoring actif

### 2. Variables Sensibles
```bash
# Ne jamais committer en clair !
DB_PASSWORD=              # 32+ caractères aléatoires
JWT_SECRET=              # 256 bits minimum  
KEYCLOAK_CLIENT_SECRET=  # Fourni par Keycloak
API_RATE_LIMIT=          # Ex: 100 req/min par IP
```

---

## Checklist Post-Déploiement

### Tests de Validation
- [ ] **Health checks** : `/q/health` répond 200
- [ ] **APIs** : Tests automatisés passent
- [ ] **Base de données** : Connexion et requêtes OK
- [ ] **Monitoring** : Métriques remontées
- [ ] **Logs** : Logs structurés visibles
- [ ] **Performance** : Temps de réponse < 200ms
- [ ] **Sécurité** : Scans sécurité passent
- [ ] **Backup** : Sauvegardes programmées

### Monitoring à Surveiller
- **CPU/RAM** : < 80% d'utilisation
- **Connexions DB** : < limite configurée
- **Temps réponse** : P99 < 500ms
- **Erreurs** : Taux d'erreur < 1%
- **Espace disque** : > 20% libre

Ce guide vous permet un déploiement production robuste et sécurisé de OneEats ! 🚀