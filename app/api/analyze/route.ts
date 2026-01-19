import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic, MANDAT_SYSTEM_PROMPT } from '@/lib/ai/claude'
import { z } from 'zod'

const AnalyzeRequestSchema = z.object({
  documentId: z.string().uuid(),
  extractedText: z.string().min(10),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { documentId, extractedText } = AnalyzeRequestSchema.parse(body)

    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 })
    }

    await supabase
      .from('documents')
      .update({ analysis_status: 'processing' })
      .eq('id', documentId)

    await supabase.rpc('create_activity', {
      p_user_id: user.id,
      p_event_type: 'document_analysis_started',
      p_title: 'Analyse en cours',
      p_description: `L'agent analyse votre document : ${document.filename}`,
      p_document_id: documentId,
    })

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      temperature: 0.2,
      system: MANDAT_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Analyse ce document administratif et fournis un plan d'action structuré.\n\nTEXTE DU DOCUMENT :\n${extractedText}`,
        },
      ],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    
    let analysisResult
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Format JSON non trouvé dans la réponse')
      }
    } catch (parseError) {
      console.error('Erreur de parsing JSON:', parseError)
      analysisResult = {
        status: 'analysis_complete',
        urgency: 'medium',
        summary: responseText.slice(0, 200),
        action_plan: {
          type: 'manual_action',
          next_steps: ['Analyse manuelle requise'],
        },
      }
    }

    const urgencyMapping: Record<string, string> = {
      critical: 'critical',
      high: 'high',
      medium: 'medium',
      low: 'low',
    }
    const urgencyLevel = urgencyMapping[analysisResult.urgency] || 'medium'

    const { error: updateError } = await supabase
      .from('documents')
      .update({
        analysis_status: 'completed',
        analysis_result: analysisResult,
        analyzed_at: new Date().toISOString(),
        urgency_level: urgencyLevel,
        deadline_date: analysisResult.deadline || null,
      })
      .eq('id', documentId)

    if (updateError) {
      throw updateError
    }

    await supabase.rpc('create_activity', {
      p_user_id: user.id,
      p_event_type: 'document_analysis_completed',
      p_title: 'Analyse terminée',
      p_description: analysisResult.summary,
      p_document_id: documentId,
    })

    if (analysisResult.action_plan?.type === 'automatic_navigation') {
      const { data: taskData } = await supabase
        .from('agent_tasks')
        .insert({
          user_id: user.id,
          document_id: documentId,
          task_type: 'automatic_navigation',
          target_site: analysisResult.action_plan.target_site,
          navigation_plan: analysisResult.action_plan,
          status: 'queued',
        })
        .select()
        .single()

      if (taskData) {
        await supabase.rpc('create_activity', {
          p_user_id: user.id,
          p_event_type: 'task_created',
          p_title: 'Action automatique planifiée',
          p_description: `L'agent va se connecter à ${analysisResult.action_plan.target_site}`,
          p_task_id: taskData.id,
        })
      }
    }

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      documentId,
    })

  } catch (error) {
    console.error('Erreur lors de l\'analyse:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de l\'analyse du document' },
      { status: 500 }
    )
  }
}
