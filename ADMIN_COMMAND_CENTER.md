# MANDAT.AI - COMMAND CENTER ADMIN

## Nouvelle Fonctionnalité : Interface d'Administration

### Vue d'ensemble

Le **Command Center** est une interface d'administration complète de style "Cyber-Security Center" permettant de surveiller et gérer tous les aspects de la plateforme Mandat.ai en temps réel.

---

## 📊 Schéma de Données Étendu

### Nouvelles Tables

**`admin_roles`** - Gestion des rôles administrateurs
- Rôles : admin, super_admin, support
- Permissions granulaires en JSONB

**`agent_logs`** - Logs détaillés de navigation
- Niveaux : debug, info, warning, error, critical
- Métadonnées et traces d'exécution

**`financial_recoveries`** - Suivi des récupérations financières
- Types : remboursements santé, fiscaux, aides sociales
- Statuts : detected, pending, received, rejected

**`system_health`** - Monitoring des services
- Supabase, Claude AI, Storage
- Temps de réponse et statut

**`admin_actions`** - Audit trail
- Toutes les actions administratives tracées

### Vues SQL Optimisées

- `admin_realtime_metrics` - KPIs en temps réel
- `admin_live_agent_feed` - Feed des agents actifs
- `admin_stuck_agents` - Agents nécessitant intervention
- `admin_agent_performance` - Performance par site
- `admin_user_stats` - Statistiques utilisateurs

---

## 🎨 Interface Utilisateur

### Layout Principal

**Dark Mode par défaut** avec thème cyber-security
- Sidebar avec 6 sections
- Header avec monitoring des services (vert/rouge)
- Design inspiré de Vercel/Stripe

### Pages Créées

#### 1. `/admin` - Vue d'ensemble
- **KPIs Cards** :
  - Taux de succès des agents (%)
  - Volume 24h (documents traités)
  - Valeur récupérée (€)
  - Aides détectées
- **Live Agent Feed** : Table temps réel
- **Stuck Agents Manager**
- **Graphiques Recharts** : Croissance et performance

#### 2. `/admin/agents` - Flux des Agents
- Feed complet avec filtres
- Performance par site (impots.gouv.fr, ameli.fr, caf.fr)
- Logs Playwright en modal

#### 3. `/admin/users` - Gestion Utilisateurs
- Table complète avec statistiques
- Documents, tâches, mandats par utilisateur
- Total récupéré par utilisateur

#### 4. `/admin/disputes` - Litiges
- Stuck Agents Manager détaillé
- Actions : Réinitialiser, Marquer, Contacter
- Guide d'intervention

#### 5. `/admin/finances` - Finances
- 3 KPIs principaux (récupéré, en attente, détecté)
- Historique complet des récupérations
- Filtres par type et statut

---

## ⚡ Composants Clés

### `LiveAgentFeed`
- Mise à jour toutes les 5s
- Affichage : user, action, site cible, statut, durée
- Modal "Watch Live" avec logs Playwright
- Badges de statut dynamiques

### `AdminKPICards`
- 4 cartes principales avec icônes
- Couleurs par catégorie
- Mise à jour toutes les 10s
- 3 stats secondaires avec tendances

### `StuckAgentsManager`
- Détection automatique (timeout > 10min, retry max atteint)
- Actions :
  - **Reset** : Réinitialise la tâche
  - **Flag** : Marque pour intervention manuelle
  - **Contact** : Notifie l'utilisateur
- Affichage durée de blocage

### `AdminCharts` (Recharts)
- **Area Chart** : Croissance documents (7 jours)
- **Line Chart** : Tâches vs Utilisateurs
- **Bar Chart** : Vue d'ensemble activité
- Gradients et animations

### `SystemHealthHeader`
- Monitoring en temps réel (30s refresh)
- Services : Supabase, Claude AI, Storage
- Indicateurs : vert (operational), jaune (degraded), rouge (down)
- Temps de réponse en ms

---

## 🔒 Sécurité & Permissions

### Middleware de Protection
- Vérification `admin_roles` avant chaque page
- Redirection automatique si non-admin
- Row Level Security (RLS) sur toutes les tables

### Fonctions SQL Sécurisées
- `admin_get_success_rate(days)` - Calcul du taux de succès
- `admin_flag_stuck_agent(task_id, admin_id)` - Flag avec audit
- `admin_reset_task(task_id, admin_id)` - Reset avec trace

---

## 🚀 APIs Admin

### GET `/api/admin/health`
Retourne l'état des services

### GET `/api/admin/metrics`
KPIs en temps réel

### GET `/api/admin/agents/live?limit=100`
Feed des agents actifs

### GET `/api/admin/agents/stuck`
Liste des agents bloqués

### POST `/api/admin/agents/stuck`
Actions sur agents bloqués
```json
{
  "taskId": "uuid",
  "action": "reset|flag"
}
```

---

## 📦 Dépendances Ajoutées

```json
"recharts": "^2.10.3"
```

---

## 🎯 Fonctionnalités Clés

### Temps Réel
- Auto-refresh toutes les 5-30s
- Indicateurs visuels (animations)
- Données live via vues SQL

### Error Handling
- Stuck Agents automatiquement détectés
- Logs Playwright consultables
- Actions de résolution intégrées

### Analytics
- Graphiques de croissance
- Performance par site
- ROI en € récupérés

### Audit Trail
- Toutes actions admin tracées
- IP et timestamp
- Métadonnées en JSONB

---

## 📝 Instructions de Déploiement

1. **Exécuter le schéma admin** :
```sql
-- Dans Supabase SQL Editor
\i supabase/admin-schema.sql
```

2. **Créer le premier admin** :
```sql
INSERT INTO admin_roles (user_id, role)
VALUES ('votre-user-id-supabase', 'super_admin');
```

3. **Installer Recharts** :
```powershell
npm install recharts
```

4. **Accéder au Command Center** :
```
http://localhost:3000/admin
```

---

## 🎨 Design System

### Couleurs
- Background : `slate-950`
- Cards : `slate-900` avec bordures `slate-800`
- Primary : Indigo/Purple gradient
- Success : Green
- Warning : Amber
- Error : Red

### Typographie
- Headings : Bold, white
- Body : Gray-400
- Mono : Logs et code

### Animations
- Pulse pour indicateurs live
- Hover scale sur KPIs
- Spin pour loaders

---

## 🔮 Futures Améliorations

- [ ] Notifications push pour stuck agents
- [ ] Export CSV des données
- [ ] Dashboard customizable (drag & drop)
- [ ] Logs Playwright streaming en temps réel
- [ ] Alertes email/SMS critiques
- [ ] Gestion des permissions granulaires
- [ ] Historique complet avec recherche
- [ ] API publique pour monitoring externe

---

## 📞 Support

Pour toute question sur le Command Center :
- Documentation complète : `/admin` (bouton "?" à venir)
- Support admin : admin@mandat.ai

---

**Créé avec 💜 par l'équipe Mandat.ai**
