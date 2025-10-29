// Google Veo 3.1 API 통합
import axios from 'axios';
import { ApiKeyService, decryptApiKey } from '../db';

export interface VeoVideoRequest {
  prompt: string;
  duration?: number; // seconds
  resolution?: '720p' | '1080p';
  aspectRatio?: '16:9' | '9:16' | '1:1';
  image?: string; // Image URL
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

      if (request.image) {
        // Assuming the API takes an image URL. The documentation is not super clear on the format.
        // This part might need adjustment based on the exact API spec.
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