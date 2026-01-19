-- =====================================================
-- MANDAT.AI - SCHÉMA DE BASE DE DONNÉES SUPABASE
-- Version Souveraine 2026
-- =====================================================

-- Extension pour le chiffrement
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: users (Profils utilisateurs)
-- =====================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Données personnelles chiffrées
  encrypted_data JSONB NOT NULL DEFAULT '{}',
  
  -- Métadonnées non sensibles
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  
  -- Statut du compte
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  
  -- Coffre-fort: clé de chiffrement dérivée (ne jamais stocker la clé maître)
  vault_key_hash TEXT,
  
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Index pour performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_created_at ON public.users(created_at DESC);

-- =====================================================
-- TABLE: mandates (Mandats de représentation légale)
-- =====================================================
CREATE TABLE public.mandates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  -- Statut de la signature
  status TEXT NOT NULL DEFAULT 'pending',
  
  -- Yousign metadata
  yousign_signature_request_id TEXT,
  yousign_document_id TEXT,
  signed_at TIMESTAMPTZ,
  
  -- Scope du mandat
  authorized_sites TEXT[] DEFAULT ARRAY['impots.gouv.fr', 'ameli.fr', 'caf.fr', 'service-public.fr'],
  
  -- Preuve légale (Article 1984 Code Civil)
  legal_text TEXT,
  signature_proof_url TEXT,
  
  -- Révocation
  revoked_at TIMESTAMPTZ,
  revocation_reason TEXT,
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'signed', 'expired', 'revoked'))
);

CREATE INDEX idx_mandates_user_id ON public.mandates(user_id);
CREATE INDEX idx_mandates_status ON public.mandates(status);

-- =====================================================
-- TABLE: documents (Métadonnées des documents)
-- =====================================================
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Métadonnées du fichier
  filename TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  storage_path TEXT NOT NULL,
  
  -- Classification
  document_type TEXT NOT NULL DEFAULT 'other',
  category TEXT,
  
  -- Extraction de texte (OCR/PDF)
  extracted_text TEXT,
  
  -- Analyse IA
  analysis_status TEXT DEFAULT 'pending',
  analysis_result JSONB,
  analyzed_at TIMESTAMPTZ,
  
  -- Détection d'urgence
  urgency_level TEXT DEFAULT 'low',
  deadline_date DATE,
  
  -- Données sensibles détectées
  contains_pii BOOLEAN DEFAULT false,
  
  -- Validité (pour les documents administratifs)
  valid_until DATE,
  is_expired BOOLEAN GENERATED ALWAYS AS (valid_until < CURRENT_DATE) STORED,
  
  CONSTRAINT valid_document_type CHECK (document_type IN ('identity', 'tax', 'health', 'social', 'housing', 'other')),
  CONSTRAINT valid_analysis_status CHECK (analysis_status IN ('pending', 'processing', 'completed', 'failed')),
  CONSTRAINT valid_urgency CHECK (urgency_level IN ('low', 'medium', 'high', 'critical'))
);

CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_documents_type ON public.documents(document_type);
CREATE INDEX idx_documents_urgency ON public.documents(urgency_level);
CREATE INDEX idx_documents_analysis_status ON public.documents(analysis_status);

