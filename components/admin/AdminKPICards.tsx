'use client'

import { useEffect, useState } from 'react'
import { 
  Activity, 
  TrendingUp, 
  Users, 
  FileText, 
  CheckCircle,
  DollarSign,
  Gift,
  Zap
} from 'lucide-react'
import type { AdminMetrics } from '@/lib/types/admin'

export default function AdminKPICards() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/admin/metrics')
      if (response.ok) {
        const data = await response.json()
        setMetrics(data.metrics)
      }
    } catch (error) {
      console.error('Erreur récupération métriques:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="animate-pulse space-y-3">
              <div className="w-12 h-12 bg-slate-800 rounded-lg" />
              <div className="h-4 bg-slate-800 rounded w-24" />
              <div className="h-8 bg-slate-800 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!metrics) {
    return null
  }

  const cards = [
    {
      title: 'Taux de Succès',
      value: `${metrics.success_rate || 0}%`,
      subtitle: 'Démarches automatisées',
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    },
    {
      title: 'Volume 24h',
      value: metrics.documents_uploaded_24h,
      subtitle: 'Documents traités',
      icon: FileText,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'Valeur Récupérée',
      value: `${(metrics.total_recovered_30d / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`,
      subtitle: 'Ces 30 derniers jours',
      icon: DollarSign,
      color: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
    },
    {
      title: 'Aides Détectées',
      value: metrics.aids_detected_7d,
      subtitle: 'Cette semaine',
      icon: Gift,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.title}
            className={`bg-slate-900 border ${card.borderColor} rounded-xl p-6 hover:scale-105 transition-transform duration-200`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${card.bgColor} text-white`}>
                Live
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-400 mb-1">{card.title}</p>
              <p className="text-3xl font-bold text-white mb-1">
                {card.value}
              </p>
              <p className="text-xs text-gray-500">{card.subtitle}</p>
            </div>
          </div>
        )
      })}

      <div className="md:col-span-2 lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Agents Actifs"
          value={metrics.active_tasks}
          icon={Activity}
          trend="+12%"
          trendUp={true}
        />
        <StatCard
          title="Échecs 24h"
          value={metrics.failed_tasks_24h}
          icon={Zap}
          trend="-8%"
          trendUp={true}
        />
        <StatCard
          title="Nouveaux Utilisateurs"
          value={metrics.new_users_24h}
          icon={Users}
          trend="+23%"
          trendUp={true}
        />
      </div>
    </div>
  )
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp 
}: { 
  title: string
  value: number
  icon: any
  trend: string
  trendUp: boolean
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-5 h-5 text-gray-400" />
        <span className={`text-xs font-medium ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
          {trend}
        </span>
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-gray-400">{title}</p>
    </div>
  )
}
