import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { embeddingModel } from '../../../config/llmconfig'

export async function GET(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const embeddingResponse = await openai.embeddings.create({
    model: embeddingModel,
    input: query,
  })
  const embedding = embeddingResponse.data[0].embedding

  const { data, error: searchError } = await supabase.rpc('match_images', {
    query_embedding: embedding,
    match_threshold: 0.8,
    match_count: 20,
    current_user_id: user.id
  })

  if (searchError) {
    return NextResponse.json({ error: searchError.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
