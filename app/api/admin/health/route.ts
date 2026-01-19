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

    const services = [
      { name: 'Supabase', check: checkSupabase },
      { name: 'Claude AI', check: checkClaude },
      { name: 'Storage', check: checkStorage },
    ]

    const healthChecks = await Promise.all(
      services.map(async (service) => {
        const start = Date.now()
        try {
          await service.check(supabase)
          return {
            service_name: service.name,
            status: 'operational' as const,
            response_time_ms: Date.now() - start,
            last_check: new Date().toISOString(),
          }
        } catch (error) {
          return {
            service_name: service.name,
            status: 'down' as const,
            response_time_ms: Date.now() - start,
            last_check: new Date().toISOString(),
            error_message: error instanceof Error ? error.message : 'Unknown error',
          }
        }
      })
    )

    return NextResponse.json({ services: healthChecks })

  } catch (error) {
    console.error('Erreur health check:', error)
    return NextResponse.json(
      { error: 'Erreur lors du health check' },
      { status: 500 }
    )
  }
}

async function checkSupabase(supabase: any) {
  const { error } = await supabase.from('users').select('id').limit(1)
  if (error) throw error
}

async function checkClaude(supabase: any) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured')
  }
}

async function checkStorage(supabase: any) {
  const { data, error } = await supabase.storage.listBuckets()
  if (error) throw error
}
