export interface AdminMetrics {
  active_tasks: number
  failed_tasks_24h: number
  documents_uploaded_24h: number
  new_users_24h: number
  active_users_24h: number
  total_recovered_30d: number
  aids_detected_7d: number
}

export interface LiveAgentTask {
  task_id: string
  user_id: string
  user_email: string
  user_name: string
  task_type: string
  target_site?: string
  status: string
  created_at: string
  started_at?: string
  completed_at?: string
  error_message?: string
  document_name?: string
  urgency_level?: string
  execution_duration_seconds?: number
  error_count: number
}

export interface StuckAgent {
  id: string
  user_id: string
  email: string
  first_name?: string
  last_name?: string
  task_type: string
  target_site?: string
  status: string
  error_message?: string
  retry_count: number
  max_retries: number
  created_at: string
  updated_at: string
  stuck_duration_seconds: number
  related_document?: string
}

export interface AgentPerformance {
  target_site: string
  total_tasks: number
  successful_tasks: number
  failed_tasks: number
  running_tasks: number
  success_rate: number
  avg_duration_seconds: number
  last_execution: string
}

export interface UserStats {
  id: string
  email: string
  first_name?: string
  last_name?: string
  created_at: string
  is_active: boolean
  total_documents: number
  total_tasks: number
  completed_tasks: number
  active_mandates: number
  total_recovered_cents: number
  last_activity?: string
}

export interface SystemHealth {
  id: string
  service_name: string
  status: 'operational' | 'degraded' | 'down'
  last_check: string
  response_time_ms?: number
  error_message?: string
  metadata?: any
}

export interface AgentLog {
  id: string
  task_id?: string
  user_id: string
  created_at: string
  log_level: 'debug' | 'info' | 'warning' | 'error' | 'critical'
  message: string
  metadata?: any
  current_url?: string
  step_number?: number
}

export interface FinancialRecovery {
  id: string
  user_id: string
  document_id?: string
  task_id?: string
  created_at: string
  recovery_type: 'tax_refund' | 'health_reimbursement' | 'social_aid' | 'pension' | 'unemployment' | 'other'
  amount_cents: number
  currency: string
  status: 'detected' | 'pending' | 'received' | 'rejected'
  entity_name?: string
  description?: string
  reference_number?: string
}

export interface AdminAction {
  id: string
  admin_id: string
  action_type: string
  target_user_id?: string
  target_task_id?: string
  created_at: string
  description: string
  metadata?: any
  ip_address?: string
}
