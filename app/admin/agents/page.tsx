import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/admin/AdminLayout'
import LiveAgentFeed from '@/components/admin/LiveAgentFeed'

export default async function AgentsPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const { data: adminRole } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!adminRole) {
    redirect('/')
  }

  const { data: performance } = await supabase
    .from('admin_agent_performance')
    .select('*')

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Flux des Agents
          </h1>
          <p className="text-gray-400">
            Surveillance des agents de navigation en temps réel
          </p>
        </div>

        <LiveAgentFeed />

        {performance && performance.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Performance par site
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {performance.map((perf) => (
                <div key={perf.target_site} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <p className="text-sm font-medium text-white mb-2">{perf.target_site}</p>
                  <div className="space-y-1 text-xs text-gray-400">
                    <p>Taux de succès: <span className="text-green-400 font-medium">{perf.success_rate}%</span></p>
                    <p>Total: {perf.total_tasks} tâches</p>
                    <p>Durée moyenne: {Math.round(perf.avg_duration_seconds)}s</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
