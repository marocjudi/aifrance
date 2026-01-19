export interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  created_at: string
  is_active: boolean
}

export interface Document {
  id: string
  user_id: string
  filename: string
  document_type: 'identity' | 'tax' | 'health' | 'social' | 'housing' | 'other'
  storage_path: string
  extracted_text?: string
  analysis_status: 'pending' | 'processing' | 'completed' | 'failed'
  analysis_result?: AnalysisResult
  urgency_level: 'low' | 'medium' | 'high' | 'critical'
  deadline_date?: string
  created_at: string
  valid_until?: string
  is_expired?: boolean
}

export interface AnalysisResult {
  status: string
  urgency: string
  summary: string
  detected_entity: string
  deadline?: string
  action_plan: {
    type: 'automatic_navigation' | 'draft_letter' | 'manual_action' | 'no_action'
    target_site?: string
    required_fields?: string[]
    next_steps: string[]
  }
  opportunities?: {
    aids_available: string[]
    estimated_amount: number
  }
  legal_basis?: string
}

export interface Mandate {
  id: string
  user_id: string
  status: 'pending' | 'signed' | 'expired' | 'revoked'
  created_at: string
  expires_at?: string
  signed_at?: string
  authorized_sites: string[]
  yousign_signature_request_id?: string
}

export interface AgentTask {
  id: string
  user_id: string
  document_id?: string
  task_type: 'automatic_navigation' | 'draft_letter' | 'form_fill' | 'document_download' | 'status_check'
  target_site?: string
  status: 'queued' | 'scheduled' | 'running' | 'completed' | 'failed' | 'cancelled'
  created_at: string
  completed_at?: string
  result?: any
  error_message?: string
}

export interface ActivityFeedItem {
  id: string
  user_id: string
  event_type: string
  title: string
  description?: string
  created_at: string
  is_read: boolean
  related_document_id?: string
  related_task_id?: string
}
