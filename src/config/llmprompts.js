// OpenAI GPT model to be used for image analysis
// Latest pricing: https://openai.com/api/pricing/
export const imageAnalysisGPTModel = "gpt-4o";

// # of pixels in the longer edge of the image to be processed
export const imageAnalysisImageMaxLongEdge = 1536; 

// # of tokens in the results
export const imageAnalysisResultsMaxTokens = 500; 

export const imageAnalysisPrompt = `
Analyze this image and provide the following information:
1) Objects detected (including text, inanimate objects, people, landmarks),
2) Scene description,
3) Qualitative aspects (description of what the image is showing).
`;

export const imageAnalysisSchema = {
  name: "image_analysis",
  strict: true,
  schema: {
    type: "object",
    properties: {
      objects_detected: {
        type: "object",
        properties: {
          inanimate_objects: {
            type: "array",
            items: { type: "string" },
            description: "List of inanimate objects detected in the image."
          },
          text: {
            type: "array",
            items: { type: "string" },
            description: "List of text detected in the image."
          },
          people: {
            type: "string",
            description: "Description of people detected in the image."
          },
          landmarks: {
            type: "array",
            items: { type: "string" },
            description: "List of landmarks detected in the image."
          }
        },
        required: ["inanimate_objects", "text", "people", "landmarks"],
        additionalProperties: false
      },
      scene_description: {
        type: "string",
        description: "A detailed description of the scene in the image."
      },
      qualitative_aspects: {
        type: "string",
        description: "Qualitative aspects and overall impression of the image."
      }
    },
    required: ["objects_detected", "scene_description", "qualitative_aspects"],
    additionalProperties: false
  }
};
