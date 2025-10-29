// Google Veo 3.1 API 통합
import axios from 'axios';
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

export class VeoClient {
  private apiKey: string | null = null;
  private projectId: string | null = null;
  private region: string | null = null;

  constructor() {
    this.initClient();
  }

  private initClient() {
    const apiKeyData = ApiKeyService.getActive('veo');
    if (!apiKeyData) {
      return;
    }

    try {
      this.apiKey = decryptApiKey(apiKeyData.encryptedKey);
      this.projectId = apiKeyData.projectId || null;
      this.region = apiKeyData.region || null;
    } catch (error) {
      console.error('Failed to initialize Veo client:', error);
    }
  }

  async generateVideo(request: VeoVideoRequest) {
    if (!this.apiKey || !this.projectId || !this.region) {
      throw new Error('Veo client not initialized. Please add an API key, Project ID, and Region in settings.');
    }

    const startTime = Date.now();
    const url = `https://${this.region}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.region}/publishers/google/models/veo-3.1-generate-preview:generateVideos`;

    try {
      const template = request.template || 'text-to-video';
      const requestBody: any = {
        generateVideosRequest: {
          prompt: {
            text: request.prompt,
          },
          videoGenerationConfig: {
            aspectRatio: request.aspectRatio?.replace(':', '_') || '16_9',
            durationSeconds: request.duration || 8,
          },
        },
      };

      // 템플릿별 구성
      switch (template) {
        case 'text-to-video':
          // 기본 텍스트 to 비디오 - 추가 설정 없음
          break;

        case 'reference-images':
          // 참조 이미지 사용 (최대 3개)
          if (request.referenceImages && request.referenceImages.length > 0) {
            const referenceImages = request.referenceImages.slice(0, 3).map(imageUrl => ({
              image: {
                gcsUri: imageUrl, // GCS URI 형식이어야 함
              },
              referenceType: 'asset',
            }));
            requestBody.generateVideosRequest.config = {
              referenceImages,
            };
          }
          break;

        case 'video-extension':
          // 동영상 연장
          if (request.sourceVideo) {
            requestBody.generateVideosRequest.video = {
              gcsUri: request.sourceVideo, // GCS URI 형식이어야 함
            };
            // 연장 시 추가 설정
            if (!requestBody.generateVideosRequest.config) {
              requestBody.generateVideosRequest.config = {};
            }
            requestBody.generateVideosRequest.config.numberOfVideos = 1;
            requestBody.generateVideosRequest.config.resolution = request.resolution || '720p';
          }
          break;
      }

      // 하위 호환성: 기존 image 필드 지원
      if (request.image && !request.referenceImages && !request.sourceVideo) {
        requestBody.generateVideosRequest.prompt.image = {
          source: {
            gcsUri: request.image
          }
        }
      }

      const response = await axios.post(url, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      const duration = Date.now() - startTime;
      return {
        success: true,
        data: response.data,
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error('Veo API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message || 'Unknown error',
        duration,
      };
    }
  }

  isConfigured(): boolean {
    return this.apiKey !== null && this.projectId !== null && this.region !== null;
  }
}

export const veoClient = new VeoClient();