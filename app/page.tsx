import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Dashboard from '@/components/dashboard/Dashboard'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: activities } = await supabase
    .from('activity_feed')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const { data: tasks } = await supabase
    .from('agent_tasks')
    .select('*')
    .eq('user_id', user.id)
    .in('status', ['queued', 'running'])
    .order('created_at', { ascending: false })

  const { data: mandate } = await supabase
    .from('mandates')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'signed')
    .single()

  return (
    <Dashboard
      user={user}
      documents={documents || []}
      activities={activities || []}
      tasks={tasks || []}
      mandate={mandate}
    />
  )
}
