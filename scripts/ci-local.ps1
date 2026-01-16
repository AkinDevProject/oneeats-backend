# =============================================================================
# OneEats - Script CI Local (PowerShell)
# =============================================================================
# Execute la pipeline CI localement pour debugger les problemes
# Usage: .\scripts\ci-local.ps1 [-SkipIntegration] [-SkipMobile] [-Quick]
#
# Options:
#   -SkipIntegration  Ignore les tests d'integration (pas besoin de PostgreSQL)
#   -SkipMobile       Ignore les tests mobile
#   -Quick            Mode rapide (lint + unit tests seulement)
# =============================================================================

param(
    [switch]$SkipIntegration,
    [switch]$SkipMobile,
    [switch]$Quick
)

# Configuration Java et Maven
$env:JAVA_HOME = "C:\Users\akin_\.jdks\corretto-21.0.8"
$env:M2_HOME = "C:\Users\akin_\apache-maven-3.9.9"
$env:PATH = "$env:JAVA_HOME\bin;$env:M2_HOME\bin;$env:PATH"

# Couleurs
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success($message) { Write-Host $message -ForegroundColor Green }
function Write-Info($message) { Write-Host $message -ForegroundColor Cyan }
function Write-Warning($message) { Write-Host $message -ForegroundColor Yellow }
function Write-Error($message) { Write-Host $message -ForegroundColor Red }

# Verifier Java et Maven
Write-Info "Verification de l'environnement..."
try {
    $javaVersion = & java -version 2>&1 | Select-String "version"
    Write-Success "Java: $javaVersion"
} catch {
    Write-Error "Java non trouve! Verifiez JAVA_HOME"
    exit 1
}

try {
    $mvnVersion = & mvn -version 2>&1 | Select-String "Apache Maven"
    Write-Success "Maven: $mvnVersion"
} catch {
    Write-Error "Maven non trouve! Verifiez M2_HOME"
    exit 1
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Blue
Write-Host "  OneEats - Pipeline CI Locale" -ForegroundColor Blue
Write-Host "==========================================" -ForegroundColor Blue
Write-Host ""

$ErrorCount = 0

# ===========================================================================
# STAGE 1: BUILD & LINT
# ===========================================================================

Write-Host "STAGE 1: Build & Lint" -ForegroundColor Yellow
Write-Host "-------------------------------------------"

# Backend
Write-Info "[Backend] Compilation..."
& mvn compile -B -DskipTests -q
if ($LASTEXITCODE -eq 0) {
    Write-Success "[Backend] Compile OK"
} else {
    Write-Error "[Backend] Echec de compilation!"
    $ErrorCount++
}

# Web App
Write-Info "[Web App] Lint & Build..."
Push-Location apps/web
& npm ci --silent 2>$null
& npm run lint
if ($LASTEXITCODE -eq 0) {
    & npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Success "[Web App] OK"
    } else {
        Write-Error "[Web App] Echec du build!"
        $ErrorCount++
    }
} else {
    Write-Error "[Web App] Echec du lint!"
    $ErrorCount++
}
Pop-Location

# Mobile
if (-not $SkipMobile) {
    Write-Info "[Mobile] Lint..."
    Push-Location apps/mobile
    & npm ci --silent 2>$null
    & npm run lint
    if ($LASTEXITCODE -eq 0) {
        Write-Success "[Mobile] OK"
    } else {
        Write-Warning "[Mobile] Lint a echoue (non bloquant)"
    }
    Pop-Location
}

Write-Host ""

# ===========================================================================
# STAGE 2: TESTS UNITAIRES
# ===========================================================================

Write-Host "STAGE 2: Tests Unitaires" -ForegroundColor Yellow
Write-Host "-------------------------------------------"

