// Google Gemini API 통합
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ApiKeyService, decryptApiKey } from '../db';

export interface GeminiTextRequest {
  model?: string;
  prompt: string;
  temperature?: number;
  maxOutputTokens?: number;
}

export class GeminiClient {
  private client: GoogleGenerativeAI | null = null;

  constructor() {
    this.initClient();
  }

  private initClient() {
    // 먼저 DB에서 API 키를 찾음
    const apiKey = ApiKeyService.getActive('gemini');
    if (apiKey) {
      try {
        const decryptedKey = decryptApiKey(apiKey.encryptedKey);
        this.client = new GoogleGenerativeAI(decryptedKey);
        return;
      } catch (error) {
        console.error('Failed to decrypt Gemini API key from DB:', error);
      }
    }

    // DB에 없으면 환경 변수에서 직접 읽기 (Vercel 등 서버리스 환경 대응)
    if (process.env.GOOGLE_API_KEY) {
      this.client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
      console.log('Using Gemini API key from environment variable');
    }
  }

  async generateText(request: GeminiTextRequest) {
    if (!this.client) {
      throw new Error('Gemini client not initialized. Please add an API key.');
    }

    const startTime = Date.now();

    try {
      const model = this.client.getGenerativeModel({
        model: request.model || 'gemini-pro',
      });

      const result = await model.generateContent(request.prompt);
      const response = await result.response;
      const text = response.text();

      const duration = Date.now() - startTime;

      return {
        success: true,
        data: {
          text,
          response,
        },
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        error: error.message || 'Unknown error',
        duration,
      };
    }
  }

  async generateTextWithImage(prompt: string, imageData: string) {
    if (!this.client) {
      throw new Error('Gemini client not initialized. Please add an API key.');
    }

    const startTime = Date.now();

    try {
      const model = this.client.getGenerativeModel({
        model: 'gemini-pro-vision',
      });

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageData,
            mimeType: 'image/jpeg',
          },
        },
      ]);

      const response = await result.response;
      const text = response.text();

      const duration = Date.now() - startTime;

      return {
        success: true,
        data: {
          text,
          response,
        },
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        error: error.message || 'Unknown error',
        duration,
      };
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }
}

export const geminiClient = new GeminiClient();
