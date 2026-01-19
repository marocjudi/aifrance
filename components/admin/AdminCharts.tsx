'use client'

import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { TrendingUp, Activity } from 'lucide-react'

interface ChartData {
  date: string
  documents: number
  tasks: number
  users: number
}

export default function AdminCharts() {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChartData()
  }, [])

  const fetchChartData = async () => {
    try {
      const mockData: ChartData[] = [
        { date: '10 Jan', documents: 45, tasks: 38, users: 12 },
        { date: '11 Jan', documents: 52, tasks: 44, users: 15 },
        { date: '12 Jan', documents: 61, tasks: 51, users: 18 },
        { date: '13 Jan', documents: 58, tasks: 49, users: 16 },
        { date: '14 Jan', documents: 73, tasks: 62, users: 21 },
        { date: '15 Jan', documents: 82, tasks: 71, users: 24 },
        { date: '16 Jan', documents: 95, tasks: 83, users: 28 },
      ]
      
      setChartData(mockData)
      setLoading(false)
    } catch (error) {
      console.error('Erreur chargement données:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="h-80 bg-slate-800 rounded animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Croissance Documents
            </h3>
            <p className="text-sm text-gray-400 mt-1">7 derniers jours</p>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="documentsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="date" 
              stroke="#64748b" 
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#64748b" 
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="documents" 
              stroke="#6366f1" 
              strokeWidth={2}
              fill="url(#documentsGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Tâches vs Utilisateurs
            </h3>
            <p className="text-sm text-gray-400 mt-1">Performance hebdomadaire</p>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="date" 
              stroke="#64748b" 
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#64748b" 
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: '12px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="tasks" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Tâches"
              dot={{ fill: '#10b981' }}
            />
            <Line 
              type="monotone" 
              dataKey="users" 
              stroke="#f59e0b" 
              strokeWidth={2}
              name="Utilisateurs"
              dot={{ fill: '#f59e0b' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Vue d'ensemble activité
            </h3>
            <p className="text-sm text-gray-400 mt-1">Documents, tâches et utilisateurs</p>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="date" 
              stroke="#64748b" 
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#64748b" 
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: '12px'
              }}
            />
            <Bar dataKey="documents" fill="#6366f1" name="Documents" radius={[4, 4, 0, 0]} />
            <Bar dataKey="tasks" fill="#10b981" name="Tâches" radius={[4, 4, 0, 0]} />
            <Bar dataKey="users" fill="#f59e0b" name="Utilisateurs" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
