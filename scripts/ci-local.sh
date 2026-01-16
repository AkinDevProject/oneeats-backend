#!/bin/bash
# =============================================================================
# OneEats - Script CI Local
# =============================================================================
# Execute la pipeline CI localement pour debugger les problemes
# Usage: ./scripts/ci-local.sh [--skip-integration] [--skip-mobile]
#
# Options:
#   --skip-integration  Ignore les tests d'integration (pas besoin de PostgreSQL)
#   --skip-mobile       Ignore les tests mobile
#   --quick             Mode rapide (lint + unit tests seulement)
# =============================================================================

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Options
SKIP_INTEGRATION=false
SKIP_MOBILE=false
QUICK_MODE=false

for arg in "$@"; do
    case $arg in
        --skip-integration)
            SKIP_INTEGRATION=true
            ;;
        --skip-mobile)
            SKIP_MOBILE=true
            ;;
        --quick)
            QUICK_MODE=true
            ;;
    esac
done

echo -e "${BLUE}=========================================="
echo "🚀 OneEats - Pipeline CI Locale"
echo -e "==========================================${NC}"
echo ""

# ===========================================================================
# STAGE 1: BUILD & LINT
# ===========================================================================

echo -e "${YELLOW}📦 STAGE 1: Build & Lint${NC}"
echo "-------------------------------------------"

# Backend
echo -e "${BLUE}[Backend]${NC} Compilation..."
./mvnw compile -B -DskipTests -q
echo -e "${GREEN}✅ Backend compile${NC}"

# Web App
echo -e "${BLUE}[Web App]${NC} Lint & Build..."
cd apps/web
npm ci --silent
npm run lint
npm run build
cd ../..
echo -e "${GREEN}✅ Web App OK${NC}"

# Mobile
if [ "$SKIP_MOBILE" = false ]; then
    echo -e "${BLUE}[Mobile]${NC} Lint..."
    cd apps/mobile
    npm ci --silent
    npm run lint
    cd ../..
    echo -e "${GREEN}✅ Mobile OK${NC}"
fi

echo ""

# ===========================================================================
# STAGE 2: TESTS UNITAIRES
# ===========================================================================

echo -e "${YELLOW}🧪 STAGE 2: Tests Unitaires${NC}"
echo "-------------------------------------------"

# Backend Unit Tests
echo -e "${BLUE}[Backend]${NC} Tests unitaires (379 tests)..."
./mvnw test -B -Dtest="!*IT" -q
echo -e "${GREEN}✅ Backend: Tous les tests unitaires passent${NC}"

# Mobile Unit Tests
if [ "$SKIP_MOBILE" = false ]; then
    echo -e "${BLUE}[Mobile]${NC} Tests unitaires..."
    cd apps/mobile
    npm run test:ci 2>/dev/null || npm test
    cd ../..
    echo -e "${GREEN}✅ Mobile: Tests unitaires OK${NC}"
fi

echo ""

if [ "$QUICK_MODE" = true ]; then
    echo -e "${GREEN}=========================================="
    echo "✅ MODE RAPIDE: Pipeline terminee!"
    echo -e "==========================================${NC}"
    exit 0
fi

# ===========================================================================
# STAGE 3: TESTS D'INTEGRATION
# ===========================================================================

if [ "$SKIP_INTEGRATION" = false ]; then
    echo -e "${YELLOW}🔗 STAGE 3: Tests d'Integration${NC}"
    echo "-------------------------------------------"

    # Verifier si PostgreSQL est disponible
    if ! pg_isready -h localhost -p 5433 -U oneeats_test_user 2>/dev/null; then
        echo -e "${YELLOW}⚠️  PostgreSQL non disponible sur le port 5433${NC}"
        echo "   Demarrez la base de test avec: docker-compose up -d postgres-test"
        echo "   Ou utilisez --skip-integration pour ignorer"
        exit 1
    fi

    echo -e "${BLUE}[Backend]${NC} Tests d'integration (33 tests)..."
    ./mvnw test -B -Dtest="*IT" -q
    echo -e "${GREEN}✅ Backend: Tous les tests d'integration passent${NC}"

    echo ""
fi

# ===========================================================================
# STAGE 4: BURN-IN (Reduit)
# ===========================================================================

echo -e "${YELLOW}🔥 STAGE 4: Burn-in (3 iterations)${NC}"
echo "-------------------------------------------"

FAILURES=0
for i in {1..3}; do
    echo -e "${BLUE}Iteration $i/3...${NC}"
    if ! ./mvnw test -B -q 2>&1; then
        FAILURES=$((FAILURES + 1))
        echo -e "${RED}❌ Iteration $i FAILED${NC}"
    else
        echo -e "${GREEN}✅ Iteration $i OK${NC}"
    fi
done

echo ""

if [ $FAILURES -gt 0 ]; then
    echo -e "${RED}=========================================="
    echo "🚨 ATTENTION: $FAILURES test(s) instable(s) detecte(s)!"
    echo -e "==========================================${NC}"
    exit 1
fi

# ===========================================================================
# RESULTAT FINAL
# ===========================================================================

echo -e "${GREEN}=========================================="
echo "✅ Pipeline CI locale terminee avec succes!"
echo "==========================================${NC}"
echo ""
echo "Resultats:"
echo "  - Backend Build:       ✅"
echo "  - Backend Unit Tests:  ✅ (379 tests)"
if [ "$SKIP_INTEGRATION" = false ]; then
    echo "  - Backend Integration: ✅ (33 tests)"
fi
if [ "$SKIP_MOBILE" = false ]; then
    echo "  - Mobile Lint:         ✅"
    echo "  - Mobile Unit Tests:   ✅"
fi
echo "  - Burn-in (3x):        ✅"
echo ""
echo "Vous pouvez maintenant pusher vos changements en toute confiance! 🚀"
