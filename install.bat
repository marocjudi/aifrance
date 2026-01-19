@echo off
echo ========================================
echo    MANDAT.AI - Installation
echo ========================================
echo.

echo Installation des dependances npm...
call npm install

if %errorlevel% neq 0 (
    echo.
    echo ERREUR: Echec de l'installation
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Installation terminee!
echo ========================================
echo.
echo Pour demarrer le serveur:
echo   npm run dev
echo.
echo Ou utilisez: start-dev.bat
echo.
pause
