import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { imageIds } = await request.json()

  // Fetch file paths before deletion
  const { data: filePaths, error: fetchError } = await supabase
    .from('images')
    .select('file_path, thumbnail_path')  // Add thumbnail_path here
    .in('id', imageIds)
    .eq('user_id', session.user.id)

  if (fetchError) {
    console.error('Error fetching file paths:', fetchError)
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  // Delete images from the database
  const { data: deletedData, error: deleteError } = await supabase
    .from('images')
    .delete()
    .in('id', imageIds)
    .eq('user_id', session.user.id)

  if (deleteError) {
    console.error('Error deleting images:', deleteError)
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  // Delete files from storage
  const storageErrors = []
  for (const { file_path, thumbnail_path } of filePaths) {
    const { error: storageError } = await supabase
      .storage
      .from('images')
      .remove([file_path]);

    const { error: thumbnailError } = await supabase
      .storage
      .from('thumbnails')
      .remove([thumbnail_path]);

    if (storageError || thumbnailError) {
      console.error(`Deletion error for ${file_path}:`, storageError || thumbnailError);
      storageErrors.push({ file_path, error: (storageError || thumbnailError).message });
    }
  }

  if (storageErrors.length > 0) {
    return NextResponse.json({ 
      error: 'Some images were deleted from database but not from storage', 
      details: storageErrors 
    }, { status: 500 })
  }

  return NextResponse.json({ message: `${filePaths.length} image(s) deleted successfully` })
}
