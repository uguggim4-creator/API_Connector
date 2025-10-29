// Google Veo 3.1 API 통합
import { ApiKeyService, decryptApiKey } from '../db';

export type VeoTemplate = 'text-to-video' | 'reference-images' | 'video-extension';

export interface VeoVideoRequest {
  prompt: string;
  template?: VeoTemplate; // 템플릿 선택
  duration?: number; // seconds
  resolution?: '720p' | '1080p';
  aspectRatio?: '16:9' | '9:16' | '1:1';
  image?: string; // Image URL (deprecated - use referenceImages or sourceVideo)
  referenceImages?: string[]; // 참조 이미지 (최대 3개)
  sourceVideo?: string; // 연장할 비디오 URL
}

// GoogleGenAI 타입 정의
interface GoogleGenAI {
  models: {
    generateVideos(params: any): Promise<any>;
  };
  operations: {
    getVideosOperation(params: any): Promise<any>;
  };
  files: {
    download(params: any): Promise<void>;
  };
}

export class VeoClient {
  private apiKey: string | null = null;
  private ai: GoogleGenAI | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    // Lazy initialization will be done on first use
  }

  private async ensureInitialized() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.initClient();
    return this.initPromise;
  }

  private async initClient() {
    const apiKeyData = ApiKeyService.getActive('veo');
    if (!apiKeyData) {
      return;
    }

    try {
      this.apiKey = decryptApiKey(apiKeyData.encryptedKey);

      // GoogleGenAI 클라이언트 초기화 (API Key만 사용)
      if (this.apiKey) {
        const { GoogleGenAI } = await import('@google/genai');
        this.ai = new GoogleGenAI({ apiKey: this.apiKey });
      }
    } catch (error) {
      console.error('Failed to initialize Veo client:', error);
      throw error;
    }
  }

  async generateVideo(request: VeoVideoRequest) {
    // Ensure client is initialized
    await this.ensureInitialized();

    if (!this.apiKey) {
      throw new Error('Veo client not initialized. Please add an API key in settings.');
    }

    if (!this.ai) {
      throw new Error('GoogleGenAI client not initialized. Please check your API key.');
    }

    const startTime = Date.now();

    try {
      // 새로운 GoogleGenAI SDK 사용
      let operation = await this.ai.models.generateVideos({
        model: "veo-3.1-generate-preview",
        prompt: request.prompt,
        // 추가 옵션 설정 가능
      });

      // Poll the operation status until the video is ready
      while (!operation.done) {
        console.log("Waiting for video generation to complete...");
        await new Promise((resolve) => setTimeout(resolve, 10000));
        operation = await this.ai.operations.getVideosOperation({
          operation: operation,
        });
      }

      const duration = Date.now() - startTime;
      return {
        success: true,
        data: operation.response,
        operation: operation,
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error('Veo API Error:', error.message);
      return {
        success: false,
        error: error.message || 'Unknown error',
        duration,
      };
    }
  }

  isConfigured(): boolean {
    return this.apiKey !== null;
  }
}

export const veoClient = new VeoClient();