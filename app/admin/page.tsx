import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/admin/AdminLayout'
import AdminKPICards from '@/components/admin/AdminKPICards'
import LiveAgentFeed from '@/components/admin/LiveAgentFeed'
import StuckAgentsManager from '@/components/admin/StuckAgentsManager'
import AdminCharts from '@/components/admin/AdminCharts'

export default async function AdminPage() {
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

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Vue d'ensemble
          </h1>
          <p className="text-gray-400">
            Monitoring en temps réel de la plateforme Mandat.ai
          </p>
        </div>

        <AdminKPICards />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <LiveAgentFeed />
          </div>
          <div>
            <StuckAgentsManager />
          </div>
        </div>

        <AdminCharts />
      </div>
    </AdminLayout>
  )
}
