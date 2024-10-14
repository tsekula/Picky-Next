import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Get the host and port from environment variables
const API_HOST = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost'
const API_PORT = process.env.NEXT_PUBLIC_API_PORT || '3000'

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

    // Construct the full URL for the analysis endpoint
    const analysisUrl = `${API_HOST}:${API_PORT}/api/analysis`

    // Trigger analysis for each unprocessed image
    const analysisPromises = unprocessedImages.map(async (image) => {
      const response = await fetch(analysisUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ image_id: image.id }),
        credentials: 'include',
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
