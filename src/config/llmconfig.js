// OpenAI GPT model to be used for image analysis
// Latest pricing: https://openai.com/api/pricing/
export const imageAnalysisGPTModel = "gpt-4o";

// OpenAI embedding model for generating vector representations
export const embeddingModel = "text-embedding-ada-002";
//export const embeddingDimension = 1536;

// # of pixels in the longer edge of the image to be processed
export const imageAnalysisImageMaxLongEdge = 1536; 

// # of tokens in the results
export const imageAnalysisResultsMaxTokens = 500; 

// Prompt for image analysis sent to the LLM
export const imageAnalysisPrompt = `
Analyze this image and provide the following information:
1) Objects detected (including text, inanimate objects, people, landmarks),
2) Scene description,
3) Qualitative aspects (description of what the image is showing).
Does not use unnecessary words such as "this image shows" or "the image is about".
Use clauses instead of sentences.
`;

// Schema for image analysis returned by the LLM
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
            description: "Comprehensive list of noticeable inanimate objects detected in the image."
          },
          text: {
            type: "array",
            items: { type: "string" },
            description: "List of text detected in the image."
          },
          people: {
            type: "string",
            description: "Description of people detected in the image. If no people are detected, return an empty list."
          },
          landmarks: {
            type: "array",
            items: { type: "string" },
            description: "Keyword list of landmarks detected in the image."
          }
        },
        required: ["inanimate_objects", "text", "people", "landmarks"],
        additionalProperties: false
      },
      scene_description: {
        type: "string",
        description: "A description of the scene in the image. "
      },
      qualitative_aspects: {
        type: "string",
        description: "A description of the qualitative aspects and overall impression of the image."
      }
    },
    required: ["objects_detected", "scene_description", "qualitative_aspects"],
    additionalProperties: false
  }
};
