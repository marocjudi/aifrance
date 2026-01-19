@echo off
echo ========================================
echo    MANDAT.AI - Serveur de Dev
echo ========================================
echo.

if not exist "node_modules" (
    echo Les dependances ne sont pas installees.
    echo Execution de: npm install
    echo.
    call npm install
    echo.
)

if not exist ".env.local" (
    if exist "env.example" (
        echo Creation de .env.local...
        copy env.example .env.local
        echo.
        echo IMPORTANT: Configurez vos cles API dans .env.local
        echo.
    )
)

echo Demarrage du serveur...
echo.
echo ========================================
echo    Serveur pret!
echo ========================================
echo.
echo Pages disponibles:
echo   Landing Page:     http://localhost:3000/landing
echo   Dashboard:        http://localhost:3000
echo   Command Center:   http://localhost:3000/admin
echo   Coffre-fort:      http://localhost:3000/vault
echo.
echo Pour arreter: Ctrl+C
echo.

call npm run dev
