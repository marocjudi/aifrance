'use client'

import { useEffect, useState } from 'react'
import { 
  AlertTriangle, 
  RefreshCw, 
  Flag,
  Clock,
  ExternalLink,
  User,
  Activity
} from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import type { StuckAgent } from '@/lib/types/admin'

export default function StuckAgentsManager() {
  const [stuckAgents, setStuckAgents] = useState<StuckAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchStuckAgents()
    const interval = setInterval(fetchStuckAgents, 15000)
    return () => clearInterval(interval)
  }, [])

  const fetchStuckAgents = async () => {
    try {
      const response = await fetch('/api/admin/agents/stuck')
      if (response.ok) {
        const data = await response.json()
        setStuckAgents(data.stuckAgents)
      }
    } catch (error) {
      console.error('Erreur récupération stuck agents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (taskId: string, action: 'reset' | 'flag') => {
    setActionLoading(taskId)
    try {
      const response = await fetch('/api/admin/agents/stuck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, action }),
      })

      if (response.ok) {
        await fetchStuckAgents()
      } else {
        alert('Erreur lors de l\'action')
      }
    } catch (error) {
      console.error('Erreur action:', error)
      alert('Erreur lors de l\'action')
    } finally {
      setActionLoading(null)
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 bg-slate-800 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Agents Bloqués
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Tâches nécessitant une intervention
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
              stuckAgents.length === 0 
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {stuckAgents.length} agent{stuckAgents.length > 1 ? 's' : ''}
            </span>
            <button
              onClick={fetchStuckAgents}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {stuckAgents.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 mx-auto mb-4 text-green-500/50" />
            <p className="text-lg font-medium text-green-400 mb-1">
              Tous les agents fonctionnent
            </p>
            <p className="text-sm text-gray-500">
              Aucune intervention requise pour le moment
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {stuckAgents.map((agent) => (
              <div
                key={agent.id}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-5 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-white">
                          {agent.first_name} {agent.last_name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{agent.email}</span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Activity className="w-4 h-4" />
                        <span>{agent.task_type}</span>
                      </div>
                      {agent.target_site && (
                        <div className="flex items-center gap-1">
                          <ExternalLink className="w-4 h-4" />
                          <span>{agent.target_site}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Bloqué depuis {formatDuration(agent.stuck_duration_seconds)}</span>
                      </div>
                    </div>

                    {agent.related_document && (
                      <p className="text-xs text-gray-500 mt-2">
                        Document: {agent.related_document}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded text-xs font-medium ${
                      agent.status === 'failed' 
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {agent.status === 'failed' ? 'Échoué' : 'Bloqué'}
                    </span>
                    <span className="px-3 py-1 rounded text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">
                      {agent.retry_count}/{agent.max_retries} tentatives
                    </span>
                  </div>
                </div>

                {agent.error_message && (
                  <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 mb-4">
                    <p className="text-xs font-medium text-red-400 mb-1">Message d'erreur:</p>
                    <p className="text-xs text-red-300 font-mono">
                      {agent.error_message}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => handleAction(agent.id, 'reset')}
                    disabled={actionLoading === agent.id}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`w-4 h-4 ${actionLoading === agent.id ? 'animate-spin' : ''}`} />
                    Réinitialiser
                  </button>
                  <button
                    onClick={() => handleAction(agent.id, 'flag')}
                    disabled={actionLoading === agent.id}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Flag className="w-4 h-4" />
                    Marquer pour intervention
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Contacter utilisateur
                  </button>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-700">
                  <p className="text-xs text-gray-500">
                    Créé le {formatDateTime(agent.created_at)} • 
                    Dernière mise à jour {formatDateTime(agent.updated_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
