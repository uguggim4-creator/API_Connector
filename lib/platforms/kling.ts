// Kling AI API 통합
import axios from 'axios';
import { ApiKeyService, decryptApiKey } from '../db';

export interface KlingVideoRequest {
  prompt: string;
  duration?: number; // 5 or 10 seconds
  aspectRatio?: '16:9' | '9:16' | '1:1';
  mode?: 'standard' | 'pro';
}

export class KlingClient {
  private apiKey: string | null = null;
  private baseUrl: string = 'https://api.piapi.ai/api/kling'; // PiAPI 사용 예시

  constructor() {
    this.initClient();
  }

  private initClient() {
    // 먼저 DB에서 API 키를 찾음
    const apiKey = ApiKeyService.getActive('kling');
    if (apiKey) {
      try {
        this.apiKey = decryptApiKey(apiKey.encryptedKey);
        return;
      } catch (error) {
        console.error('Failed to decrypt Kling API key from DB:', error);
      }
    }

    // DB에 없으면 환경 변수에서 직접 읽기 (Vercel 등 서버리스 환경 대응)
    if (process.env.KLING_API_KEY) {
      this.apiKey = process.env.KLING_API_KEY;
      console.log('Using Kling API key from environment variable');
    }
  }

  async generateVideo(request: KlingVideoRequest) {
    if (!this.apiKey) {
      throw new Error('Kling client not initialized. Please add an API key.');
    }

    const startTime = Date.now();

    try {
      // Task 생성
      const createResponse = await axios.post(
        `${this.baseUrl}/v1/video/text-to-video`,
        {
          prompt: request.prompt,
          duration: request.duration || 5,
          aspect_ratio: request.aspectRatio || '16:9',
          mode: request.mode || 'standard',
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const taskId = createResponse.data.task_id;

      // Task 상태 확인 (폴링)
      let attempts = 0;
      const maxAttempts = 60; // 최대 5분 대기

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5초 대기

        const statusResponse = await axios.get(
          `${this.baseUrl}/v1/video/task/${taskId}`,
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
            },
          }
        );

        const status = statusResponse.data.status;

        if (status === 'completed') {
          const duration = Date.now() - startTime;
          return {
            success: true,
            data: statusResponse.data,
            duration,
          };
        } else if (status === 'failed') {
          const duration = Date.now() - startTime;
          return {
            success: false,
            error: statusResponse.data.error || 'Video generation failed',
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
        error: error.response?.data?.message || error.message || 'Unknown error',
        duration,
      };
    }
  }

  async getTaskStatus(taskId: string) {
    if (!this.apiKey) {
      throw new Error('Kling client not initialized. Please add an API key.');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/v1/video/task/${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Unknown error',
      };
    }
  }

  isConfigured(): boolean {
    return this.apiKey !== null;
  }
}

export const klingClient = new KlingClient();
