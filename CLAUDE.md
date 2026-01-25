# CLAUDE.md

This file provides guidance to Claude Code when working with the OneEats project.

---

## Quick Start for Claude Code

### Start of Each Session - Read These Files IN ORDER

1. **[docs/ROADMAP.md](docs/ROADMAP.md)** - START HERE
   - See current task and what's in progress
   - Check "Tache en cours" section
   - Review recent session notes

2. **[CONTEXT.md](CONTEXT.md)** - Required Context
   - Complete project overview and architecture
   - Development constraints (IntelliJ only, no CLI mvnw)
   - All technical specifications

3. **[docs/README.md](docs/README.md)** - Documentation Guide
   - Navigate to specific documentation
   - Find guides for your current task

---

## Essential Documentation (Reference When Needed)

| Document | Purpose | When to Read |
|----------|---------|--------------|
| **[shared/analyst/BUSINESS_RULES.md](docs/shared/analyst/BUSINESS_RULES.md)** | Business logic, workflows | Implementing features |
| **[shared/architect/](docs/shared/architect/)** | Technical architecture | Designing components |
| **[shared/architect-dev/API_SPECS.md](docs/shared/architect-dev/API_SPECS.md)** | API endpoints | Creating/calling APIs |
| **[shared/architect-dev/DATA_MODEL.md](docs/shared/architect-dev/DATA_MODEL.md)** | Database schema | Working with DB |
| **[BUGS.md](docs/BUGS.md)** | Known issues | Encountering problems |

### Platform-Specific Guides

| Platform | Dev Guide | UX Specs | Tests |
|----------|-----------|----------|-------|
| **Backend** | [backend/dev/](docs/backend/dev/) | - | shared/tea/ |
| **Mobile** | [mobile/dev/](docs/mobile/dev/) | [mobile/ux-designer/](docs/mobile/ux-designer/) | [mobile/tea/](docs/mobile/tea/) |
| **Web** | - | [web/ux-designer/](docs/web/ux-designer/) | [web/tea/](docs/web/tea/) |

---

## Project Overview

**OneEats** is a food ordering platform for pickup (no delivery in MVP):
- **Backend**: Java Quarkus 3.24.2 + PostgreSQL (Hexagonal Architecture)
- **Web Dashboard**: React + TypeScript + Vite (served via Quinoa)
- **Mobile App**: React Native + Expo
- **Architecture**: Monolithic with Domain-Driven Design

---

## Development Setup (Quick Reference)

### Environment Constraints - IMPORTANT

**This project has specific constraints:**
- Backend: Launch from **IntelliJ IDEA** (Quarkus dev mode)
- NOT available: `./mvnw` commands in terminal (no JDK in CLI)
- Frontend Web: Served automatically via Quinoa from backend
- Mobile: Expo CLI available (`cd apps/mobile && npm start`)
- Database: Docker Compose (`docker-compose -f docker-compose.yml up -d`)

### Quick Start Commands

```bash
# 1. Start database
docker-compose -f docker-compose.yml up -d

# 2. Start backend (IntelliJ IDEA Quarkus dev mode)
# Backend: http://localhost:8080/api
# Frontend Dashboard: http://localhost:8080/restaurant

# 3. Start mobile (optional)
cd apps/mobile && npm start
```

For detailed commands, see [backend/dev/GETTING_STARTED.md](docs/backend/dev/GETTING_STARTED.md)

---

## Code Structure (Quick Reference)

### Backend (Hexagonal Architecture)

Each domain follows this structure:
```
src/main/java/com/oneeats/[domain]/
├── api/            # DTOs and contracts (public interface)
├── domain/         # Entities and business logic
└── infrastructure/ # Controllers, repositories, mappers
```

**Implemented Domains**: User, Restaurant, Menu, Order
**To Implement**: Admin, Notification

For detailed architecture, see [docs/shared/architect/](docs/shared/architect/)

---

## Typical Workflow for Claude Code

### When Starting a New Task

1. **Read** `docs/ROADMAP.md` - Identify current task
2. **Read** relevant `docs/shared/analyst/BUSINESS_RULES.md` section - Understand domain rules
3. **Read** `docs/shared/architect-dev/DATA_MODEL.md` - Check database schema if needed
4. **Check** `docs/BUGS.md` - Avoid known issues
5. **Implement** the task following existing patterns (use Order domain as reference)
6. **Update** `docs/ROADMAP.md` - Mark task progress in "Notes de Session"

