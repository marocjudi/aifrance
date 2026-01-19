import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import VaultDashboard from '@/components/vault/VaultDashboard'

export default async function VaultPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .in('document_type', ['identity', 'tax', 'health', 'social'])
    .order('created_at', { ascending: false })

  const { data: credentials } = await supabase
    .from('vault_credentials')
    .select('id, service_name, service_url, last_used_at, is_valid, created_at')
    .eq('user_id', user.id)

  return <VaultDashboard documents={documents || []} credentials={credentials || []} />
}
