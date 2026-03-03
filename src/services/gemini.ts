import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
};

export async function removeWatermark(imageBase64: string, prompt: string = "Please remove the watermark from this image. Focus on the areas that might be marked or are clearly watermarks. The output should be the clean image without any artifacts."): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "") {
    throw new Error("API_KEY_MISSING");
  }

  const ai = getAI();
  
  // Extract base64 data (remove prefix if present)
  const base64Data = imageBase64.split(',')[1] || imageBase64;
  const mimeType = imageBase64.split(';')[0].split(':')[1] || 'image/png';

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image returned from Gemini");
}
