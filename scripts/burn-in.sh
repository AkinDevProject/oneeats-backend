#!/bin/bash
# =============================================================================
# OneEats - Script Burn-in pour Detection de Tests Flaky
# =============================================================================
# Execute les tests plusieurs fois pour detecter les tests instables
# Usage: ./scripts/burn-in.sh [iterations] [test-pattern]
#
# Arguments:
#   iterations    Nombre d'iterations (defaut: 10)
#   test-pattern  Pattern de tests a executer (defaut: tous)
#
# Exemples:
#   ./scripts/burn-in.sh              # 10 iterations, tous les tests
#   ./scripts/burn-in.sh 5            # 5 iterations
#   ./scripts/burn-in.sh 10 "*IT"     # 10 iterations, tests d'integration
#   ./scripts/burn-in.sh 20 "Order*"  # 20 iterations, tests Order*
# =============================================================================

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Parametres
ITERATIONS=${1:-10}
TEST_PATTERN=${2:-""}

echo -e "${BLUE}=========================================="
echo "🔥 OneEats - Burn-in Test Runner"
echo -e "==========================================${NC}"
echo ""
echo "Configuration:"
echo "  - Iterations: $ITERATIONS"
if [ -n "$TEST_PATTERN" ]; then
    echo "  - Pattern: $TEST_PATTERN"
else
    echo "  - Pattern: Tous les tests"
fi
echo ""
echo -e "${YELLOW}Demarrage du burn-in...${NC}"
echo ""

# Construire la commande Maven
MVN_CMD="./mvnw test -B -q"
if [ -n "$TEST_PATTERN" ]; then
    MVN_CMD="$MVN_CMD -Dtest=\"$TEST_PATTERN\""
fi

# Variables de tracking
FAILURES=0
FAILED_ITERATIONS=""
START_TIME=$(date +%s)

# Boucle de burn-in
for i in $(seq 1 $ITERATIONS); do
    ITER_START=$(date +%s)

    echo -ne "${BLUE}🔄 Iteration $i/$ITERATIONS${NC} "

    if eval $MVN_CMD 2>&1 > /tmp/burn-in-$i.log; then
        ITER_END=$(date +%s)
        DURATION=$((ITER_END - ITER_START))
        echo -e "${GREEN}✅ PASSED${NC} (${DURATION}s)"
    else
        ITER_END=$(date +%s)
        DURATION=$((ITER_END - ITER_START))
        echo -e "${RED}❌ FAILED${NC} (${DURATION}s)"
        FAILURES=$((FAILURES + 1))
        FAILED_ITERATIONS="$FAILED_ITERATIONS $i"

        # Sauvegarder le log d'echec
        cp /tmp/burn-in-$i.log "target/burn-in-failure-$i.log" 2>/dev/null || true
    fi
done

END_TIME=$(date +%s)
TOTAL_DURATION=$((END_TIME - START_TIME))

echo ""
echo -e "${BLUE}=========================================="
echo "📊 RESULTATS DU BURN-IN"
echo -e "==========================================${NC}"
echo ""
echo "Resume:"
echo "  - Iterations executees: $ITERATIONS"
echo "  - Reussies: $((ITERATIONS - FAILURES))"
echo "  - Echouees: $FAILURES"
echo "  - Duree totale: ${TOTAL_DURATION}s"
echo "  - Moyenne par iteration: $((TOTAL_DURATION / ITERATIONS))s"
echo ""

if [ $FAILURES -gt 0 ]; then
    echo -e "${RED}🚨 TESTS FLAKY DETECTES!${NC}"
    echo ""
    echo "Iterations echouees:$FAILED_ITERATIONS"
    echo ""
    echo "Les logs d'echec sont disponibles dans:"
    echo "  target/burn-in-failure-*.log"
    echo ""
    echo "Actions recommandees:"
    echo "  1. Examiner les logs d'echec"
    echo "  2. Identifier les tests instables"
    echo "  3. Corriger les causes (race conditions, timeouts, etc.)"
    echo "  4. Re-executer le burn-in"
    echo ""

    # Taux d'echec
    FAILURE_RATE=$((FAILURES * 100 / ITERATIONS))
    echo "Taux d'echec: ${FAILURE_RATE}%"

    if [ $FAILURE_RATE -gt 20 ]; then
        echo -e "${RED}⛔ Taux d'echec critique (>20%)${NC}"
    elif [ $FAILURE_RATE -gt 10 ]; then
        echo -e "${YELLOW}⚠️  Taux d'echec eleve (>10%)${NC}"
    else
        echo -e "${YELLOW}⚠️  Quelques tests instables detectes${NC}"
    fi

    exit 1
else
    echo -e "${GREEN}✅ TOUS LES TESTS SONT STABLES!${NC}"
    echo ""
    echo "Aucun test flaky detecte sur $ITERATIONS iterations."
    echo "Vous pouvez merger en toute confiance! 🚀"
    exit 0
fi
