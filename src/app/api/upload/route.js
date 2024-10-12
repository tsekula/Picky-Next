import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

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

        const fileName = `${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
          .from('images')
          .upload(fileName, file);

        if (error) {
          console.error('Error uploading file:', error);
          throw error;
        }

        const { data: imageData, error: imageError } = await supabase
          .from('images')
          .insert({
            user_id: session.user.id,
            file_path: data.path,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type,
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

  return new Response(stream.readable, {
    headers: { 'Content-Type': 'application/json' },
  });
}
