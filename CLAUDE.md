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
| **[analyst/BUSINESS_RULES.md](docs/analyst/BUSINESS_RULES.md)** | Business logic, workflows, validation | Implementing features |
| **[architect/](docs/architect/)** | Technical architecture, patterns | Designing components |
| **[architect-dev/API_SPECS.md](docs/architect-dev/API_SPECS.md)** | API endpoints documentation | Creating/calling APIs |
| **[architect-dev/DATA_MODEL.md](docs/architect-dev/DATA_MODEL.md)** | Database schema, relations | Working with DB |
| **[BUGS.md](docs/BUGS.md)** | Known issues, workarounds | Encountering problems |

### Additional Guides

- **[dev/GETTING_STARTED.md](docs/dev/GETTING_STARTED.md)** - Development commands and setup
- **[dev/DEPLOYMENT_GUIDE.md](docs/dev/DEPLOYMENT_GUIDE.md)** - Deployment instructions
- **[architect-dev/SECURITY_GUIDE.md](docs/architect-dev/SECURITY_GUIDE.md)** - Security best practices
- **[dev/TROUBLESHOOTING.md](docs/dev/TROUBLESHOOTING.md)** - Common issues and fixes

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

For detailed commands, see [dev/GETTING_STARTED.md](docs/dev/GETTING_STARTED.md)

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

For detailed architecture, see [docs/architect/](docs/architect/)

---

## Typical Workflow for Claude Code

### When Starting a New Task

1. **Read** `docs/ROADMAP.md` - Identify current task
2. **Read** relevant `docs/analyst/BUSINESS_RULES.md` section - Understand domain rules
3. **Read** `docs/architect-dev/DATA_MODEL.md` - Check database schema if needed
4. **Check** `docs/BUGS.md` - Avoid known issues
5. **Implement** the task following existing patterns (use Order domain as reference)
6. **Update** `docs/ROADMAP.md` - Mark task progress in "Notes de Session"

### When Encountering Issues

1. **Check** `docs/BUGS.md` - Is it a known issue?
2. **Check** `docs/dev/TROUBLESHOOTING.md` - Common problems
3. **Check** `CONTEXT.md` - Environment constraints
4. **Report** in `docs/BUGS.md` if new issue

### Before Ending Session

1. **Update** `docs/ROADMAP.md` - Add session notes (what was done, what's next)
2. **Commit** changes with descriptive message
3. **Update** `CONTEXT.md` if architecture/domains changed

---

## Current Project Status (Quick View)

- **Backend APIs**: 95% (User, Restaurant, Menu, Order complete)
- **Web Dashboard**: 90% (needs API integration)
- **Mobile App**: 95% (needs API integration)
- **Authentication JWT**: 30% (documented, not implemented)
- **Tests**: 70% (unit tests OK, integration incomplete)

For detailed status, see [ROADMAP.md](docs/ROADMAP.md)

---

## Known Critical Issues

See [docs/BUGS.md](docs/BUGS.md) for complete list. Critical blockers:

1. **BUG-001**: Frontend using mock data (not connected to real APIs)
2. **BUG-002**: JWT authentication not implemented

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

## Documentation Structure (By BMAD Agent)

```
docs/
├── README.md              # Index principal
├── ROADMAP.md             # Progression projet
├── BUGS.md                # Bugs connus
├── pm/                    # Product Manager (PRD, Epics, Stories)
├── analyst/               # Analyste (Business Rules, Use Cases)
├── architect/             # Architecte (Architecture, ADRs)
│   └── adr/               # Architecture Decision Records
├── architect-dev/         # Partage Arch+Dev (API, Data Model, Security)
├── dev/                   # Developpeur (Guides techniques)
├── ux-designer/           # UX (Specs UI, Theming)
├── tea/                   # Test Architect (Tests Strategy, Plans)
├── bmad/                  # Documentation BMAD
├── concepts/              # Concepts futurs
└── archive/               # Fichiers archives
```

---

## Last Updated

**Date**: 2026-01-20
**Version**: MVP 0.7
**Status**: Documentation reorganized by BMAD agent

---

## Quick Links

- [Full Documentation Index](docs/README.md)
- [Current Roadmap](docs/ROADMAP.md)
- [Project Context](CONTEXT.md)
- [Architecture Details](docs/architect/)
- [Known Bugs](docs/BUGS.md)