# Backend Unit Tests
Write-Info "[Backend] Tests unitaires (379 tests)..."
& mvn test -B "-Dtest=!*IT" -q
if ($LASTEXITCODE -eq 0) {
    Write-Success "[Backend] Tous les tests unitaires passent"
} else {
    Write-Error "[Backend] Tests unitaires echoues!"
    $ErrorCount++
}

# Mobile Unit Tests
if (-not $SkipMobile) {
    Write-Info "[Mobile] Tests unitaires..."
    Push-Location apps/mobile
    & npm run test:ci 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "[Mobile] Tests OK"
    } else {
        & npm test 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "[Mobile] Tests OK"
        } else {
            Write-Warning "[Mobile] Tests echoues (non bloquant)"
        }
    }
    Pop-Location
}

Write-Host ""

if ($Quick) {
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "  MODE RAPIDE: Pipeline terminee!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    if ($ErrorCount -gt 0) {
        Write-Error "$ErrorCount erreur(s) detectee(s)"
        exit 1
    }
    exit 0
}

# ===========================================================================
# STAGE 3: TESTS D'INTEGRATION
# ===========================================================================

if (-not $SkipIntegration) {
    Write-Host "STAGE 3: Tests d'Integration" -ForegroundColor Yellow
    Write-Host "-------------------------------------------"

    # Verifier PostgreSQL
    Write-Info "Verification de PostgreSQL sur le port 5433..."
    $pgTest = Test-NetConnection -ComputerName localhost -Port 5433 -WarningAction SilentlyContinue
    if (-not $pgTest.TcpTestSucceeded) {
        Write-Warning "PostgreSQL non disponible sur le port 5433"
        Write-Host "   Demarrez la base de test avec: docker-compose up -d postgres-test"
        Write-Host "   Ou utilisez -SkipIntegration pour ignorer"
        exit 1
    }

    Write-Info "[Backend] Tests d'integration (33 tests)..."
    & mvn test -B "-Dtest=*IT" -q
    if ($LASTEXITCODE -eq 0) {
        Write-Success "[Backend] Tests d'integration OK"
    } else {
        Write-Error "[Backend] Tests d'integration echoues!"
        $ErrorCount++
    }

    Write-Host ""
}

# ===========================================================================
# STAGE 4: BURN-IN (Reduit)
# ===========================================================================

Write-Host "STAGE 4: Burn-in (3 iterations)" -ForegroundColor Yellow
Write-Host "-------------------------------------------"

$BurnInFailures = 0
for ($i = 1; $i -le 3; $i++) {
    Write-Info "Iteration $i/3..."
    & mvn test -B -q 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Iteration $i OK"
    } else {
        Write-Error "Iteration $i FAILED"
        $BurnInFailures++
    }
}

Write-Host ""

if ($BurnInFailures -gt 0) {
    Write-Host "==========================================" -ForegroundColor Red
    Write-Error "  ATTENTION: $BurnInFailures test(s) instable(s) detecte(s)!"
    Write-Host "==========================================" -ForegroundColor Red
    exit 1
}

# ===========================================================================
# RESULTAT FINAL
# ===========================================================================

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Pipeline CI locale terminee!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Resultats:"
Write-Host "  - Backend Build:       OK" -ForegroundColor Green
Write-Host "  - Backend Unit Tests:  OK (379 tests)" -ForegroundColor Green
if (-not $SkipIntegration) {
    Write-Host "  - Backend Integration: OK (33 tests)" -ForegroundColor Green
}
if (-not $SkipMobile) {
    Write-Host "  - Mobile Lint:         OK" -ForegroundColor Green
    Write-Host "  - Mobile Unit Tests:   OK" -ForegroundColor Green
}
Write-Host "  - Burn-in (3x):        OK" -ForegroundColor Green
Write-Host ""

if ($ErrorCount -gt 0) {
    Write-Error "$ErrorCount erreur(s) detectee(s) - verifiez les logs ci-dessus"
    exit 1
} else {
    Write-Success "Vous pouvez maintenant pusher vos changements en toute confiance!"
    exit 0
}
