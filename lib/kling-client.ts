// Kling AI 직접 API 클라이언트
const KLING_ACCESS_KEY = "AEAACrFY3JELrghtMyHYHAQgnmALnTkt";
const KLING_SECRET_KEY = "34Cdg8FgD4n8A3etDkCJahGy3G3ry3nB";
const KLING_BASE_URL = "https://api-singapore.klingai.com";

interface KlingVideoParams {
  model_name?: string;
  image: string;
  image_tail?: string;
  prompt?: string;
  negative_prompt?: string;
  cfg_scale?: number;
  mode?: string;
  static_mask?: string;
  dynamic_masks?: Array<{
    mask: string;
    trajectories: Array<{ x: number; y: number }>;
  }>;
  camera_control?: {
    type: string;
    config?: {
      horizontal?: number;
      vertical?: number;
      pan?: number;
      tilt?: number;
      roll?: number;
      zoom?: number;
    };
  };
  duration?: string;
  callback_url?: string;
  external_task_id?: string;
}

interface KlingAPIResponse {
  success: boolean;
  data?: any;
  error?: string;
  duration?: number;
}

class KlingAIClient {
  private accessKey: string;
  private secretKey: string;
  private baseUrl: string;

  constructor(
    accessKey: string = KLING_ACCESS_KEY,
    secretKey: string = KLING_SECRET_KEY,
    baseUrl: string = KLING_BASE_URL
  ) {
    this.accessKey = accessKey;
    this.secretKey = secretKey;
    this.baseUrl = baseUrl;
  }

  // JWT 토큰 생성 (Kling AI 인증 방식)
  private async getAuthToken(): Promise<string> {
    // Kling AI는 Access Key를 Bearer 토큰으로 사용
    return this.accessKey;
  }

  // Image to Video 생성
  async generateImageToVideo(params: KlingVideoParams): Promise<KlingAPIResponse> {
    const startTime = Date.now();
    try {
      const token = await this.getAuthToken();

      const response = await fetch(`${this.baseUrl}/v1/videos/image2video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || 'Kling video generation failed',
          duration,
        };
      }

      return {
        success: true,
        data,
        duration,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime,
      };
    }
  }

  // 작업 상태 조회
  async getTaskStatus(taskId: string): Promise<KlingAPIResponse> {
    const startTime = Date.now();
    try {
      const token = await this.getAuthToken();

      const response = await fetch(`${this.baseUrl}/v1/videos/image2video/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || 'Failed to get task status',
          duration,
        };
      }

      return {
        success: true,
        data,
        duration,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime,
      };
    }
  }
}

export const klingAIClient = new KlingAIClient();

