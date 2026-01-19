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

    const { data: metrics, error } = await supabase
      .from('admin_realtime_metrics')
      .select('*')
      .single()

    if (error) {
      throw error
    }

    const { data: successRate } = await supabase.rpc('admin_get_success_rate', { days: 7 })

    return NextResponse.json({
      metrics: {
        ...metrics,
        success_rate: successRate || 0,
      }
    })

  } catch (error) {
    console.error('Erreur récupération métriques:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des métriques' },
      { status: 500 }
    )
  }
}