### When Encountering Issues

1. **Check** `docs/BUGS.md` - Is it a known issue?
2. **Check** `docs/backend/dev/TROUBLESHOOTING.md` - Common problems
3. **Check** `CONTEXT.md` - Environment constraints
4. **Report** in `docs/BUGS.md` if new issue

### Before Ending Session

1. **Update** `docs/ROADMAP.md` - Add session notes (what was done, what's next)
2. **Commit** changes with descriptive message
3. **Update** `CONTEXT.md` if architecture/domains changed

---

## Current Project Status (Quick View)

- **Backend APIs**: ✅ 100% (User, Restaurant, Menu, Order, Auth, Admin complete)
- **Web Dashboard**: ✅ 100% (fully connected to APIs)
- **Mobile App**: ✅ 100% (fully connected to APIs + push notifications)
- **Authentication JWT**: ✅ 100% (Keycloak OIDC + RBAC implemented)
- **Tests**: ✅ 95% (144 tests - WebSocket + Auth/RBAC)
- **Push Notifications**: ✅ 100% (backend endpoint + mobile auto-sync)

**MVP Status**: ✅ **100% COMPLETE** - Ready for release! 🎉

For detailed status, see [ROADMAP.md](docs/ROADMAP.md)

---

## Known Critical Issues

See [docs/BUGS.md](docs/BUGS.md) for complete list.

**All critical blockers resolved!** ✅
- ~~BUG-001~~: Frontend using mock data → ✅ Resolved (connected to real APIs)
- ~~BUG-002~~: JWT authentication not implemented → ✅ Resolved (Keycloak OIDC)
- ~~BUG-008~~: Push token not sent to backend → ✅ Resolved (auto-sync implemented)

---

## Coding Conventions

- **Language**: French (comments, commits, documentation)
- **Java**: CamelCase, follow DDD patterns
- **TypeScript**: camelCase for variables, PascalCase for components
- **Database**: snake_case for tables/columns
- **Commits**: Conventional format (`feat:`, `fix:`, `docs:`, `refactor:`)

For detailed conventions, see [CONTEXT.md](CONTEXT.md)

---

## Pro Tips for Claude Code

1. **Always start** by reading `ROADMAP.md` - Know where you are
2. **Use Order domain** as reference - Complete implementation example
3. **Check environment constraints** in `CONTEXT.md` - Avoid CLI commands
4. **Update ROADMAP.md** after each session - Keep context for next time
5. **Follow existing patterns** - Consistency is key

---

## Documentation Structure (Hybrid: Platform + BMAD Agent)

```
docs/
├── README.md                 # Index principal
├── ROADMAP.md                # Progression projet
├── BUGS.md                   # Bugs connus
│
├── shared/                   # Documents PARTAGES (toutes plateformes)
│   ├── pm/                   # Product Manager (PRD, Epics, Stories)
│   ├── analyst/              # Analyste (Business Rules, Use Cases)
│   ├── architect/            # Architecte (Architecture, ADRs)
│   │   └── adr/              # Architecture Decision Records
│   ├── architect-dev/        # Partage Arch+Dev (API, Data Model, Security)
│   ├── tea/                  # Tests partages (Strategy, Design)
│   ├── bmad/                 # Documentation BMAD
│   └── concepts/             # Concepts futurs
│
├── backend/                  # Documentation BACKEND (Java/Quarkus)
│   └── dev/                  # Guides developpeur backend
│
├── mobile/                   # Documentation MOBILE (React Native/Expo)
│   ├── dev/                  # Guides developpeur mobile
│   ├── ux-designer/          # Specs UI mobile
│   └── tea/                  # Tests mobile
│
├── web/                      # Documentation WEB (React/Vite)
│   ├── ux-designer/          # Specs UI web
│   └── tea/                  # Tests web
│
└── archive/                  # Fichiers archives
```

---

## Last Updated

**Date**: 2026-01-25
**Version**: MVP 1.0 🎉
**Status**: MVP 100% Complete - Ready for Release!

---

## Quick Links

- [Full Documentation Index](docs/README.md)
- [Current Roadmap](docs/ROADMAP.md)
- [Project Context](CONTEXT.md)
- [Architecture Details](docs/shared/architect/)
- [Known Bugs](docs/BUGS.md)
