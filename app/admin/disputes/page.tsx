import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/admin/AdminLayout'
import StuckAgentsManager from '@/components/admin/StuckAgentsManager'
import { AlertTriangle } from 'lucide-react'

export default async function DisputesPage() {
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
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
            Litiges & Interventions
          </h1>
          <p className="text-gray-400">
            Gestion des agents bloqués et des situations nécessitant une intervention manuelle
          </p>
        </div>

        <StuckAgentsManager />

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Guide d'intervention
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-white mb-2">🔄 Réinitialiser</h3>
              <p className="text-xs text-gray-400">
                Remet la tâche en file d'attente pour un nouvel essai automatique. 
                Utiliser si l'erreur semble temporaire (timeout, réseau).
              </p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-white mb-2">🚩 Marquer</h3>
              <p className="text-xs text-gray-400">
                Annule la tâche et la marque pour intervention manuelle. 
                Utiliser pour CAPTCHA, 2FA, ou problème structurel.
              </p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-white mb-2">📧 Contacter</h3>
              <p className="text-xs text-gray-400">
                Envoie une notification push à l'utilisateur pour lui demander 
                d'effectuer l'action manuellement ou de fournir des informations.
              </p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-white mb-2">🔍 Logs Playwright</h3>
              <p className="text-xs text-gray-400">
                Examine les captures d'écran et logs de navigation pour diagnostiquer 
                la cause exacte du blocage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
