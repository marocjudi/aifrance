'use client'

import { useEffect, useState } from 'react'
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Loader2,
  ExternalLink,
  AlertCircle
} from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import type { LiveAgentTask } from '@/lib/types/admin'

export default function LiveAgentFeed() {
  const [tasks, setTasks] = useState<LiveAgentTask[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<LiveAgentTask | null>(null)

  useEffect(() => {
    fetchTasks()
    const interval = setInterval(fetchTasks, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/admin/agents/live?limit=100')
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks)
      }
    } catch (error) {
      console.error('Erreur récupération tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-xs font-medium">
            <Loader2 className="w-3 h-3 animate-spin" />
            En cours
          </span>
        )
      case 'completed':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Succès
          </span>
        )
      case 'failed':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Échec
          </span>
        )
      case 'queued':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded text-xs font-medium">
            <Clock className="w-3 h-3" />
            En attente
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded text-xs font-medium">
            {status}
          </span>
        )
    }
  }

  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case 'automatic_navigation':
        return 'Navigation auto'
      case 'draft_letter':
        return 'Rédaction courrier'
      case 'form_fill':
        return 'Formulaire'
      case 'document_download':
        return 'Téléchargement'
      case 'status_check':
        return 'Vérification statut'
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-800 rounded animate-pulse" />
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
              <Play className="w-5 h-5 text-indigo-400" />
              Live Agent Feed
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Actions des agents en temps réel
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-gray-400">Mise à jour toutes les 5s</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Utilisateur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Type d'action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Site cible
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Durée
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {tasks.map((task) => (
              <tr
                key={task.task_id}
                className="hover:bg-slate-800/30 transition-colors"
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {task.user_name || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-400">{task.user_email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-300">
                    {getTaskTypeLabel(task.task_type)}
                  </span>
                  {task.document_name && (
                    <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                      {task.document_name}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4">
                  {task.target_site ? (
                    <div className="flex items-center gap-1">
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                      <span className="text-sm text-gray-300">
                        {task.target_site}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(task.status)}
                  {task.error_count > 0 && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-red-400">
                      <AlertCircle className="w-3 h-3" />
                      {task.error_count} erreur{task.error_count > 1 ? 's' : ''}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {task.execution_duration_seconds ? (
                    <span className="text-sm text-gray-300">
                      {Math.round(task.execution_duration_seconds)}s
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-400">
                    {formatDateTime(task.created_at)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => setSelectedTask(task)}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    Voir logs
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {tasks.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Play className="w-12 h-12 mx-auto mb-3 text-gray-700" />
            <p className="text-sm">Aucune activité récente</p>
          </div>
        )}
      </div>

      {selectedTask && (
        <TaskLogsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  )
}

function TaskLogsModal({ task, onClose }: { task: LiveAgentTask; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            Logs de la tâche
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            <div className="bg-slate-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Informations</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p><span className="text-gray-500">ID:</span> {task.task_id}</p>
                <p><span className="text-gray-500">Type:</span> {task.task_type}</p>
                <p><span className="text-gray-500">Site:</span> {task.target_site || 'N/A'}</p>
                <p><span className="text-gray-500">Statut:</span> {task.status}</p>
              </div>
            </div>

            {task.error_message && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <h4 className="text-sm font-medium text-red-400 mb-2">Message d'erreur</h4>
                <pre className="text-xs text-red-300 whitespace-pre-wrap font-mono">
                  {task.error_message}
                </pre>
              </div>
            )}

            <div className="bg-slate-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Logs Playwright (à implémenter)
              </h4>
              <p className="text-xs text-gray-500">
                Les logs détaillés seront affichés ici lors de l'intégration avec le storage des logs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
