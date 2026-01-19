#!/bin/bash

###############################################################################
# MANDAT.AI - Installation Automatique VPS Linux
# Compatible: Ubuntu 20.04+, Debian 11+
###############################################################################

set -e  # Arrêt en cas d'erreur

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="mandat-ai"
APP_DIR="/var/www/mandat-ai"
NODE_VERSION="20"
DOMAIN="${DOMAIN:-localhost}"  # Changez par votre domaine
PORT="${PORT:-3000}"

###############################################################################
# Fonctions utilitaires
###############################################################################

print_header() {
    echo -e "${BLUE}"
    echo "=========================================="
    echo "  $1"
    echo "=========================================="
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

###############################################################################
# Vérifications préliminaires
###############################################################################

check_root() {
    if [ "$EUID" -ne 0 ]; then 
        print_error "Ce script doit être exécuté en tant que root (sudo)"
        exit 1
    fi
}

check_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        VER=$VERSION_ID
        print_success "OS détecté: $OS $VER"
    else
        print_error "OS non supporté"
        exit 1
    fi
}

###############################################################################
# Installation des dépendances système
###############################################################################

install_system_dependencies() {
    print_header "Installation des dépendances système"
    
    apt-get update
    apt-get install -y \
        curl \
        wget \
        git \
        build-essential \
        nginx \
        certbot \
        python3-certbot-nginx \
        ufw \
        fail2ban
    
    print_success "Dépendances système installées"
}

###############################################################################
# Installation de Node.js
###############################################################################

install_nodejs() {
    print_header "Installation de Node.js $NODE_VERSION"
    
    # Vérifier si Node.js est déjà installé
    if command -v node &> /dev/null; then
        CURRENT_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$CURRENT_VERSION" -ge "$NODE_VERSION" ]; then
            print_success "Node.js $CURRENT_VERSION déjà installé"
            return
        fi
    fi
    
    # Installation via NodeSource
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs
    
    # Vérification
    node -v
    npm -v
    
    print_success "Node.js installé: $(node -v)"
}

###############################################################################
# Installation de PM2
###############################################################################

install_pm2() {
    print_header "Installation de PM2"
    
    npm install -g pm2
    pm2 startup systemd -u root --hp /root
    
    print_success "PM2 installé"
}

###############################################################################
# Configuration du pare-feu
###############################################################################

configure_firewall() {
    print_header "Configuration du pare-feu"
    
    # Activer UFW
    ufw --force enable
    
    # Autoriser SSH, HTTP, HTTPS
    ufw allow ssh
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    print_success "Pare-feu configuré"
}

###############################################################################
# Création de l'utilisateur applicatif
###############################################################################

create_app_user() {
    print_header "Création de l'utilisateur applicatif"
    
    if id "mandat" &>/dev/null; then
        print_warning "L'utilisateur 'mandat' existe déjà"
    else
        useradd -r -s /bin/bash -d /home/mandat -m mandat
        print_success "Utilisateur 'mandat' créé"
    fi
}

###############################################################################
# Installation de l'application
###############################################################################

install_application() {
    print_header "Installation de Mandat.ai"
    
    # Créer le répertoire
    mkdir -p $APP_DIR
    
    # Copier les fichiers (si script exécuté depuis le repo)
    if [ -f "package.json" ]; then
        cp -r . $APP_DIR/
        print_success "Fichiers copiés depuis le répertoire local"
    else
        print_warning "Clonez manuellement le dépôt dans $APP_DIR"
        print_warning "Ou placez les fichiers de l'application dans ce dossier"
    fi
    
    cd $APP_DIR
    
    # Installer les dépendances
    npm install --production
    
    # Build de production
    npm run build
    
    # Permissions
    chown -R mandat:mandat $APP_DIR
    
    print_success "Application installée"
}

###############################################################################
# Configuration Nginx
###############################################################################

