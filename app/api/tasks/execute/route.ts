import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { executeAutomaticNavigation } from '@/lib/agent/playwright-agent'
import { z } from 'zod'

const ExecuteTaskSchema = z.object({
  taskId: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { taskId } = ExecuteTaskSchema.parse(body)

    const { data: task, error: taskError } = await supabase
      .from('agent_tasks')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', user.id)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ error: 'Tâche non trouvée' }, { status: 404 })
    }

    if (task.status !== 'queued') {
      return NextResponse.json(
        { error: 'La tâche ne peut pas être exécutée dans son état actuel' },
        { status: 400 }
      )
    }

    const { data: mandate, error: mandateError } = await supabase
      .from('mandates')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'signed')
      .single()

    if (mandateError || !mandate) {
      return NextResponse.json(
        { error: 'Aucun mandat valide. Veuillez signer un mandat avant d\'exécuter des tâches automatiques.' },
        { status: 403 }
      )
    }

    await supabase
      .from('agent_tasks')
      .update({
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .eq('id', taskId)

    await supabase.rpc('create_activity', {
      p_user_id: user.id,
      p_event_type: 'task_started',
      p_title: 'L\'agent travaille',
      p_description: `Navigation automatique vers ${task.target_site}`,
      p_task_id: taskId,
    })

    let credentials = { username: '', password: '' }
    
    if (task.requires_credentials && task.credentials_vault_key) {
      const { data: vaultCred, error: vaultError } = await supabase
        .from('vault_credentials')
        .select('encrypted_username, encrypted_password')
        .eq('user_id', user.id)
        .eq('service_name', task.credentials_vault_key)
        .single()

      if (vaultError || !vaultCred) {
        await supabase
          .from('agent_tasks')
          .update({
            status: 'failed',
            error_message: 'Identifiants non trouvés dans le coffre-fort',
          })
          .eq('id', taskId)

        return NextResponse.json(
          { error: 'Identifiants manquants' },
          { status: 400 }
        )
      }

      credentials = {
        username: vaultCred.encrypted_username,
        password: vaultCred.encrypted_password,
      }
    }

    const result = await executeAutomaticNavigation(task.target_site!, credentials)

    if (result.success) {
      await supabase
        .from('agent_tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          result: result,
          screenshots_urls: result.screenshots,
          execution_logs: result.logs,
        })
        .eq('id', taskId)

      await supabase.rpc('create_activity', {
        p_user_id: user.id,
        p_event_type: 'task_completed',
        p_title: 'Tâche terminée',
        p_description: `Navigation vers ${task.target_site} effectuée avec succès`,
        p_task_id: taskId,
      })
    } else {
      const newRetryCount = (task.retry_count || 0) + 1
      const shouldRetry = newRetryCount < task.max_retries

      await supabase
        .from('agent_tasks')
        .update({
          status: shouldRetry ? 'queued' : 'failed',
          error_message: result.error,
          retry_count: newRetryCount,
          screenshots_urls: result.screenshots,
          execution_logs: result.logs,
        })
        .eq('id', taskId)

      await supabase.rpc('create_activity', {
        p_user_id: user.id,
        p_event_type: 'task_failed',
        p_title: shouldRetry ? 'Tâche en attente de nouvelle tentative' : 'Tâche échouée',
        p_description: result.error || 'Erreur inconnue',
        p_task_id: taskId,
      })
    }

    return NextResponse.json({
      success: result.success,
      result,
    })

  } catch (error) {
    console.error('Erreur exécution tâche:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de l\'exécution de la tâche' },
      { status: 500 }
    )
  }
}
