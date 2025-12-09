import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ImageSize } from "../types";

// Helper to get the AI client
// Note: We create a new instance each time to ensure we capture the latest API Key if it changes (e.g. via selection)
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateMockup = async (
  logoBase64: string, 
  productType: string,
  customPrompt?: string
): Promise<string[]> => {
  const ai = getAiClient();
  const prompt = customPrompt || `Create a professional, high-quality product mockup of a ${productType} featuring this logo. The logo should be clearly visible and naturally applied to the surface. The background should be clean and studio-lit.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/png',
            data: logoBase64
          }
        },
        { text: prompt }
      ]
    }
  });

  return extractImagesFromResponse(response);
};

export const editImageWithPrompt = async (
  imageBase64: string,
  prompt: string
): Promise<string[]> => {
  const ai = getAiClient();
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/png',
            data: imageBase64
          }
        },
        { text: prompt }
      ]
    }
  });

  return extractImagesFromResponse(response);
};

export const generateProImage = async (
  prompt: string,
  size: ImageSize = ImageSize.SIZE_1K
): Promise<string[]> => {
  const ai = getAiClient();
  
  // 'gemini-3-pro-image-preview' supports imageSize config
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [
        { text: prompt }
      ]
    },
    config: {
      imageConfig: {
        imageSize: size,
        aspectRatio: '1:1' // Defaulting to square for simplicity, could be exposed
      }
    }
  });

  return extractImagesFromResponse(response);
};

const extractImagesFromResponse = (response: GenerateContentResponse): string[] => {
  const images: string[] = [];
  
  if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        const base64 = part.inlineData.data;
        // The API returns raw base64, we need to prefix it for the browser
        // Assuming PNG or JPEG based on common outputs, but mostly valid to just use generic
        images.push(`data:image/png;base64,${base64}`);
      }
    }
  }
  
  return images;
};

// Helper to check for API Key selection for Pro models
export const ensureApiKeySelected = async (): Promise<boolean> => {
  if (typeof (window as any).aistudio !== 'undefined') {
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
      // We assume success if the dialog closes and we continue, 
      // though robust apps might check again.
      return true;
    }
    return true;
  }
  return true; // Fallback for dev environments without the wrapper
};
