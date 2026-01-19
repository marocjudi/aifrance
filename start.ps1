# Script de démarrage Mandat.ai
# PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   MANDAT.AI - Démarrage Local" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier Node.js
Write-Host "[1/4] Vérification de Node.js..." -ForegroundColor Yellow
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERREUR: Node.js n'est pas installé!" -ForegroundColor Red
    Write-Host "Téléchargez-le sur https://nodejs.org" -ForegroundColor Red
    exit 1
}

$nodeVersion = node --version
Write-Host "✓ Node.js détecté: $nodeVersion" -ForegroundColor Green
Write-Host ""

# Vérifier npm
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "ERREUR: npm n'est pas installé!" -ForegroundColor Red
    exit 1
}

$npmVersion = npm --version
Write-Host "✓ npm détecté: $npmVersion" -ForegroundColor Green
Write-Host ""

# Installation des dépendances
Write-Host "[2/4] Installation des dépendances..." -ForegroundColor Yellow
Write-Host "Cela peut prendre quelques minutes..." -ForegroundColor Gray

if (Test-Path "node_modules") {
    Write-Host "✓ node_modules existe déjà" -ForegroundColor Green
} else {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERREUR: Échec de l'installation des dépendances" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Dépendances installées avec succès" -ForegroundColor Green
}
Write-Host ""

# Vérifier les variables d'environnement
Write-Host "[3/4] Vérification de la configuration..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "✓ Fichier .env.local trouvé" -ForegroundColor Green
} else {
    Write-Host "⚠ Fichier .env.local introuvable" -ForegroundColor Yellow
    Write-Host "Copie du fichier d'exemple..." -ForegroundColor Gray
    if (Test-Path "env.example") {
        Copy-Item "env.example" ".env.local"
        Write-Host "✓ Fichier .env.local créé" -ForegroundColor Green
        Write-Host "" 
        Write-Host "IMPORTANT: Configurez vos clés API dans .env.local" -ForegroundColor Yellow
        Write-Host "- NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Cyan
        Write-Host "- NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Cyan
        Write-Host "- ANTHROPIC_API_KEY" -ForegroundColor Cyan
        Write-Host ""
    }
}
Write-Host ""

# Lancer le serveur de développement
Write-Host "[4/4] Démarrage du serveur de développement..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Serveur prêt!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Pages disponibles:" -ForegroundColor Cyan
Write-Host "  • Landing Page:     http://localhost:3000/landing" -ForegroundColor White
Write-Host "  • Dashboard:        http://localhost:3000" -ForegroundColor White
Write-Host "  • Command Center:   http://localhost:3000/admin" -ForegroundColor White
Write-Host "  • Coffre-fort:      http://localhost:3000/vault" -ForegroundColor White
Write-Host ""
Write-Host "Pour arrêter le serveur: Ctrl+C" -ForegroundColor Gray
Write-Host ""

npm run dev
