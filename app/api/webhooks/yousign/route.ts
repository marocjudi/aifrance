import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const headersList = await headers()
    
    const signature = headersList.get('x-yousign-signature')
    const body = await request.text()

    if (process.env.YOUSIGN_WEBHOOK_SECRET && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.YOUSIGN_WEBHOOK_SECRET)
        .update(body)
        .digest('hex')

      if (signature !== expectedSignature) {
        console.error('Signature webhook invalide')
        return NextResponse.json({ error: 'Signature invalide' }, { status: 401 })
      }
    }

    const event = JSON.parse(body)

    if (event.event_name === 'signature_request.done') {
      const signatureRequestId = event.data.signature_request.id

      const { data: mandate, error: findError } = await supabase
        .from('mandates')
        .select('*')
        .eq('yousign_signature_request_id', signatureRequestId)
        .single()

      if (findError || !mandate) {
        console.error('Mandat non trouvé:', signatureRequestId)
        return NextResponse.json({ error: 'Mandat non trouvé' }, { status: 404 })
      }

      const { error: updateError } = await supabase
        .from('mandates')
        .update({
          status: 'signed',
          signed_at: new Date().toISOString(),
        })
        .eq('id', mandate.id)

      if (updateError) {
        throw updateError
      }

      await supabase.rpc('create_activity', {
        p_user_id: mandate.user_id,
        p_event_type: 'mandate_signed',
        p_title: 'Mandat signé avec succès',
        p_description: 'L\'agent peut maintenant agir en votre nom',
      })

      console.log('Mandat signé:', mandate.id)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erreur webhook Yousign:', error)
    return NextResponse.json(
      { error: 'Erreur lors du traitement du webhook' },
      { status: 500 }
    )
  }
}
