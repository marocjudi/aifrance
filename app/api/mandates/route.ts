import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const CreateMandateSchema = z.object({
  authorizedSites: z.array(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { authorizedSites } = CreateMandateSchema.parse(body)

    const legalText = `MANDAT DE REPRÉSENTATION LÉGALE

Article 1984 du Code Civil français : "Le mandat ou procuration est un acte par lequel une personne donne à une autre le pouvoir de faire quelque chose pour le mandant et en son nom."

Je soussigné(e), ${user.email}, donne mandat à MANDAT.AI pour :
- Accéder aux portails administratifs suivants : ${(authorizedSites || ['impots.gouv.fr', 'ameli.fr', 'caf.fr']).join(', ')}
- Consulter mes informations personnelles et documents administratifs
- Remplir des formulaires en mon nom
- Télécharger des documents officiels
- Effectuer des démarches courantes

Ce mandat est révocable à tout moment depuis mon espace utilisateur.

Durée : 1 an renouvelable
Date : ${new Date().toLocaleDateString('fr-FR')}
`

    const yousignApiKey = process.env.YOUSIGN_API_KEY

    if (!yousignApiKey) {
      const { data: mandate, error: insertError } = await supabase
        .from('mandates')
        .insert({
          user_id: user.id,
          status: 'pending',
          authorized_sites: authorizedSites || ['impots.gouv.fr', 'ameli.fr', 'caf.fr'],
          legal_text: legalText,
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single()

      if (insertError) throw insertError

      return NextResponse.json({
        success: true,
        mandate,
        message: 'Configuration Yousign manquante - mode développement',
      })
    }

    const yousignResponse = await fetch('https://api.yousign.app/v3/signature_requests', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${yousignApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `Mandat MANDAT.AI - ${user.email}`,
        delivery_mode: 'email',
        timezone: 'Europe/Paris',
        email_custom_note: 'Merci de signer ce mandat pour activer votre agent administratif.',
        signers: [
          {
            info: {
              first_name: user.user_metadata?.first_name || 'Utilisateur',
              last_name: user.user_metadata?.last_name || 'Mandat.ai',
              email: user.email,
              locale: 'fr',
            },
            signature_level: 'electronic_signature',
            signature_authentication_mode: 'otp_email',
          },
        ],
        documents: [
          {
            nature: 'signable_document',
            parse_anchors: true,
            content: Buffer.from(legalText).toString('base64'),
            name: 'Mandat de représentation.txt',
          },
        ],
      }),
    })

    const yousignData = await yousignResponse.json()

    if (!yousignResponse.ok) {
      console.error('Erreur Yousign:', yousignData)
      throw new Error('Erreur lors de la création de la demande de signature')
    }

    const { data: mandate, error: insertError } = await supabase
      .from('mandates')
      .insert({
        user_id: user.id,
        status: 'pending',
        yousign_signature_request_id: yousignData.id,
        authorized_sites: authorizedSites || ['impots.gouv.fr', 'ameli.fr', 'caf.fr'],
        legal_text: legalText,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    await supabase.rpc('create_activity', {
      p_user_id: user.id,
      p_event_type: 'mandate_created',
      p_title: 'Mandat créé',
      p_description: 'Demande de signature envoyée par email',
    })

    return NextResponse.json({
      success: true,
      mandate,
      yousignData,
    })

  } catch (error) {
    console.error('Erreur création mandat:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création du mandat' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { data: mandates, error } = await supabase
      .from('mandates')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ mandates })

  } catch (error) {
    console.error('Erreur récupération mandats:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des mandats' },
      { status: 500 }
    )
  }
}
