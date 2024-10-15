// This file handles API routes for image analysis operations.
// It includes functions to retrieve, create, and delete analysis results.
// The file uses Supabase for authentication and database operations.

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import sharp from 'sharp'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'
import { analyzeImage, retrieveAndResizeImage, updateImageAnalysisStatus, saveAnalysisResults } from '../../../services/imageAnalysisService'

// Purpose: Retrieve analysis results for a specific image
// Inputs: imageId (via query parameter)
// Outputs: JSON response with analysis results or error message
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

// Purpose: Process and save analysis for a given image
// Inputs: image_id (via request body), Authorization token (via header)
// Outputs: JSON response with saved analysis result or error message
export async function POST(request) {
  // Authentication check
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const token = authHeader.split(' ')[1]

  // Create Supabase client with token
  const supabaseWithToken = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  })

  // Verify token and get user
  const { data: { user }, error } = await supabaseWithToken.auth.getUser()
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { image_id } = await request.json()

  try {
    console.log('Processing image:', image_id);
    await updateImageAnalysisStatus(supabaseWithToken, image_id, 'pending')
    const resizedImage = await retrieveAndResizeImage(supabaseWithToken, image_id)
    const analysisResult = await analyzeImage(resizedImage.toString('base64'))
    const savedResult = await saveAnalysisResults(supabaseWithToken, image_id, analysisResult)
    await updateImageAnalysisStatus(supabaseWithToken, image_id, 'complete')

    return NextResponse.json(savedResult, { status: 201 })
  } catch (error) {
    console.error('Error processing image analysis:', error)
    await updateImageAnalysisStatus(supabaseWithToken, image_id, 'failed')
    return NextResponse.json({ error: 'Failed to process image analysis' }, { status: 500 })
  }
}

// Purpose: Delete a specific analysis result
// Inputs: id (via query parameter)
// Outputs: JSON response confirming deletion or error message
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
