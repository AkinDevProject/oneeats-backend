# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📋 Context File Reference

**IMPORTANT**: Always read the `CONTEXT.md` file at the start of each session. This file contains:
- Complete project overview and architecture details
- Specific development setup constraints (IntelliJ + Quinoa)
- Available/unavailable commands for this environment
- Domain structure and implementation status
- All technical specifications and workflows

This context file is essential for understanding the OneEats project architecture and development environment.

## Project Overview

OneEats is a food delivery platform built with a monorepo architecture containing:
- **Backend**: Java Quarkus REST API with hexagonal architecture
- **Web Frontend**: React + TypeScript + Vite with Tailwind CSS
- **Mobile App**: React Native with Expo
- **Database**: PostgreSQL with Docker development setup

## Development Commands

### Backend (Quarkus)
```bash
# Start development server with hot reload
./mvnw quarkus:dev        # Linux/Mac
mvnw.cmd quarkus:dev      # Windows

# Run tests
./mvnw test

# Build for production
./mvnw clean package

# Build native executable
./mvnw package -Dnative
```

### Web Frontend (React/Vite)
```bash
cd apps/web

# Development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

### Mobile App (React Native/Expo)
```bash
cd apps/mobile

# Start Expo development server
npm start

# Start for Android
npm run android

# Start for iOS
npm run ios

# Start for web
npm run web

# Lint code
npm run lint
```

### Database Setup
```bash
# Start PostgreSQL + PgAdmin with Docker
docker-compose -f docker-compose.dev.yml up -d

# Stop and remove volumes
docker-compose -f docker-compose.dev.yml down -v
```

### Full Application Setup
```bash
# Quick setup (Windows)
start-dev.bat

# Quick setup (Linux/Mac)
./start-dev.sh
```

## Architecture Overview

### Backend Architecture (Hexagonal/Clean Architecture)
The backend follows Domain-Driven Design with hexagonal architecture:

```
src/main/java/com/oneeats/
├── [domain]/                     # Business domains
│   ├── api/                     # Application layer
│   │   ├── cqrs/               # Commands and queries
│   │   ├── interface_/         # Repository interfaces
│   │   └── model/              # DTOs
│   ├── adapter/                # Infrastructure layer
│   │   └── web/                # REST controllers
│   └── internal/               # Domain layer
│       ├── application/        # Use cases
│       ├── client/             # Repository implementations
│       ├── entity/             # Domain entities
│       └── mapper/             # Entity-DTO mappers
```

**Main Domains:**
- `user/` - User management and authentication
- `restaurant/` - Restaurant registration and management
- `menu/` - Menu items and categories
- `order/` - Order processing and lifecycle
- `notification/` - Notification system
- `admin/` - Administrative functions

### Frontend Architecture
The web frontend uses a component-based architecture:

```
apps/web/src/
├── components/                  # Reusable UI components
│   ├── auth/                   # Authentication components
│   ├── dashboard/              # Dashboard widgets
│   ├── forms/                  # Form components
│   ├── layouts/                # Layout components
│   └── ui/                     # Base UI components
├── pages/                      # Route-based pages
│   ├── admin/                  # Admin dashboard pages
│   └── restaurant/             # Restaurant management pages
├── hooks/                      # Custom React hooks
│   ├── business/               # Business logic hooks
│   ├── data/                   # Data fetching hooks
│   └── ui/                     # UI-related hooks
├── services/                   # API communication
├── types/                      # TypeScript type definitions
└── utils/                      # Utility functions
```

### API Integration
- **Quarkus + Quinoa**: Backend serves frontend automatically in dev mode
- **CORS Configuration**: Configured for localhost:5173 and localhost:3000
- **API Documentation**: Available at `/q/swagger-ui` when running
- **Base API Path**: All endpoints prefixed with `/api`

### Database Configuration
- **Development**: PostgreSQL via Docker (port 5432)
- **Connection**: `oneeats_dev` database with user `oneeats_user`
- **Admin Interface**: PgAdmin available at http://localhost:5050
- **Test Data**: Loaded via `import.sql` on startup

## Development Workflow

### Starting Development
1. Start database: `docker-compose -f docker-compose.dev.yml up -d`
2. Start backend: `./mvnw quarkus:dev` (includes frontend via Quinoa)
3. Access applications:
   - Frontend: http://localhost:5173
   - API: http://localhost:8080/api
   - API Docs: http://localhost:8080/q/swagger-ui

### Testing
- **Backend Tests**: Use JUnit 5 with RestAssured for integration tests
- **Test Profile**: Separate `application-test.yml` configuration
- **Mock Data**: Available in `src/test/resources`

### Key Configuration Files
- `pom.xml` - Maven dependencies and build configuration
- `application.yml` - Main Quarkus configuration
- `application-dev.yml` - Development-specific settings
- `apps/web/vite.config.ts` - Vite build configuration
- `apps/web/tailwind.config.js` - Tailwind CSS configuration

### Environment Profiles
- **Development**: `application-dev.yml` (hot reload, debug logging)
- **Production**: `application-prod.yml` (optimized settings)
- **Test**: `application-test.yml` (in-memory H2 database)

## Important Notes

### Security
- JWT authentication configured but not fully implemented
- CORS enabled for development origins
- Password hashing should be implemented for production

### Performance
- Hibernate caching configured for users and restaurants
- Frontend uses React Query for data caching
- Database connection pooling via Quarkus defaults

### Docker Integration
- Quinoa extension serves React frontend from Quarkus
- Development database runs in Docker
- Production Docker images can be built with Maven

### Mobile Development
- Expo-based React Native app in `apps/mobile/`
- Shared types and API contracts with web frontend
- Uses Expo Router for navigation