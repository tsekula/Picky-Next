/**
 * Image Analysis Service
 * 
 * This service provides functionality to analyze images using OpenAI's GPT-4 vision model
 * and manage the analysis results in a Supabase database.
 * The service uses the OpenAI API to analyze images and interacts with a Supabase
 * database to update image status, store analysis results, and retrieve image data.
 * It also includes functionality to resize images using the sharp library.
 */

import OpenAI from 'openai';
import sharp from 'sharp';
import { imageAnalysisPrompt, imageAnalysisSchema, imageAnalysisGPTModel, imageAnalysisImageMaxLongEdge, imageAnalysisResultsMaxTokens, embeddingModel, embeddingDimension } from '../config/llmconfig';

/**
 * Analyzes an image using OpenAI's GPT-4 vision model
 * @param {string} imageBase64 - Base64-encoded string representation of the image
 * @returns {Object} JSON object containing the analysis results
 */
export async function analyzeImage(imageBase64) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    try {
        const response = await openai.chat.completions.create({
            model: imageAnalysisGPTModel,
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: imageAnalysisPrompt },
                        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
                    ],
                },
            ],
            max_tokens: imageAnalysisResultsMaxTokens,
            response_format: {
                type: "json_schema",
                json_schema: imageAnalysisSchema
            }
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error('Error analyzing image:', error);
        throw new Error('Failed to analyze image');
    }
}

/**
 * Updates the analysis status of an image in the database
 * @param {Object} supabaseClient - Supabase client instance
 * @param {string} image_id - ID of the image in the database
 * @param {string} status - New analysis status to be set
 * @throws {Error} If the update fails
 */
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

function prepareTextRepresentation(analysisResult) {
    const textParts = [
        analysisResult.objects_detected.inanimate_objects.join(", "),
        analysisResult.objects_detected.text.join(", "),
        analysisResult.objects_detected.people,
        analysisResult.scene_description,
        analysisResult.qualitative_aspects
    ];
    return textParts.filter(Boolean).join(" ");
}

async function generateEmbedding(text) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.embeddings.create({
        model: embeddingModel,
        input: text,
    });
    return response.data[0].embedding;
}

export async function saveAnalysisResults(supabaseClient, image_id, analysisResult) {
    const textRepresentation = prepareTextRepresentation(analysisResult);
    const embedding = await generateEmbedding(textRepresentation);

    const { data, error } = await supabaseClient
        .from('images')
        .update({
            embedding: embedding,  // This is now a 1536-dimensional vector
            objects: analysisResult.objects_detected.inanimate_objects,
            text_detected: analysisResult.objects_detected.text,
            people: analysisResult.objects_detected.people,
            landmarks: analysisResult.objects_detected.landmarks,
            scene_description: analysisResult.scene_description,
            qualitative_aspects: analysisResult.qualitative_aspects,
            last_analyzed: new Date().toISOString()
        })
        .eq('id', image_id)
        .select();

    if (error) {
        console.error('Error saving analysis results:', error);
        throw new Error('Failed to save analysis results');
    }

    return data[0];
}

/**
 * Retrieves an image from Supabase storage and resizes it
 * @param {Object} supabaseClient - Supabase client instance
 * @param {string} image_id - ID of the image in the database
 * @returns {Buffer} Resized image data as a Buffer
 * @throws {Error} If image retrieval or resizing fails
 */
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
        .resize(imageAnalysisImageMaxLongEdge, imageAnalysisImageMaxLongEdge, { fit: 'inside', withoutEnlargement: true })
        .toBuffer();

    return resizedImage;
}
