-- =====================================================
-- EXTENSION DU SCHÉMA POUR L'ADMINISTRATION
-- =====================================================

-- TABLE: admin_roles (Rôles d'administration)
CREATE TABLE public.admin_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin',
  permissions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id),
  
  UNIQUE(user_id),
  CONSTRAINT valid_role CHECK (role IN ('admin', 'super_admin', 'support'))
);

CREATE INDEX idx_admin_roles_user_id ON public.admin_roles(user_id);

-- TABLE: agent_logs (Logs détaillés des agents)
CREATE TABLE public.agent_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES public.agent_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Type de log
  log_level TEXT DEFAULT 'info',
  
  -- Contenu
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  
  -- Navigation
  current_url TEXT,
  step_number INTEGER,
  
  CONSTRAINT valid_log_level CHECK (log_level IN ('debug', 'info', 'warning', 'error', 'critical'))
);

CREATE INDEX idx_agent_logs_task_id ON public.agent_logs(task_id, created_at DESC);
CREATE INDEX idx_agent_logs_level ON public.agent_logs(log_level) WHERE log_level IN ('error', 'critical');

-- TABLE: financial_recoveries (Récupérations financières)
CREATE TABLE public.financial_recoveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  task_id UUID REFERENCES public.agent_tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Type de récupération
  recovery_type TEXT NOT NULL,
  
  -- Montant
  amount_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  
  -- Statut
  status TEXT DEFAULT 'detected',
  
  -- Détails
  entity_name TEXT,
  description TEXT,
  reference_number TEXT,
  
  CONSTRAINT valid_recovery_type CHECK (recovery_type IN ('tax_refund', 'health_reimbursement', 'social_aid', 'pension', 'unemployment', 'other')),
  CONSTRAINT valid_status CHECK (status IN ('detected', 'pending', 'received', 'rejected'))
);

CREATE INDEX idx_financial_recoveries_user_id ON public.financial_recoveries(user_id);
CREATE INDEX idx_financial_recoveries_status ON public.financial_recoveries(status);

-- TABLE: system_health (Santé des services)
CREATE TABLE public.system_health (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'operational',
  last_check TIMESTAMPTZ DEFAULT NOW(),
  response_time_ms INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  
  CONSTRAINT valid_status CHECK (status IN ('operational', 'degraded', 'down'))
);

CREATE INDEX idx_system_health_service ON public.system_health(service_name);
CREATE UNIQUE INDEX idx_system_health_latest ON public.system_health(service_name, last_check DESC);

-- TABLE: admin_actions (Audit trail des actions admin)
CREATE TABLE public.admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  target_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  target_task_id UUID REFERENCES public.agent_tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Détails
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT
);

CREATE INDEX idx_admin_actions_admin_id ON public.admin_actions(admin_id, created_at DESC);
CREATE INDEX idx_admin_actions_target_user ON public.admin_actions(target_user_id);

-- =====================================================
-- VUES POUR L'ADMINISTRATION
-- =====================================================

-- Vue: Métriques temps réel
CREATE OR REPLACE VIEW admin_realtime_metrics AS
SELECT
  (SELECT COUNT(*) FROM public.agent_tasks WHERE status = 'running') as active_tasks,
  (SELECT COUNT(*) FROM public.agent_tasks WHERE status = 'failed' AND created_at > NOW() - INTERVAL '24 hours') as failed_tasks_24h,
  (SELECT COUNT(*) FROM public.documents WHERE created_at > NOW() - INTERVAL '24 hours') as documents_uploaded_24h,
  (SELECT COUNT(*) FROM public.users WHERE created_at > NOW() - INTERVAL '24 hours') as new_users_24h,
  (SELECT COUNT(DISTINCT user_id) FROM public.agent_tasks WHERE status = 'completed' AND completed_at > NOW() - INTERVAL '24 hours') as active_users_24h,
  (SELECT COALESCE(SUM(amount_cents), 0) FROM public.financial_recoveries WHERE status = 'received' AND created_at > NOW() - INTERVAL '30 days') as total_recovered_30d,
  (SELECT COUNT(*) FROM public.financial_recoveries WHERE status = 'detected' AND created_at > NOW() - INTERVAL '7 days') as aids_detected_7d;

-- Vue: Tasks en erreur qui nécessitent une intervention
CREATE OR REPLACE VIEW admin_stuck_agents AS
SELECT
  t.id,
  t.user_id,
  u.email,
  u.first_name,
  u.last_name,
  t.task_type,
  t.target_site,
  t.status,
  t.error_message,
  t.retry_count,
  t.max_retries,
  t.created_at,
  t.updated_at,
  EXTRACT(EPOCH FROM (NOW() - t.updated_at)) as stuck_duration_seconds,
  d.filename as related_document
FROM public.agent_tasks t
JOIN public.users u ON t.user_id = u.id
LEFT JOIN public.documents d ON t.document_id = d.id
WHERE t.status IN ('failed', 'running')
  AND (
    (t.status = 'failed' AND t.retry_count >= t.max_retries)
    OR (t.status = 'running' AND t.updated_at < NOW() - INTERVAL '10 minutes')
  )
ORDER BY t.created_at ASC;

-- Vue: Live Agent Feed
CREATE OR REPLACE VIEW admin_live_agent_feed AS
SELECT
  t.id as task_id,
  t.user_id,
  u.email as user_email,
  CONCAT(u.first_name, ' ', u.last_name) as user_name,
  t.task_type,
  t.target_site,
  t.status,
  t.created_at,
  t.started_at,
  t.completed_at,
  t.error_message,
  d.filename as document_name,
  d.urgency_level,
  CASE 
    WHEN t.status = 'completed' AND t.completed_at IS NOT NULL 
    THEN EXTRACT(EPOCH FROM (t.completed_at - t.started_at))
    WHEN t.status = 'running' AND t.started_at IS NOT NULL
    THEN EXTRACT(EPOCH FROM (NOW() - t.started_at))
    ELSE NULL
  END as execution_duration_seconds,
  (SELECT COUNT(*) FROM public.agent_logs WHERE task_id = t.id AND log_level = 'error') as error_count
