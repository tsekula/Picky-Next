export async function saveAnalysisResults(supabaseClient, image_id, analysisResult) {
  const { data, error } = await supabaseClient
    .from('analysis_results')
    .insert({
      image_id,
      objects: analysisResult.objects_detected,
      scene: analysisResult.scene_description,
      description: analysisResult.qualitative_aspects
    })
    .select();

  if (error) {
    console.error('Error saving analysis results:', error);
    throw new Error('Failed to save analysis results');
  }

  return data[0];
}

export async function updateImageAnalysisStatus(supabaseClient, image_id, status) {
  const { error } = await supabaseClient
    .from('images')
    .update({ analysis_status: status })
    .eq('id', image_id);

  if (error) {
    console.error(`Error updating image analysis status to ${status}:`, error);
    throw new Error(`Failed to update image analysis status to ${status}`);
  }
}

