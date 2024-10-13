import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import sharp from 'sharp'
import OpenAI from 'openai'

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
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { image_id } = await request.json()

  // Update analysis status to 'pending'
  await supabase
    .from('images')
    .update({ analysis_status: 'pending' })
    .eq('id', image_id)

  try {
    // Retrieve the original image from storage
    const { data: imageData, error: imageError } = await supabase
      .storage
      .from('images')
      .download(`${image_id}`)

    if (imageError) throw new Error('Error retrieving image')

    // Resize image if necessary
    const resizedImage = await sharp(imageData)
      .resize(768, 768, { fit: 'inside', withoutEnlargement: true })
      .toBuffer()

    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    // Send image for analysis
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this image and provide the following information in JSON format: 1) Objects detected (including text, inanimate objects, people, landmarks), 2) Scene description, 3) Qualitative aspects (description of what the image is showing)" },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${resizedImage.toString('base64')}` } },
          ],
        },
      ],
      max_tokens: 500,
    })

    const analysisResult = JSON.parse(response.choices[0].message.content)

    // Mock writing results to database
    const { data, error } = await supabase
      .from('analysis_results')
      .insert({
        image_id,
        objects: analysisResult.objects,
        scene: analysisResult.scene,
        description: analysisResult.qualitative_aspects
      })
      .select()

    if (error) throw new Error('Error saving analysis results')

    // Update analysis status to 'complete'
    await supabase
      .from('images')
      .update({ analysis_status: 'complete' })
      .eq('id', image_id)

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('Analysis error:', error)

    // Update analysis status to 'failed' if there's an error
    await supabase
      .from('images')
      .update({ analysis_status: 'failed' })
      .eq('id', image_id)

    return NextResponse.json({ error: error.message }, { status: 500 })
  }
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
