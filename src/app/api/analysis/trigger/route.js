import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get list of unprocessed images
    const { data: unprocessedImages, error: fetchError } = await supabase
      .from('images')
      .select('id')
      .eq('analysis_status', 'unprocessed')
      .eq('user_id', session.user.id)

    if (fetchError) {
      throw fetchError
    }

    // Trigger analysis for each unprocessed image
    // TODO: Fix the API call from backend   
    const analysisPromises = unprocessedImages.map(async (image) => {
      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image_id: image.id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Analysis failed for image ${image.id}: ${errorData.error}`)
      }

      return response.json()
    })

    // Execute all analysis promises concurrently
    const results = await Promise.all(analysisPromises)

    return NextResponse.json({ 
      message: `Analysis triggered for ${unprocessedImages.length} images`,
      results 
    })
  } catch (error) {
    console.error('Error triggering analysis:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
