import { GoogleGenAI, Chat, GenerateContentResponse, Type } from "@google/genai";
import { Message, TauriConfigParams } from "../types";
import { GEMINI_MODEL_CHAT, GEMINI_MODEL_CONFIG, SYSTEM_INSTRUCTION } from "../constants";

// Helper to get client instance
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is not defined in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export class GeminiService {
  private chatSession: Chat | null = null;

  public async *streamChat(history: Message[], newMessage: string): AsyncGenerator<string, void, unknown> {
    const ai = getAiClient();
    
    if (!this.chatSession) {
      // Initialize chat with history if needed, though for simplicity here we often just start fresh or map history manually
      // The SDK's chats.create maintains its own history if we reuse the object.
      // If we want to support full conversation restore, we would map `history` to Content objects here.
      this.chatSession = ai.chats.create({
        model: GEMINI_MODEL_CHAT,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingBudget: 1024 }, // Enable thinking for complex Rust logic
        },
      });
    }

    try {
      const resultStream = await this.chatSession.sendMessageStream({ message: newMessage });

      for await (const chunk of resultStream) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          yield c.text;
        }
      }
    } catch (error) {
      console.error("Error streaming chat:", error);
      yield "I encountered an error while communicating with the Tauri Nexus core. Please check your API key or try again.";
    }
  }

  public async generateTauriConfig(params: TauriConfigParams): Promise<string> {
    const ai = getAiClient();
    
    const prompt = `Generate a tauri.conf.json configuration based on these requirements:
    - App Name: ${params.appName}
    - Window Title: ${params.windowTitle}
    - Identifier: ${params.identifier}
    - Initial Size: ${params.width}x${params.height}
    - Resizable: ${params.resizable}
    - Fullscreen: ${params.fullscreen}
    - Security Relaxed: ${params.securityRelaxed}
    
    Return ONLY the raw JSON content, no markdown formatting.`;

    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_MODEL_CONFIG,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          // We can use a schema for strict JSON generation
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              package: {
                type: Type.OBJECT,
                properties: {
                  productName: { type: Type.STRING },
                  version: { type: Type.STRING }
                }
              },
              tauri: {
                type: Type.OBJECT,
                properties: {
                  bundle: {
                    type: Type.OBJECT,
                    properties: {
                      identifier: { type: Type.STRING }
                    }
                  },
                  windows: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        width: { type: Type.NUMBER },
                        height: { type: Type.NUMBER },
                        resizable: { type: Type.BOOLEAN },
                        fullscreen: { type: Type.BOOLEAN }
                      }
                    }
                  },
                  security: {
                    type: Type.OBJECT,
                    properties: {
                      csp: { type: Type.STRING, nullable: true }
                    }
                  }
                }
              }
            }
          }
        }
      });
      return response.text || "{}";
    } catch (error) {
      console.error("Config generation error:", error);
      throw error;
    }
  }

  public async explainArchitectureNode(nodeLabel: string): Promise<string> {
    const ai = getAiClient();
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL_CONFIG, // Flash is faster/sufficient for simple explanations
        contents: `Explain the role of "${nodeLabel}" in the context of Tauri Architecture briefly (max 2 sentences).`,
      });
      return response.text || "No explanation available.";
    } catch (e) {
      return "Error retrieving explanation.";
    }
  }
}

export const geminiService = new GeminiService();
