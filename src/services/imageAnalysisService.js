import OpenAI from 'openai';
import { imageAnalysisPrompt, imageAnalysisSchema } from '../config/llmprompts';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeImage(imageBase64) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: imageAnalysisPrompt },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
          ],
        },
      ],
      max_tokens: 1000,
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

