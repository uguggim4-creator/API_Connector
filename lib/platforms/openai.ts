// OpenAI API 통합
import OpenAI from 'openai';
import { ApiKeyService, decryptApiKey } from '../db';

export interface OpenAITextRequest {
  model?: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface OpenAIImageRequest {
  prompt: string;
  model?: 'dall-e-2' | 'dall-e-3';
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  n?: number;
}

export class OpenAIClient {
  private client: OpenAI | null = null;

  constructor() {
    this.initClient();
  }

  private initClient() {
    // 먼저 DB에서 API 키를 찾음
    const apiKey = ApiKeyService.getActive('openai');
    if (apiKey) {
      try {
        const decryptedKey = decryptApiKey(apiKey.encryptedKey);
        this.client = new OpenAI({ apiKey: decryptedKey });
        return;
      } catch (error) {
        console.error('Failed to decrypt OpenAI API key from DB:', error);
      }
    }

    // DB에 없으면 환경 변수에서 직접 읽기 (Vercel 등 서버리스 환경 대응)
    if (process.env.OPENAI_API_KEY) {
      this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      console.log('Using OpenAI API key from environment variable');
    }
  }

  async chat(request: OpenAITextRequest) {
    if (!this.client) {
      throw new Error('OpenAI client not initialized. Please add an API key.');
    }

    const startTime = Date.now();

    try {
      const response = await this.client.chat.completions.create({
        model: request.model || 'gpt-4',
        messages: [
          {
            role: 'user',
            content: request.prompt,
          },
        ],
        max_tokens: request.maxTokens || 1000,
        temperature: request.temperature || 0.7,
      });

      const duration = Date.now() - startTime;

      return {
        success: true,
        data: response,
        duration,
        tokensUsed: response.usage?.total_tokens,
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

  async generateImage(request: OpenAIImageRequest) {
    if (!this.client) {
      throw new Error('OpenAI client not initialized. Please add an API key.');
    }

    const startTime = Date.now();

    try {
      const response = await this.client.images.generate({
        model: request.model || 'dall-e-3',
        prompt: request.prompt,
        size: request.size || '1024x1024',
        quality: request.quality || 'standard',
        n: request.n || 1,
      });

      const duration = Date.now() - startTime;

      return {
        success: true,
        data: response,
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

  async transcribe(audioFile: File) {
    if (!this.client) {
      throw new Error('OpenAI client not initialized. Please add an API key.');
    }

    const startTime = Date.now();

    try {
      const response = await this.client.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
      });

      const duration = Date.now() - startTime;

      return {
        success: true,
        data: response,
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

export const openaiClient = new OpenAIClient();
