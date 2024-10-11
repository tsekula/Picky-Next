import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('images')
    .select('*')
    .eq('user_id', session.user.id)
    .order('uploaded_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Generate signed URLs for each image
  const imagesWithUrls = await Promise.all(data.map(async (image) => {
    const { data: { signedUrl } } = await supabase
      .storage
      .from('images')
      .createSignedUrl(image.file_path, 60 * 60) // URL valid for 1 hour

    return { ...image, signedUrl }
  }))

  return NextResponse.json(imagesWithUrls)
}

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { file_path, file_name, file_size, mime_type } = await request.json()

  const { data, error } = await supabase
    .from('images')
    .insert({
      user_id: session.user.id,
      file_path,
      file_name,
      file_size,
      mime_type
      // uploaded_at will be set to CURRENT_TIMESTAMP by default
      // last_analyzed and embedding are left as NULL for now
    })
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data[0])
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
    .from('images')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Image deleted successfully' })
}
