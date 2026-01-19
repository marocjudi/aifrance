import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import pdf from 'pdf-parse'

const UploadSchema = z.object({
  filename: z.string(),
  documentType: z.enum(['identity', 'tax', 'health', 'social', 'housing', 'other']),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentType = formData.get('documentType') as string
    
    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    const { filename, documentType: type } = UploadSchema.parse({
      filename: file.name,
      documentType: documentType || 'other',
    })

    const fileBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(fileBuffer)
    
    const timestamp = Date.now()
    const storagePath = `${user.id}/${timestamp}-${filename}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      throw uploadError
    }

    let extractedText = ''
    
    if (file.type === 'application/pdf') {
      try {
        const pdfData = await pdf(buffer)
        extractedText = pdfData.text
      } catch (pdfError) {
        console.error('Erreur extraction PDF:', pdfError)
      }
    }

    const { data: document, error: insertError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        filename,
        file_size: file.size,
        mime_type: file.type,
        storage_path: storagePath,
        document_type: type,
        extracted_text: extractedText || null,
        analysis_status: 'pending',
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    await supabase.rpc('create_activity', {
      p_user_id: user.id,
      p_event_type: 'document_uploaded',
      p_title: 'Document déposé',
      p_description: `Nouveau document : ${filename}`,
      p_document_id: document.id,
    })

    if (extractedText && extractedText.length > 50) {
      const analyzeResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: document.id,
          extractedText,
        }),
      })

      if (!analyzeResponse.ok) {
        console.error('Erreur auto-analyse:', await analyzeResponse.text())
      }
    }

    return NextResponse.json({
      success: true,
      document,
    })

  } catch (error) {
    console.error('Erreur upload:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de l\'upload du document' },
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

    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ documents })

  } catch (error) {
    console.error('Erreur récupération documents:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des documents' },
      { status: 500 }
    )
  }
}
