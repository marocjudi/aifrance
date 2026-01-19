import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/admin/AdminLayout'
import { DollarSign, TrendingUp, Gift, Award } from 'lucide-react'

export default async function FinancesPage() {
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

  const { data: recoveries } = await supabase
    .from('financial_recoveries')
    .select(`
      *,
      user:users(email, first_name, last_name)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  const totalRecovered = recoveries?.reduce((sum, r) => r.status === 'received' ? sum + r.amount_cents : sum, 0) || 0
  const totalPending = recoveries?.reduce((sum, r) => r.status === 'pending' ? sum + r.amount_cents : sum, 0) || 0
  const totalDetected = recoveries?.reduce((sum, r) => r.status === 'detected' ? sum + r.amount_cents : sum, 0) || 0

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Finances & Récupérations
          </h1>
          <p className="text-gray-400">
            Suivi des montants récupérés pour les utilisateurs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-12 h-12 opacity-80" />
              <Award className="w-6 h-6 opacity-60" />
            </div>
            <p className="text-sm opacity-90 mb-1">Récupéré</p>
            <p className="text-3xl font-bold">
              {(totalRecovered / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-12 h-12 opacity-80" />
              <Gift className="w-6 h-6 opacity-60" />
            </div>
            <p className="text-sm opacity-90 mb-1">En attente</p>
            <p className="text-3xl font-bold">
              {(totalPending / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Gift className="w-12 h-12 opacity-80" />
            </div>
            <p className="text-sm opacity-90 mb-1">Détecté</p>
            <p className="text-3xl font-bold">
              {(totalDetected / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-white">
              Historique des récupérations
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Utilisateur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Organisme</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Montant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recoveries?.map((recovery) => (
                  <tr key={recovery.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">{recovery.user?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-300">
                        {recovery.recovery_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-300">{recovery.entity_name || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-green-400">
                        {(recovery.amount_cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        recovery.status === 'received' 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : recovery.status === 'pending'
                          ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          : recovery.status === 'detected'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {recovery.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-400">
                        {new Date(recovery.created_at).toLocaleDateString('fr-FR')}
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
