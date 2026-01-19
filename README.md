# 🚀 GUIDE DE DÉMARRAGE RAPIDE

## ⚡ Installation et Lancement (Windows)

### Option 1: Scripts Batch (Recommandé pour Windows)

```cmd
# 1. Installer les dépendances
install.bat

# 2. Lancer le serveur
start-dev.bat
```

### Option 2: Ligne de commande

```cmd
# 1. Installer
npm install

# 2. Configurer (optionnel pour la landing page)
copy env.example .env.local

# 3. Lancer
npm run dev
```

### Option 3: PowerShell (nécessite autorisation)

Si vous voulez utiliser PowerShell, autorisez d'abord l'exécution :

```powershell
# En tant qu'administrateur:
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# Puis:
.\start.ps1
```

---

## 🌐 Accès aux Pages

Une fois `npm run dev` lancé, ouvrez votre navigateur :

### 🎨 Landing Page (Fonctionne sans config)
```
http://localhost:3000/landing
```
✅ Aucune configuration requise !

### 📊 Dashboard (Nécessite Supabase)
```
http://localhost:3000
```
⚙️ Configurez d'abord `.env.local` avec vos clés Supabase

### 👨‍💼 Command Center Admin
```
http://localhost:3000/admin
```
🔐 Nécessite un compte admin dans Supabase

### 🔒 Coffre-fort
```
http://localhost:3000/vault
```
🔐 Nécessite authentification

---

## 📝 Configuration Minimale

Pour tester uniquement la **Landing Page** :

1. Lancez directement :
```cmd
npm install
npm run dev
```

2. Ouvrez : http://localhost:3000/landing

**C'est tout ! Aucune clé API requise pour la landing.**

---

## ⚙️ Configuration Complète (Dashboard + Admin)

### 1. Créer `.env.local`

```cmd
copy env.example .env.local
```

### 2. Ajouter vos clés dans `.env.local`

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Claude AI
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Configurer Supabase

Dans [supabase.com](https://supabase.com) :

1. **Créer un projet**
2. **SQL Editor** → Exécuter `supabase/schema.sql`
3. **Storage** → Créer bucket `documents`
4. **Settings → API** → Copier les clés dans `.env.local`

---

## 🎯 Commandes Utiles

```cmd
# Installation
npm install

# Développement
npm run dev

# Build production
npm run build

# Serveur production
npm start

# Lint
npm run lint
```

---

## 🐛 Résolution de Problèmes

### Port 3000 déjà utilisé ?

```cmd
# Windows
set PORT=3001
npm run dev
```

### node_modules corrompu ?

```cmd
rmdir /s /q node_modules
npm install
```

### Erreur de dépendances ?

```cmd
npm cache clean --force
npm install
```

---

## 📦 Structure du Projet

```
mandat/
├── app/
│   ├── landing/          → Landing page ✨
│   ├── admin/            → Command Center 👨‍💼
│   ├── vault/            → Coffre-fort 🔒
│   └── api/              → API routes
├── components/
│   ├── landing/          → Composants landing
│   ├── admin/            → Composants admin
│   ├── dashboard/        → Composants dashboard
│   └── vault/            → Composants coffre-fort
├── lib/
│   ├── supabase/         → Clients Supabase
│   ├── ai/               → Claude AI
│   └── agent/            → Playwright agent
└── supabase/
    ├── schema.sql        → Schéma principal
    └── admin-schema.sql  → Schéma admin
```

---

## 🎨 Voir la Landing Page Immédiatement

**Pas besoin de configuration !**

```cmd
npm install
npm run dev
```

Puis ouvrez : **http://localhost:3000/landing**

---

## ✅ Checklist de Vérification

- [ ] Node.js installé (v20+)
- [ ] `npm install` exécuté avec succès
- [ ] Serveur lancé (`npm run dev`)
- [ ] Landing page accessible (http://localhost:3000/landing)
- [ ] `.env.local` créé (pour dashboard)
- [ ] Clés Supabase ajoutées (pour dashboard)
- [ ] Clé Claude AI ajoutée (pour analyse)

---

## 🚀 Prêt à Démarrer ?

```cmd
install.bat
start-dev.bat
```

Ou simplement :

```cmd
npm install && npm run dev
```

**Le serveur démarre sur http://localhost:3000**

**Bonne découverte ! 🎉**
