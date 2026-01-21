# Script d'installation de Maestro pour Windows
# Usage: powershell -ExecutionPolicy Bypass -File install-maestro.ps1

Write-Host "=== Installation de Maestro ===" -ForegroundColor Cyan

# Configuration TLS
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Dossier d'installation
$maestroHome = "$env:USERPROFILE\.maestro"
$maestroBin = "$maestroHome\bin"

# Creer les dossiers
Write-Host "Creation des dossiers..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $maestroHome | Out-Null
New-Item -ItemType Directory -Force -Path $maestroBin | Out-Null

# Obtenir la derniere version
Write-Host "Recuperation de la derniere version..." -ForegroundColor Yellow
try {
    $releaseInfo = Invoke-RestMethod -Uri "https://api.github.com/repos/mobile-dev-inc/maestro/releases/latest"
    $latestVersion = $releaseInfo.tag_name
    Write-Host "Version trouvee: $latestVersion" -ForegroundColor Green
} catch {
    Write-Host "Erreur lors de la recuperation de la version. Utilisation de la version par defaut." -ForegroundColor Red
    $latestVersion = "cli-1.39.13"
}

# URL de telechargement
$downloadUrl = "https://github.com/mobile-dev-inc/maestro/releases/download/$latestVersion/maestro.zip"
$zipPath = "$maestroHome\maestro.zip"

# Telecharger
Write-Host "Telechargement de Maestro depuis $downloadUrl..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $zipPath -UseBasicParsing
    Write-Host "Telechargement termine!" -ForegroundColor Green
} catch {
    Write-Host "Erreur de telechargement: $_" -ForegroundColor Red
    exit 1
}

# Extraire
Write-Host "Extraction de l'archive..." -ForegroundColor Yellow
try {
    # Supprimer l'ancienne installation si elle existe
    if (Test-Path "$maestroBin\maestro") {
        Remove-Item -Recurse -Force "$maestroBin\maestro"
    }

    Expand-Archive -Path $zipPath -DestinationPath $maestroBin -Force
    Write-Host "Extraction terminee!" -ForegroundColor Green
} catch {
    Write-Host "Erreur d'extraction: $_" -ForegroundColor Red
    exit 1
}

# Nettoyer
Remove-Item -Force $zipPath -ErrorAction SilentlyContinue

# Verifier la structure
$maestroExe = "$maestroBin\maestro\bin\maestro.bat"
if (-not (Test-Path $maestroExe)) {
    $maestroExe = "$maestroBin\maestro\bin\maestro"
}

if (Test-Path $maestroExe) {
    Write-Host "Maestro installe avec succes!" -ForegroundColor Green
} else {
    Write-Host "Erreur: fichier executable non trouve" -ForegroundColor Red
    Write-Host "Contenu de $maestroBin :" -ForegroundColor Yellow
    Get-ChildItem -Recurse $maestroBin | Select-Object FullName
    exit 1
}

# Ajouter au PATH (session courante)
$maestroPath = "$maestroBin\maestro\bin"
$env:PATH = "$maestroPath;$env:PATH"

# Ajouter au PATH (permanent pour l'utilisateur)
Write-Host "Ajout au PATH..." -ForegroundColor Yellow
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if ($currentPath -notlike "*$maestroPath*") {
    [Environment]::SetEnvironmentVariable("PATH", "$maestroPath;$currentPath", "User")
    Write-Host "PATH mis a jour!" -ForegroundColor Green
} else {
    Write-Host "PATH deja configure." -ForegroundColor Green
}

# Verifier l'installation
Write-Host "`n=== Verification de l'installation ===" -ForegroundColor Cyan
try {
    & "$maestroPath\maestro.bat" --version
    Write-Host "`nMaestro est pret a etre utilise!" -ForegroundColor Green
    Write-Host "Redemarrez votre terminal pour que les changements de PATH prennent effet." -ForegroundColor Yellow
} catch {
    Write-Host "Erreur lors de la verification: $_" -ForegroundColor Red
}

Write-Host "`n=== Instructions ===" -ForegroundColor Cyan
Write-Host "1. Fermez et rouvrez votre terminal"
Write-Host "2. Executez: maestro --version"
Write-Host "3. Pour lancer les tests: cd apps/mobile && maestro test .maestro/flows/"
