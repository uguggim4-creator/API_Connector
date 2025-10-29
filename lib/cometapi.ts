// CometAPI 통합 클라이언트
const COMET_API_KEY = "sk-bkjoafArBU3VU9rIvR8yn9WAr6wiE0meYxhXAy2i76I05fAM";
const COMET_BASE_URL = "https://api.cometapi.com";

interface CometAPIResponse {
  success: boolean;
  data?: any;
  error?: string;
  duration?: number;
}

class CometAPIClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string = COMET_API_KEY, baseUrl: string = COMET_BASE_URL) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  // Veo 3.1 영상 생성
  async generateVeoVideo(params: {
    prompt: string;
    duration?: number;
    width?: number;
    height?: number;
    template?: string;
    referenceImages?: string[];
    sourceVideo?: string | null;
    startFrame?: string | null;
    endFrame?: string | null;
  }): Promise<CometAPIResponse> {
    const startTime = Date.now();
    try {
      // 프롬프트에 비디오 설정을 명시적으로 포함
      let enhancedPrompt = params.prompt;
      
      // Duration 추가
      if (params.duration && params.duration !== 8) {
        enhancedPrompt = `[Duration: ${params.duration} seconds] ${enhancedPrompt}`;
      }
      
      // 해상도 추가
      if (params.width && params.height) {
        enhancedPrompt = `[Resolution: ${params.width}x${params.height}] ${enhancedPrompt}`;
      }
      
      // 스타트 프레임 정보
      if (params.startFrame) {
        enhancedPrompt = `[Start Frame Image: ${params.startFrame}] ${enhancedPrompt}`;
      }
      
      // 엔드 프레임 정보
      if (params.endFrame) {
        enhancedPrompt = `[End Frame Image: ${params.endFrame}] ${enhancedPrompt}`;
      }
      
      // 참조 이미지
      if (params.referenceImages && params.referenceImages.length > 0) {
        enhancedPrompt = `[Reference Images: ${params.referenceImages.join(', ')}] ${enhancedPrompt}`;
      }
      
      // 소스 비디오
      if (params.sourceVideo) {
        enhancedPrompt = `[Source Video for Extension: ${params.sourceVideo}] ${enhancedPrompt}`;
      }

      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'veo3.1-pro',
          stream: false,
          messages: [
            {
              role: 'user',
              content: enhancedPrompt
            }
          ]
        }),
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || 'Veo video generation failed',
          duration,
        };
      }

      // Veo 응답에서 비디오 URL 추출
      let videoUrl = null;
      if (data.choices && data.choices[0]?.message?.content) {
        const content = data.choices[0].message.content;
        // 마크다운에서 비디오 URL 추출 (Watch Online 또는 Download Video 링크)
        const urlMatch = content.match(/https:\/\/filesystem\.site\/cdn\/[^\s)]+\.mp4/);
        if (urlMatch) {
          videoUrl = urlMatch[0];
        }
      }

      // 응답 데이터 구조 정리
      const formattedData = {
        ...data,
        video_url: videoUrl,
        raw_content: data.choices?.[0]?.message?.content,
      };

      return {
        success: true,
        data: formattedData,
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

  // Sora 2 영상 생성
  async generateSoraVideo(params: {
    prompt: string;
    duration: number;
    width: number;
    height: number;
    model?: string;
  }): Promise<CometAPIResponse> {
    const startTime = Date.now();
    try {
      const formData = new FormData();
      formData.append('prompt', params.prompt);
      formData.append('model', params.model || 'sora-2');
      formData.append('seconds', params.duration.toString());
      formData.append('size', `${params.width}x${params.height}`);

      const response = await fetch(`${this.baseUrl}/v1/videos`, {
        method: 'POST',
        headers: {
          'Authorization': this.apiKey,
        },
        body: formData,
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || 'Sora video generation failed',
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

  // Seedream 이미지 생성
  async generateSeedreamImage(params: {
    prompt: string;
    model: string;
    width: number;
    height: number;
    n: number;
    image?: string[];
    watermark?: boolean;
  }): Promise<CometAPIResponse> {
    const startTime = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}/v1/images/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: params.model,
          prompt: params.prompt,
          n: params.n,
          size: `${params.width}x${params.height}`,
          response_format: 'url',
          reference_images: params.image,
        }),
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || 'Seedream image generation failed',
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

  // Nanobanana 이미지 생성 (Gemini 2.5 Flash 사용)
  async generateNanobananaImage(params: {
    prompt: string;
    width: number;
    height: number;
    n: number;
  }): Promise<CometAPIResponse> {
    const startTime = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}/v1beta/models/gemini-2.5-flash-image-preview:generateContent`, {
        method: 'POST',
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: params.prompt }
            ]
          }]
        }),
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || 'Nanobanana image generation failed',
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

  // Kling 영상 생성 (image2video)
  async generateKlingVideo(params: {
    prompt: string;
    duration: number;
    width?: number;
    height?: number;
    image?: string[];
    image_end?: string[];
  }): Promise<CometAPIResponse> {
    const startTime = Date.now();
    try {
      const bodyData: any = {
        model_name: 'kling-v2.1-master',
        duration: params.duration.toString(),
        prompt: params.prompt,
      };

      // 스타트 이미지가 있으면 추가
      if (params.image && params.image.length > 0) {
        bodyData.image = params.image[0];
      }

      const response = await fetch(`${this.baseUrl}/kling/v1/videos/image2video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || 'Kling video generation failed',
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

  // Midjourney 이미지 생성
  async generateMidjourneyImage(params: {
    prompt: string;
    mode?: string;
    aspect_ratio?: string;
    version?: string;
    style?: string;
    stylize?: number;
    chaos?: number;
    no?: string;
    weird?: number;
  }): Promise<CometAPIResponse> {
    const startTime = Date.now();
    try {
      // 프롬프트에 Midjourney 파라미터 추가
      let enhancedPrompt = params.prompt;
      
      if (params.aspect_ratio) {
        enhancedPrompt += ` --ar ${params.aspect_ratio}`;
      }
      if (params.version) {
        enhancedPrompt += ` --v ${params.version}`;
      }
      if (params.style) {
        enhancedPrompt += ` --style ${params.style}`;
      }
      if (params.stylize !== undefined) {
        enhancedPrompt += ` --s ${params.stylize}`;
      }
      if (params.chaos !== undefined) {
        enhancedPrompt += ` --chaos ${params.chaos}`;
      }
      if (params.no) {
        enhancedPrompt += ` --no ${params.no}`;
      }
      if (params.weird !== undefined) {
        enhancedPrompt += ` --weird ${params.weird}`;
      }

      const response = await fetch(`${this.baseUrl}/mj/submit/imagine`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          botType: 'MID_JOURNEY',
          prompt: enhancedPrompt,
          accountFilter: {
            modes: [params.mode || 'FAST']
          }
        }),
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || 'Midjourney image generation failed',
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

  // Midjourney 비디오 생성
  async generateMidjourneyVideo(params: {
    prompt: string;
    videoType?: string;
    mode?: string;
    animateMode?: string;
  }): Promise<CometAPIResponse> {
    const startTime = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}/mj/submit/video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: params.prompt,
          videoType: params.videoType || 'vid_1.1_i2v_480',
          mode: params.mode || 'fast',
          animateMode: params.animateMode || 'manual',
        }),
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || 'Midjourney video generation failed',
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

export const cometAPIClient = new CometAPIClient();