FROM public.agent_tasks t
JOIN public.users u ON t.user_id = u.id
LEFT JOIN public.documents d ON t.document_id = d.id
WHERE t.created_at > NOW() - INTERVAL '7 days'
ORDER BY t.created_at DESC;

-- Vue: Performance des agents par site
CREATE OR REPLACE VIEW admin_agent_performance AS
SELECT
  target_site,
  COUNT(*) as total_tasks,
  COUNT(*) FILTER (WHERE status = 'completed') as successful_tasks,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_tasks,
  COUNT(*) FILTER (WHERE status = 'running') as running_tasks,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE status = 'completed') / NULLIF(COUNT(*), 0),
    2
  ) as success_rate,
  ROUND(
    AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) FILTER (WHERE status = 'completed'),
    2
  ) as avg_duration_seconds,
  MAX(updated_at) as last_execution
FROM public.agent_tasks
WHERE created_at > NOW() - INTERVAL '30 days'
  AND target_site IS NOT NULL
GROUP BY target_site
ORDER BY total_tasks DESC;

-- Vue: Statistiques utilisateurs pour admin
CREATE OR REPLACE VIEW admin_user_stats AS
SELECT
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  u.created_at,
  u.is_active,
  (SELECT COUNT(*) FROM public.documents WHERE user_id = u.id) as total_documents,
  (SELECT COUNT(*) FROM public.agent_tasks WHERE user_id = u.id) as total_tasks,
  (SELECT COUNT(*) FROM public.agent_tasks WHERE user_id = u.id AND status = 'completed') as completed_tasks,
  (SELECT COUNT(*) FROM public.mandates WHERE user_id = u.id AND status = 'signed') as active_mandates,
  (SELECT COALESCE(SUM(amount_cents), 0) FROM public.financial_recoveries WHERE user_id = u.id AND status = 'received') as total_recovered_cents,
  (SELECT MAX(created_at) FROM public.agent_tasks WHERE user_id = u.id) as last_activity
FROM public.users u
ORDER BY u.created_at DESC;

-- =====================================================
-- FONCTIONS POUR L'ADMINISTRATION
-- =====================================================

-- Fonction: Calculer le taux de succès global
CREATE OR REPLACE FUNCTION admin_get_success_rate(days INTEGER DEFAULT 7)
RETURNS NUMERIC AS $$
DECLARE
  success_rate NUMERIC;
BEGIN
  SELECT 
    ROUND(
      100.0 * COUNT(*) FILTER (WHERE status = 'completed') / NULLIF(COUNT(*), 0),
      2
    )
  INTO success_rate
  FROM public.agent_tasks
  WHERE created_at > NOW() - (days || ' days')::INTERVAL
    AND status IN ('completed', 'failed');
  
  RETURN COALESCE(success_rate, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction: Marquer un agent comme nécessitant une intervention manuelle
CREATE OR REPLACE FUNCTION admin_flag_stuck_agent(task_id_param UUID, admin_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.agent_tasks
  SET 
    status = 'cancelled',
    error_message = COALESCE(error_message, '') || ' [FLAGGED FOR MANUAL REVIEW]',
    updated_at = NOW()
  WHERE id = task_id_param;
  
  INSERT INTO public.admin_actions (admin_id, action_type, target_task_id, description)
  VALUES (admin_id_param, 'flag_stuck_agent', task_id_param, 'Agent marked for manual intervention');
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction: Réinitialiser une tâche bloquée
CREATE OR REPLACE FUNCTION admin_reset_task(task_id_param UUID, admin_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.agent_tasks
  SET 
    status = 'queued',
    retry_count = 0,
    error_message = NULL,
    started_at = NULL,
    completed_at = NULL,
    updated_at = NOW()
  WHERE id = task_id_param;
  
  INSERT INTO public.admin_actions (admin_id, action_type, target_task_id, description)
  VALUES (admin_id_param, 'reset_task', task_id_param, 'Task reset to queued state');
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ROW LEVEL SECURITY POUR ADMIN
-- =====================================================

ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_recoveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Seuls les admins peuvent voir les rôles admin
CREATE POLICY "Admins can view admin roles" ON public.admin_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles ar
      WHERE ar.user_id = auth.uid()
    )
  );

-- Les admins peuvent voir tous les logs
CREATE POLICY "Admins can view all logs" ON public.agent_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles ar
      WHERE ar.user_id = auth.uid()
    )
  );

-- Les utilisateurs peuvent voir leurs propres recoveries
CREATE POLICY "Users can view own recoveries" ON public.financial_recoveries
  FOR SELECT USING (auth.uid() = user_id);

-- Les admins peuvent voir toutes les recoveries
CREATE POLICY "Admins can view all recoveries" ON public.financial_recoveries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles ar
      WHERE ar.user_id = auth.uid()
    )
  );

-- Les admins peuvent voir toutes leurs actions
CREATE POLICY "Admins can view their actions" ON public.admin_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles ar
      WHERE ar.user_id = auth.uid()
    )
  );

-- Trigger pour mettre à jour la santé du système
CREATE OR REPLACE FUNCTION update_system_health()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.system_health (service_name, status, last_check, metadata)
  VALUES (
    TG_ARGV[0],
    'operational',
    NOW(),
    '{}'::JSONB
  )
  ON CONFLICT (service_name, last_check) 
  DO UPDATE SET last_check = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
