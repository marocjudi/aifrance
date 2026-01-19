#!/bin/bash

###############################################################################
# Script de mise à jour Mandat.ai
###############################################################################

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_DIR="/var/www/mandat-ai"

echo -e "${BLUE}Mise à jour de Mandat.ai${NC}"

cd $APP_DIR

# Backup
echo "Backup de .env.local..."
cp .env.local .env.local.backup

# Pull des changements (si git)
if [ -d ".git" ]; then
    echo "Pull des derniers changements..."
    git pull
fi

# Installation des dépendances
echo "Installation des dépendances..."
npm install --production

# Build
echo "Build de l'application..."
npm run build

# Redémarrage
echo "Redémarrage de l'application..."
pm2 restart mandat-ai

echo -e "${GREEN}✓ Mise à jour terminée !${NC}"
pm2 status
