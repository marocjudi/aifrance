'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, Activity } from 'lucide-react'
import type { SystemHealth } from '@/lib/types/admin'

export default function SystemHealthHeader() {
  const [healthStatus, setHealthStatus] = useState<SystemHealth[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHealth()
    const interval = setInterval(fetchHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchHealth = async () => {
    try {
      const response = await fetch('/api/admin/health')
      if (response.ok) {
        const data = await response.json()
        setHealthStatus(data.services)
      }
    } catch (error) {
      console.error('Erreur récupération santé:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'degraded':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />
      case 'down':
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return <Activity className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'degraded':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'down':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  if (loading) {
    return (
      <header className="bg-slate-900 border-b border-slate-800 px-8 py-4">
        <div className="flex items-center gap-4">
          <div className="w-4 h-4 bg-slate-700 rounded animate-pulse" />
          <div className="w-24 h-4 bg-slate-700 rounded animate-pulse" />
        </div>
      </header>
    )
  }

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
            <span className="text-sm font-medium text-gray-300">Statut des services</span>
          </div>
          
          <div className="flex items-center gap-3">
            {healthStatus.map((service) => (
              <div
                key={service.service_name}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${getStatusColor(service.status)}`}
              >
                {getStatusIcon(service.status)}
                <span>{service.service_name}</span>
                {service.response_time_ms && (
                  <span className="text-xs opacity-60">
                    {service.response_time_ms}ms
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Mise à jour automatique
        </div>
      </div>
    </header>
  )
}