-- =====================================================
-- TABLE: agent_tasks (File d'attente des actions)
-- =====================================================
CREATE TABLE public.agent_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  mandate_id UUID REFERENCES public.mandates(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  scheduled_for TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Type d'action
  task_type TEXT NOT NULL,
  
  -- Navigation Web
  target_site TEXT,
  navigation_plan JSONB,
  
  -- Credentials (chiffrés dans le coffre-fort utilisateur)
  requires_credentials BOOLEAN DEFAULT false,
  credentials_vault_key TEXT,
  
  -- Statut
  status TEXT DEFAULT 'queued',
  
  -- Résultats
  result JSONB,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  -- Logs de navigation
  execution_logs TEXT[],
  screenshots_urls TEXT[],
  
  CONSTRAINT valid_task_type CHECK (task_type IN ('automatic_navigation', 'draft_letter', 'form_fill', 'document_download', 'status_check')),
  CONSTRAINT valid_status CHECK (status IN ('queued', 'scheduled', 'running', 'completed', 'failed', 'cancelled'))
);

CREATE INDEX idx_agent_tasks_user_id ON public.agent_tasks(user_id);
CREATE INDEX idx_agent_tasks_status ON public.agent_tasks(status);
CREATE INDEX idx_agent_tasks_scheduled ON public.agent_tasks(scheduled_for) WHERE status = 'scheduled';

-- =====================================================
-- TABLE: vault_credentials (Coffre-fort chiffré)
-- =====================================================
CREATE TABLE public.vault_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Identifiant du service
  service_name TEXT NOT NULL,
  service_url TEXT,
  
  -- Données chiffrées (AES-256-GCM)
  encrypted_username TEXT NOT NULL,
  encrypted_password TEXT NOT NULL,
  encryption_iv TEXT NOT NULL,
  
  -- Métadonnées
  last_used_at TIMESTAMPTZ,
  is_valid BOOLEAN DEFAULT true,
  
  UNIQUE(user_id, service_name)
);

CREATE INDEX idx_vault_credentials_user_id ON public.vault_credentials(user_id);

-- =====================================================
-- TABLE: activity_feed (Flux d'activité)
-- =====================================================
CREATE TABLE public.activity_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Type d'événement
  event_type TEXT NOT NULL,
  
  -- Description
  title TEXT NOT NULL,
  description TEXT,
  
  -- Liens
  related_document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  related_task_id UUID REFERENCES public.agent_tasks(id) ON DELETE SET NULL,
  
  -- Statut
  is_read BOOLEAN DEFAULT false,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_activity_feed_user_id ON public.activity_feed(user_id, created_at DESC);
CREATE INDEX idx_activity_feed_unread ON public.activity_feed(user_id) WHERE is_read = false;

-- =====================================================
-- TRIGGERS: Mise à jour automatique des timestamps
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER documents_updated_at BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER agent_tasks_updated_at BEFORE UPDATE ON public.agent_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER vault_credentials_updated_at BEFORE UPDATE ON public.vault_credentials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mandates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs ne peuvent voir que leurs propres données
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own mandates" ON public.mandates
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own documents" ON public.documents
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own tasks" ON public.agent_tasks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own credentials" ON public.vault_credentials
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own activity" ON public.activity_feed
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction: Créer une activité automatiquement
CREATE OR REPLACE FUNCTION create_activity(
  p_user_id UUID,
  p_event_type TEXT,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_document_id UUID DEFAULT NULL,
  p_task_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO public.activity_feed (
    user_id, event_type, title, description, related_document_id, related_task_id
  ) VALUES (
    p_user_id, p_event_type, p_title, p_description, p_document_id, p_task_id
  ) RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VUES UTILES
-- =====================================================

-- Vue: Documents avec urgence
CREATE OR REPLACE VIEW active_urgent_documents AS
SELECT 
  d.*,
  u.email,
  u.first_name,
  u.last_name
FROM public.documents d
JOIN public.users u ON d.user_id = u.id
WHERE d.urgency_level IN ('high', 'critical')
  AND d.analysis_status = 'completed'
  AND (d.deadline_date IS NULL OR d.deadline_date >= CURRENT_DATE)
ORDER BY d.urgency_level DESC, d.deadline_date ASC NULLS LAST;

-- Vue: Tâches en attente
CREATE OR REPLACE VIEW pending_agent_tasks AS
SELECT 
  t.*,
  u.email,
  d.filename,
  m.status as mandate_status
FROM public.agent_tasks t
JOIN public.users u ON t.user_id = u.id
LEFT JOIN public.documents d ON t.document_id = d.id
LEFT JOIN public.mandates m ON t.mandate_id = m.id
WHERE t.status IN ('queued', 'scheduled')
  AND (t.scheduled_for IS NULL OR t.scheduled_for <= NOW())
  AND t.retry_count < t.max_retries
ORDER BY t.created_at ASC;
