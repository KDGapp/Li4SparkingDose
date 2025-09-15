import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { SocialMediaPost } from '../types';

const postSchema = {
  type: Type.OBJECT,
  properties: {
    platform: {
      type: Type.STRING,
      description: "The social media platform (e.g., 'Instagram', 'Twitter', 'Facebook', 'WhatsApp', 'TikTok').",
      enum: ['Instagram', 'Twitter', 'Facebook', 'WhatsApp', 'TikTok'],
    },
    content: {
      type: Type.STRING,
      description: "The main text content of the social media post. Should be engaging and relevant to the topic.",
    },
    hashtags: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: "An array of relevant hashtags, without the '#' symbol.",
    },
  },
  required: ['platform', 'content', 'hashtags'],
};

const getStyleInstruction = (style: string): string => {
  switch (style) {
    case 'simple_elegant':
      return "The content for each post should be a simple and elegant statement. The tone should be graceful, concise, and beautiful, using clear language that is easy to understand but carries a sophisticated feel.";
    case 'simple_truth':
      return "The content for each post should highlight a simple but profoundly important truth about life. The tone should be direct, honest, and impactful, focusing on fundamental concepts that everyone can relate to.";
    case 'provocative_parable':
      return "The content for each post should be a provocative parable or a sharp, cutting analogy. The tone should be edgy and thought-provoking, designed to challenge the audience's perspective and leave a lasting impression. It should avoid direct advice, instead using powerful comparisons.";
    case 'insightful_question':
      return "The content for each post should be a single, powerful, and insightful question that makes people stop and reflect on simple, relatable aspects of their lives. The tone should be curious and introspective, encouraging discussion.";
    case 'deep_metaphor':
    default:
      return "The content for each post should be a profound, thought-provoking statement intended for a wide audience. Embody the following styles:\n- Use deep metaphors (\"kiasan mendalam\") and elegant, simple language.\n- Avoid direct advice. Instead, craft sharp analogies, provocative comparisons, or insightful questions that make people reflect on simple, relatable aspects of life.\n- The tone should be philosophical and memorable.";
  }
};

export const generatePostIdeas = async (topic: string, language: string, style: string, apiKey: string): Promise<SocialMediaPost[]> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please provide a valid Google AI API Key.");
  }
  const ai = new GoogleGenAI({ apiKey });

  const styleInstruction = getStyleInstruction(style);

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate 5 creative and distinct social media post ideas for the topic: "${topic}". The platforms should include Instagram, Twitter, Facebook, WhatsApp Status, and TikTok. ${styleInstruction}\nAll content, including hashtags, must be in the following language: ${language}. For each post, provide a platform, engaging content, and relevant hashtags.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: postSchema,
        },
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("API returned an empty response for post ideas.");
    }

    const parsedResponse = JSON.parse(jsonText);
    return parsedResponse as SocialMediaPost[];
  } catch (error) {
    console.error("Error generating post ideas:", error);
    throw new Error("Failed to generate post ideas from AI. The model may be unavailable or the topic could be too sensitive.");
  }
};

export const generateImageFromPrompt = async (prompt: string, apiKey: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please provide a valid Google AI API Key to generate images.");
  }
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `Create a visually stunning, high-quality background image for a social media post about: "${prompt}". Abstract and artistic is preferred.`,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return base64ImageBytes;
    } else {
      throw new Error("AI did not return any images.");
    }
  } catch (error) {
    console.error("Error generating image from prompt:", error);
    throw new Error("Failed to generate image from AI. The model may be unavailable or the prompt could be too sensitive.");
  }
};