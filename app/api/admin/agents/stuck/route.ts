import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { data: adminRole } = await supabase
      .from('admin_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!adminRole) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { data: stuckAgents, error } = await supabase
      .from('admin_stuck_agents')
      .select('*')

    if (error) {
      throw error
    }

    return NextResponse.json({ stuckAgents })

  } catch (error) {
    console.error('Erreur récupération stuck agents:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des agents bloqués' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { data: adminRole } = await supabase
      .from('admin_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!adminRole) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { taskId, action } = await request.json()

    if (action === 'reset') {
      const { data, error } = await supabase.rpc('admin_reset_task', {
        task_id_param: taskId,
        admin_id_param: user.id,
      })

      if (error) throw error

      return NextResponse.json({ success: true, message: 'Tâche réinitialisée' })
    } else if (action === 'flag') {
      const { data, error } = await supabase.rpc('admin_flag_stuck_agent', {
        task_id_param: taskId,
        admin_id_param: user.id,
      })

      if (error) throw error

      return NextResponse.json({ success: true, message: 'Agent marqué pour intervention manuelle' })
    }

    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })

  } catch (error) {
    console.error('Erreur action stuck agent:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'action' },
      { status: 500 }
    )
  }
}
