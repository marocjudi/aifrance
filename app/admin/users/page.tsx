import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/admin/AdminLayout'
import { Users, TrendingUp, Clock } from 'lucide-react'

export default async function UsersPage() {
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

  const { data: userStats } = await supabase
    .from('admin_user_stats')
    .select('*')
    .limit(100)

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Gestion Utilisateurs
          </h1>
          <p className="text-gray-400">
            Vue d'ensemble des utilisateurs et de leur activité
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Utilisateur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Documents</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Tâches</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Mandats</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Récupéré</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Dernière activité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {userStats?.map((stat) => (
                  <tr key={stat.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {stat.first_name} {stat.last_name}
                        </p>
                        <p className="text-xs text-gray-400">{stat.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        stat.is_active 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                      }`}>
                        {stat.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{stat.total_documents}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300">
                        {stat.completed_tasks}/{stat.total_tasks}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{stat.active_mandates}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-green-400">
                        {(stat.total_recovered_cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-400">
                        {stat.last_activity 
                          ? new Date(stat.last_activity).toLocaleDateString('fr-FR')
                          : 'Jamais'
                        }
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
