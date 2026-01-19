# Mandat.ai - SaaS Agent Mandataire (Version Souveraine 2026)

## Description

**Mandat.ai** est un SaaS innovant qui agit comme agent mandataire pour gérer l'administration française de l'utilisateur, sans passer par FranceConnect. L'agent analyse automatiquement les documents administratifs, détecte les urgences et peut exécuter des actions automatiques sur les portails officiels (Impôts, Ameli, CAF) après signature d'un mandat légal.

## Stack Technique

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, PostgreSQL, Storage)
- **IA**: Claude 3.5 Sonnet (Anthropic API) pour l'analyse juridique
- **Automation**: Playwright pour la navigation web automatisée
- **Signature**: Yousign pour les mandats de représentation légale
- **Sécurité**: Chiffrement AES-256-GCM, Row Level Security (RLS)

## Architecture

```
mandat/
├── app/
│   ├── api/
│   │   ├── analyze/          # Analyse IA des documents
│   │   ├── documents/        # Upload et gestion documents
│   │   ├── activities/       # Flux d'activité
│   │   ├── mandates/         # Création de mandats
│   │   ├── tasks/execute/    # Exécution des tâches Playwright
│   │   └── webhooks/yousign/ # Callback Yousign
│   ├── vault/                # Coffre-fort sécurisé
│   ├── layout.tsx
│   ├── page.tsx              # Dashboard principal
│   └── globals.css
├── components/
│   ├── dashboard/            # Composants du dashboard
│   └── vault/                # Composants du coffre-fort
├── lib/
│   ├── ai/claude.ts          # Configuration Claude + System Prompt
│   ├── agent/playwright-agent.ts  # Agent de navigation
│   ├── supabase/             # Clients Supabase
│   ├── types.ts              # Types TypeScript
│   └── utils.ts              # Utilitaires
├── supabase/
│   └── schema.sql            # Schéma de base de données
└── package.json
```

## Installation

### Prérequis

- Node.js 20+
- Compte Supabase
- Clé API Anthropic (Claude)
- Compte Yousign (optionnel en dev)

### Étapes

1. **Cloner et installer les dépendances** :
```powershell
npm install
```

2. **Configurer les variables d'environnement** :

Copier `env.example` vers `.env.local` et remplir :

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key

ANTHROPIC_API_KEY=votre_cle_anthropic

YOUSIGN_API_KEY=votre_cle_yousign
YOUSIGN_WEBHOOK_SECRET=votre_secret_webhook

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Créer la base de données Supabase** :

Exécuter le fichier `supabase/schema.sql` dans l'éditeur SQL de Supabase.

4. **Configurer le bucket Storage** :

Créer un bucket nommé `documents` dans Supabase Storage avec les permissions appropriées.

5. **Lancer le serveur de développement** :

```powershell
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## Fonctionnalités Principales

### 1. Dashboard "Sérénité"
- Vue d'ensemble des documents
- Indicateurs d'urgence
- Tâches actives de l'agent
- Score de sérénité

### 2. Analyse Intelligente de Documents
- Upload de PDF, images
- OCR automatique
- Analyse juridique par Claude 3.5 Sonnet
- Détection d'urgence et de dates limites
- Identification d'aides non sollicitées

### 3. Coffre-Fort Sécurisé
- Stockage chiffré des documents administratifs
- Gestion des identifiants pour portails
- Suivi de validité des documents
- Chiffrement AES-256-GCM

### 4. Mandat de Représentation
- Génération du texte légal (Article 1984 Code Civil)
- Signature électronique via Yousign
- Révocation à tout moment
- Scope personnalisable (sites autorisés)

### 5. Agent de Navigation Automatique
- Connexion aux portails (Impôts, Ameli, CAF)
- Remplissage automatique de formulaires
- Téléchargement de documents
- Capture d'écran et logs d'exécution
- Retry automatique en cas d'échec

### 6. Flux d'Activité
- Timeline des actions de l'agent
- Notifications temps réel
- Historique complet

## System Prompt de l'IA

L'agent IA (Claude 3.5 Sonnet) suit un protocole strict défini dans `lib/ai/claude.ts` :

1. **Déchiffrement** : Identifier l'émetteur, l'urgence et traduire le jargon
2. **Détection d'opportunités** : Aides non sollicitées, droit à l'erreur
3. **Analyse d'urgence** : Classification CRITICAL / HIGH / MEDIUM / LOW
4. **Plan d'action** : JSON structuré avec les étapes à suivre

## Bases Légales

- **Article 1984 du Code Civil** : Mandat de représentation
- **Loi ESSOC 2018** : Droit à l'erreur
- **RGPD** : Protection des données personnelles

## Sécurité

- Chiffrement AES-256-GCM pour les données sensibles
- Row Level Security (RLS) sur toutes les tables
- Authentification Supabase
- Validation des webhooks Yousign
- Sandboxing Playwright
- Aucun stockage de clé maître

## Développement

### Commandes

```powershell
npm run dev      # Développement
npm run build    # Build production
npm run start    # Serveur production
npm run lint     # Lint
```

### Tests

Les tests seront ajoutés prochainement (Playwright Tests, Jest).

## Déploiement

Recommandé : Vercel (Next.js) + Supabase Cloud

1. Connecter le repo GitHub à Vercel
2. Configurer les variables d'environnement
3. Déployer

## Roadmap

- [ ] Interface de login/signup
- [ ] API OCR avancée (Tesseract.js)
- [ ] Support de plus de portails (Pôle Emploi, Service-Public)
- [ ] Notifications par email/SMS
- [ ] Mode sombre
- [ ] Application mobile (React Native)
- [ ] Tests E2E complets
- [ ] Documentation API complète

## Licence

Propriétaire - Mandat.ai © 2026

## Contact

Pour toute question : contact@mandat.ai
