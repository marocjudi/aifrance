# Guide de Démarrage Rapide - Mandat.ai

## 🚀 Démarrage en 3 étapes

### Étape 1: Installer les dépendances

```powershell
npm install
```

Ou utilisez le script automatique:
```powershell
.\install.ps1
```

### Étape 2: Configurer les variables d'environnement

1. Copiez le fichier d'exemple:
```powershell
Copy-Item env.example .env.local
```

2. Éditez `.env.local` et ajoutez vos clés:

```env
# Supabase (obligatoire pour le dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon

# Claude AI (obligatoire pour l'analyse)
ANTHROPIC_API_KEY=sk-ant-...

# Yousign (optionnel en dev)
YOUSIGN_API_KEY=votre_cle
```

### Étape 3: Lancer le serveur

```powershell
npm run dev
```

Ou utilisez le script complet:
```powershell
.\start.ps1
```

---

## 📍 Pages Disponibles

Une fois le serveur lancé, accédez à:

| Page | URL | Description |
|------|-----|-------------|
| **Landing Page** | http://localhost:3000/landing | Page marketing ultra-épurée |
| **Dashboard** | http://localhost:3000 | Interface utilisateur principale |
| **Command Center** | http://localhost:3000/admin | Interface admin (nécessite rôle admin) |
| **Coffre-fort** | http://localhost:3000/vault | Gestion documents sécurisés |

---

## ⚙️ Configuration Supabase

### 1. Créer un projet Supabase

Allez sur [supabase.com](https://supabase.com) et créez un nouveau projet.

### 2. Exécuter le schéma principal

Dans l'éditeur SQL Supabase, exécutez le contenu de:
- `supabase/schema.sql`

### 3. Exécuter le schéma admin (optionnel)

Pour activer le Command Center:
- `supabase/admin-schema.sql`

### 4. Créer un bucket Storage

Dans Supabase Storage, créez un bucket nommé `documents` avec:
- Public: Non
- Allowed MIME types: `application/pdf, image/*`

### 5. Récupérer les clés

Dans Settings → API:
- `NEXT_PUBLIC_SUPABASE_URL`: Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: service_role key (gardez-la secrète!)

---

## 🔑 Configuration Claude AI

1. Créez un compte sur [console.anthropic.com](https://console.anthropic.com)
2. Générez une API key
3. Ajoutez-la dans `.env.local`:
```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

---

## 🎨 Mode Développement sans Supabase

Si vous voulez juste voir la landing page:

```powershell
npm run dev
```

Puis ouvrez: http://localhost:3000/landing

La landing page fonctionne **sans configuration** !

---

## 🐛 Dépannage

### Erreur: "npm not found"

Installez Node.js depuis https://nodejs.org (version 20+)

### Erreur: "execution of scripts is disabled"

Exécutez dans PowerShell en tant qu'administrateur:
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Erreur: Module not found

Réinstallez les dépendances:
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

### Port 3000 déjà utilisé

Changez le port:
```powershell
$env:PORT=3001; npm run dev
```

---

## 📦 Scripts Disponibles

```powershell
npm run dev      # Serveur de développement
npm run build    # Build production
npm run start    # Serveur production
npm run lint     # Vérification code
```

---

## 🎯 Checklist de Démarrage

- [ ] Node.js 20+ installé
- [ ] Dépendances installées (`npm install`)
- [ ] `.env.local` créé
- [ ] Projet Supabase créé
- [ ] Schéma SQL exécuté
- [ ] Bucket `documents` créé
- [ ] Clés Supabase ajoutées
- [ ] Clé Claude AI ajoutée
- [ ] Serveur lancé (`npm run dev`)
- [ ] Landing page accessible

---

## 🚀 Prochaines Étapes

1. **Tester la landing page**: http://localhost:3000/landing
2. **Créer un utilisateur** via Supabase Auth
3. **Créer un admin** (SQL):
```sql
INSERT INTO admin_roles (user_id, role)
VALUES ('votre-user-id-supabase', 'super_admin');
```
4. **Tester le Command Center**: http://localhost:3000/admin

---

**Besoin d'aide ?** Consultez les fichiers:
- `PROJECT_OVERVIEW.md` - Vue d'ensemble du projet
- `ADMIN_COMMAND_CENTER.md` - Documentation admin
- `LANDING_PAGE.md` - Documentation landing

**Bon développement ! 🎉**
