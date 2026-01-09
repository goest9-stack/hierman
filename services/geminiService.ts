import { GoogleGenAI } from "@google/genai";
import { Message, Role, Attachment, GenerationConfig } from "../types";

// Helper to get the API client
const getClient = (): GoogleGenAI => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is set.");
  }
  return new GoogleGenAI({ apiKey });
};

export const streamResponse = async (
  modelName: string,
  history: Message[],
  prompt: string,
  currentAttachments: Attachment[],
  config: GenerationConfig,
  onChunk: (text: string) => void
): Promise<string> => {
  const ai = getClient();
  
  // Format history for the API
  // Filter out messages that had errors
  const validHistory = history.filter(m => !m.isError);

  // Construct the current message content
  const currentParts: any[] = [];
  
  // Add attachments first
  currentAttachments.forEach(att => {
    currentParts.push({
      inlineData: {
        mimeType: att.mimeType,
        data: att.data
      }
    });
  });

  // Add text prompt
  if (prompt) {
    currentParts.push({ text: prompt });
  }

  // If we have history, we use a chat session, otherwise just generate content
  // However, specifically for "Coporties" style which mimics a persistent studio,
  // let's use generateContentStream with explicit history management manually 
  // or use chat. For simplicity and robustness with files, we'll construct the
  // full conversation context if needed, but the Chat API is cleaner.

  // NOTE: Chat API handles history, but we need to map our custom Message type to it.
  // Images in history can be tricky with Chat API in some versions, but 
  // let's try the stateless generateContent approach by passing full history + new content
  // if we wanted full control. But ai.chats.create is standard.
  
  try {
    const chat = ai.chats.create({
      model: modelName,
      config: {
        temperature: config.temperature,
        topP: config.topP,
        topK: config.topK,
        systemInstruction: config.systemInstruction
      },
      history: validHistory.map(m => ({
        role: m.role,
        parts: [
          ... (m.attachments?.map(a => ({
            inlineData: { mimeType: a.mimeType, data: a.data }
          })) || []),
          { text: m.text }
        ]
      }))
    });

    const result = await chat.sendMessageStream({
      message: currentParts
    });

    let fullText = "";
    for await (const chunk of result) {
      const chunkText = chunk.text || "";
      fullText += chunkText;
      onChunk(fullText);
    }
    return fullText;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const fileToGenerativePart = async (file: File): Promise<Attachment> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // remove data:image/jpeg;base64, prefix
      const base64Data = base64String.split(',')[1];
      resolve({
        mimeType: file.type,
        data: base64Data,
        name: file.name
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};