// Google Veo 3.1 API 통합
import axios from 'axios';
import { ApiKeyService, decryptApiKey } from '../db';

export interface VeoVideoRequest {
  prompt: string;
  duration?: number; // seconds
  resolution?: '720p' | '1080p';
  aspectRatio?: '16:9' | '9:16' | '1:1';
}

export class VeoClient {
  private apiKey: string | null = null;
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta';

  constructor() {
    this.initClient();
  }

  private initClient() {
    // 먼저 DB에서 API 키를 찾음
    const apiKey = ApiKeyService.getActive('veo');
    if (apiKey) {
      try {
        this.apiKey = decryptApiKey(apiKey.encryptedKey);
        return;
      } catch (error) {
        console.error('Failed to decrypt Veo API key from DB:', error);
      }
    }

    // DB에 없으면 환경 변수에서 직접 읽기 (Vercel 등 서버리스 환경 대응)
    if (process.env.GOOGLE_API_KEY) {
      this.apiKey = process.env.GOOGLE_API_KEY;
      console.log('Using Veo API key from environment variable');
    }
  }

  async generateVideo(request: VeoVideoRequest) {
    if (!this.apiKey) {
      throw new Error('Veo client not initialized. Please add an API key.');
    }

    const startTime = Date.now();

    try {
      // Gemini API를 통한 Veo 3.1 호출
      const response = await axios.post(
        `${this.baseUrl}/models/veo-3.1:generateVideo?key=${this.apiKey}`,
        {
          prompt: request.prompt,
          videoConfig: {
            duration: request.duration || 10,
            resolution: request.resolution || '1080p',
            aspectRatio: request.aspectRatio || '16:9',
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // 작업 ID 가져오기
      const operationId = response.data.name;

      // 작업 완료 대기 (폴링)
      let attempts = 0;
      const maxAttempts = 120; // 최대 10분 대기

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5초 대기

        const statusResponse = await axios.get(
          `${this.baseUrl}/${operationId}?key=${this.apiKey}`
        );

        if (statusResponse.data.done) {
          const duration = Date.now() - startTime;

          if (statusResponse.data.error) {
            return {
              success: false,
              error: statusResponse.data.error.message,
              duration,
            };
          }

          return {
            success: true,
            data: statusResponse.data.response,
            duration,
          };
        }

        attempts++;
      }

      const duration = Date.now() - startTime;
      return {
        success: false,
        error: 'Video generation timeout',
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message || 'Unknown error',
        duration,
      };
    }
  }

  isConfigured(): boolean {
    return this.apiKey !== null;
  }
}

export const veoClient = new VeoClient();
