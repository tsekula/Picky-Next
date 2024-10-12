import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const files = formData.getAll('files');

  const uploadedFiles = [];

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  (async () => {
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Generate a unique filename
        const fileName = `${Date.now()}_${file.name}`;
        
        // Upload original file
        const { data, error } = await supabase.storage
          .from('images')
          .upload(fileName, file);

        if (error) {
          console.error('Error uploading file:', error);
          throw error;
        }

        // Generate thumbnail
        const buffer = await file.arrayBuffer();
        const thumbnail = await sharp(buffer)
          .resize(500, 500, { fit: 'inside', withoutEnlargement: true })
          .webp() // Convert to WebP format
          .toBuffer();

        // Upload thumbnail
        const thumbnailName = `thumb_${fileName.split('.')[0]}.webp`; // Add .webp extension
        const { data: thumbData, error: thumbError } = await supabase.storage
          .from('thumbnails')
          .upload(thumbnailName, thumbnail, {
            contentType: 'image/webp' // Specify the correct MIME type
          });

        if (thumbError) {
          console.error('Error uploading thumbnail:', thumbError);
          throw thumbError;
        }

        // Save image metadata to database
        const metadata = await sharp(buffer).metadata();
        const aspectRatio = metadata.width / metadata.height;

        const { data: imageData, error: imageError } = await supabase
          .from('images')
          .insert({
            user_id: session.user.id,
            file_path: data.path,
            thumbnail_path: thumbData.path,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type,
            aspect_ratio: aspectRatio,
          })
          .select();

        if (imageError) {
          console.error('Error saving image metadata:', imageError);
          throw imageError;
        }

        uploadedFiles.push(imageData[0]);

        await writer.write(encoder.encode(JSON.stringify({ progress: (i + 1) / files.length })));
      }

      await writer.close();
    } catch (error) {
      await writer.abort(error);
    }
  })();

  return new NextResponse(stream.readable, {
    headers: { 'Content-Type': 'application/json' },
  });
}
