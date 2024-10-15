import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const imageId = searchParams.get('id')

  if (imageId) {
    // Handle single image request
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .eq('id', imageId)
      .eq('user_id', session.user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } else {
    // Handle list of images request
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .eq('user_id', session.user.id)
      .order('uploaded_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Generate signed URLs for full-size images and public URLs for thumbnails
    const imagesWithUrls = await Promise.all(data.map(async (image) => {
      const { data: { signedUrl } } = await supabase
        .storage
        .from('images')
        .createSignedUrl(image.file_path, 60 * 60) // URL valid for 1 hour

      const thumbnailUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/thumbnails/${image.thumbnail_path}`

      return { 
        signedUrl, 
        thumbnailUrl, 
        id: image.id, 
        file_name: image.file_name, 
        uploaded_at: image.uploaded_at 
      }
    }))

    const response = NextResponse.json(imagesWithUrls)
    response.headers.set('Cache-Control', 'no-store')
    return response
  }
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

  // Delete image from storage
  const { data: image } = await supabase
    .from('images')
    .select('file_path')
    .eq('id', id)
    .single()

  if (image) {
    const { error: storageError } = await supabase
      .storage
      .from('images')
      .remove([image.file_path])

    if (storageError) {
      console.error('Error deleting image from storage:', storageError)
    }
  }

  // Delete image from database
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