configure_nginx() {
    print_header "Configuration de Nginx"
    
    # Supprimer la config par défaut
    rm -f /etc/nginx/sites-enabled/default
    
    # Créer la configuration
    cat > /etc/nginx/sites-available/mandat-ai << 'EOF'
upstream mandat_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER;

    # Logs
    access_log /var/log/nginx/mandat-ai-access.log;
    error_log /var/log/nginx/mandat-ai-error.log;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Client max body size (pour upload de documents)
    client_max_body_size 10M;

    location / {
        proxy_pass http://mandat_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache statique
    location /_next/static/ {
        proxy_pass http://mandat_backend;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
EOF

    # Remplacer le placeholder du domaine
    sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" /etc/nginx/sites-available/mandat-ai
    
    # Activer la configuration
    ln -sf /etc/nginx/sites-available/mandat-ai /etc/nginx/sites-enabled/
    
    # Tester la configuration
    nginx -t
    
    # Redémarrer Nginx
    systemctl restart nginx
    systemctl enable nginx
    
    print_success "Nginx configuré"
}

###############################################################################
# Configuration PM2
###############################################################################

configure_pm2() {
    print_header "Configuration de PM2"
    
    cd $APP_DIR
    
    # Créer le fichier ecosystem
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'mandat-ai',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/mandat-ai',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/mandat-ai-error.log',
    out_file: '/var/log/pm2/mandat-ai-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
    autorestart: true,
    watch: false
  }]
}
EOF
    
    # Créer le répertoire de logs
    mkdir -p /var/log/pm2
    chown -R mandat:mandat /var/log/pm2
    
    # Démarrer l'application
    pm2 start ecosystem.config.js
    pm2 save
    
    print_success "PM2 configuré et application démarrée"
}

###############################################################################
# SSL avec Let's Encrypt
###############################################################################

configure_ssl() {
    print_header "Configuration SSL"
    
    if [ "$DOMAIN" = "localhost" ]; then
        print_warning "Domaine = localhost, SSL ignoré"
        print_warning "Configurez un vrai domaine pour activer HTTPS"
        return
    fi
    
    print_warning "Assurez-vous que votre domaine $DOMAIN pointe vers ce serveur"
    read -p "Continuer avec l'installation SSL ? (y/n) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
        print_success "SSL configuré avec Let's Encrypt"
        
        # Renouvellement automatique
        (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet") | crontab -
        print_success "Renouvellement SSL automatique configuré"
    fi
}

###############################################################################
# Configuration de l'environnement
###############################################################################

configure_environment() {
    print_header "Configuration de l'environnement"
    
    if [ ! -f "$APP_DIR/.env.local" ]; then
        if [ -f "$APP_DIR/env.example" ]; then
            cp $APP_DIR/env.example $APP_DIR/.env.local
            print_success "Fichier .env.local créé depuis env.example"
            print_warning "⚠️  IMPORTANT: Configurez vos clés API dans $APP_DIR/.env.local"
            print_warning "   - NEXT_PUBLIC_SUPABASE_URL"
            print_warning "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
            print_warning "   - ANTHROPIC_API_KEY"
            print_warning "   - YOUSIGN_API_KEY (optionnel)"
        else
            print_warning "Créez manuellement le fichier .env.local"
        fi
    else
        print_success ".env.local existe déjà"
    fi
    
    chown mandat:mandat $APP_DIR/.env.local 2>/dev/null || true
}

###############################################################################
# Script principal
###############################################################################

main() {
    clear
    print_header "INSTALLATION DE MANDAT.AI"
    
    echo -e "${YELLOW}"
    echo "Ce script va installer:"
    echo "  • Node.js $NODE_VERSION"
    echo "  • Nginx"
    echo "  • PM2"
    echo "  • Mandat.ai"
    echo "  • SSL (Let's Encrypt) - optionnel"
    echo ""
    echo "Domaine: $DOMAIN"
    echo "Port: $PORT"
    echo -e "${NC}"
    
    read -p "Continuer ? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
    
    check_root
    check_os
    install_system_dependencies
    install_nodejs
    install_pm2
    configure_firewall
    create_app_user
    install_application
    configure_environment
    configure_nginx
    configure_pm2
    configure_ssl
    
    print_header "Installation terminée !"
    
    echo -e "${GREEN}"
    echo "✓ Mandat.ai est maintenant installé et en cours d'exécution"
    echo ""
    echo "Accès:"
    if [ "$DOMAIN" = "localhost" ]; then
        echo "  • http://$(hostname -I | awk '{print $1}')"
    else
        echo "  • https://$DOMAIN"
    fi
    echo ""
    echo "Commandes utiles:"
    echo "  • pm2 status              - Voir l'état de l'application"
    echo "  • pm2 logs mandat-ai      - Voir les logs"
    echo "  • pm2 restart mandat-ai   - Redémarrer"
    echo "  • pm2 stop mandat-ai      - Arrêter"
    echo "  • nginx -t                - Tester la config Nginx"
    echo "  • systemctl status nginx  - État de Nginx"
    echo ""
    echo "Configuration:"
    echo "  • App: $APP_DIR"
    echo "  • Nginx: /etc/nginx/sites-available/mandat-ai"
    echo "  • Logs: /var/log/pm2/"
    echo "  • Env: $APP_DIR/.env.local"
    echo ""
    echo -e "${YELLOW}⚠️  N'oubliez pas de configurer .env.local !${NC}"
    echo ""
}

# Lancement
main "$@"
