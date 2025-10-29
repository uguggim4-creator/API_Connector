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
      console.error('Veo API Error:', error);

      // Check for specific error types and provide helpful messages
      let errorMessage = error.message || 'Unknown error';
      let activationUrl = null;

      // Handle 403 PERMISSION_DENIED errors
      if (error.message && error.message.includes('PERMISSION_DENIED')) {
        errorMessage = 'API Access Denied: Please enable the Generative Language API for your project.\n\n';

        // Extract project ID from error message if available
        const projectMatch = error.message.match(/project (\d+)/);
        if (projectMatch) {
          const projectId = projectMatch[1];
          activationUrl = `https://console.developers.google.com/apis/api/generativelanguage.googleapis.com/overview?project=${projectId}`;
          errorMessage += `1. Visit: ${activationUrl}\n`;
          errorMessage += `2. Click "Enable API"\n`;
          errorMessage += `3. Wait a few minutes for the changes to propagate\n`;
          errorMessage += `4. Try again\n\n`;
          errorMessage += `Alternatively, create a new API key at https://aistudio.google.com/apikey`;
        } else {
          errorMessage += 'Please enable the Generative Language API in your Google Cloud Console.\n';
          errorMessage += 'Visit: https://aistudio.google.com/apikey to create a new API key with the correct permissions.';
        }
      } else if (error.message && error.message.includes('SERVICE_DISABLED')) {
        errorMessage = 'Service Disabled: The Generative Language API is disabled for your project.\n\n';
        errorMessage += 'Please enable it at: https://aistudio.google.com/apikey\n';
        errorMessage += 'Or use an API key from a project with the API enabled.';
      } else if (error.message && (error.message.includes('API key') || error.message.includes('invalid'))) {
        errorMessage = 'Invalid API Key: Please check your Veo API key.\n\n';
        errorMessage += 'Get a valid API key at: https://aistudio.google.com/apikey';
      }

      return {
        success: false,
        error: errorMessage,
        activationUrl,
        duration,
      };
    }
  }

  isConfigured(): boolean {
    return this.apiKey !== null;
  }
}

export const veoClient = new VeoClient();