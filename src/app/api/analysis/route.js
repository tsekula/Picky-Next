import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import sharp from 'sharp'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'
import { analyzeImage } from '../../../services/imageAnalysisService'
import { retrieveAndResizeImage } from '../../../services/ImagePreprocessingService'
import { saveAnalysisResults, updateImageAnalysisStatus } from '../../../services/analysisResultsService'

export async function GET(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user }, error } = await supabase.auth.getUser()


  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const imageId = searchParams.get('imageId')

  const { data, error: supabaseError } = await supabase
    .from('analysis_results')
    .select('*')
    .eq('image_id', imageId)

  if (supabaseError) {
    return NextResponse.json({ error: supabaseError.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request) {
 
  // Get the token from the Authorization header
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const token = authHeader.split(' ')[1]

  // Create a new Supabase client with the Bearer token
  const supabaseWithToken = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  })

  // Verify the token and get the user
  const { data: { user }, error } = await supabaseWithToken.auth.getUser()
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { image_id } = await request.json()

  // Update analysis status to 'pending'
  await updateImageAnalysisStatus(supabaseWithToken, image_id, 'pending')

  // Retrieve and resize the image
  const resizedImage = await retrieveAndResizeImage(supabaseWithToken, image_id)

  // Analyze the image
  const analysisResult = await analyzeImage(resizedImage.toString('base64'))

  // Save results to database
  const savedResult = await saveAnalysisResults(supabaseWithToken, image_id, analysisResult)

  // Update analysis status to 'complete'
  await updateImageAnalysisStatus(supabaseWithToken, image_id, 'complete')

  return NextResponse.json(savedResult, { status: 201 })
}

export async function DELETE(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  const { error } = await supabase
    .from('analysis_results')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Analysis result deleted successfully' })
}
