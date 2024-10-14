import sharp from 'sharp';

export async function retrieveAndResizeImage(supabaseClient, image_id) {
  // Fetch the image record
  const { data: imageRecord, error: imageRecordError } = await supabaseClient
    .from('images')
    .select('file_path')
    .eq('id', image_id)
    .single();

  if (imageRecordError) throw new Error(`Error fetching image record: ${imageRecordError.message}`);
  if (!imageRecord) throw new Error('Image record not found');

  // Retrieve the image from storage
  const { data: imageData, error: imageError } = await supabaseClient
    .storage
    .from('images')
    .download(imageRecord.file_path);

  if (imageError) {
    console.error('Storage error:', imageError);
    throw new Error(`Error retrieving image: ${imageError.message}`);
  }

  if (!imageData) {
    throw new Error('No image data received');
  }

  // Convert the downloaded data to a Buffer
  const imageBuffer = Buffer.from(await imageData.arrayBuffer());

  // Resize image
  const resizedImage = await sharp(imageBuffer)
    .resize(768, 768, { fit: 'inside', withoutEnlargement: true })
    .toBuffer();

  return resizedImage;
}
