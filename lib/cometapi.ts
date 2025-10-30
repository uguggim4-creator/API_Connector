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
    duration?: number;
    width?: number;
    height?: number;
    model?: string;
    image?: string[];
    image_end?: string[];
    loop?: boolean;
    aspect_ratio?: string;
    resolution?: string;
  }): Promise<CometAPIResponse> {
    const startTime = Date.now();
    try {
      // Sora 2 지원 해상도
      // 1080p: 1920x1080, 720p: 1280x720, 480p: 854x480
      let size = '1280x720'; // 기본값
      
      if (params.resolution) {
        // resolution이 지정된 경우
        size = params.resolution;
      } else if (params.width && params.height) {
        // width/height로부터 계산
        size = `${params.width}x${params.height}`;
      } else if (params.aspect_ratio) {
        // aspect_ratio로부터 기본 해상도 매핑
        const aspectRatioMap: Record<string, string> = {
          '16:9': '1920x1080',
          '9:16': '1080x1920',
          '1:1': '1080x1080',
          '4:3': '1440x1080',
          '3:4': '1080x1440',
        };
        size = aspectRatioMap[params.aspect_ratio] || '1280x720';
      }

      // 지속 시간 검증 (Sora 2는 최대 20초)
      const duration = Math.min(Math.max(params.duration || 5, 1), 20);

      // 요청 본문 구성
      const requestBody: any = {
        model: params.model || 'sora-2',
        prompt: params.prompt,
        seconds: duration,
        size: size,
      };

      // 시작 이미지 (Image-to-Video)
      if (params.image && params.image.length > 0) {
        requestBody.image = params.image[0]; // 첫 번째 이미지만 사용
      }

      // 종료 이미지 (Frame prediction)
      if (params.image_end && params.image_end.length > 0) {
        requestBody.image_end = params.image_end[0];
      }

      // 루프 설정 (seamless loop)
      if (params.loop !== undefined) {
        requestBody.loop = params.loop;
      }

      const response = await fetch(`${this.baseUrl}/v1/videos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      const duration_ms = Date.now() - startTime;

      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || data.error || 'Sora video generation failed',
          duration: duration_ms,
        };
      }

      // 응답 포맷 정리
      // Sora API는 비동기 작업을 반환하므로 작업 ID와 상태를 포함
      const formattedData = {
        id: data.id,
        object: data.object || 'video',
        created: data.created || Math.floor(Date.now() / 1000),
        model: data.model || requestBody.model,
        status: data.status || 'processing', // processing, completed, failed
        prompt: params.prompt,
        video_url: data.video_url || data.url, // 완료된 경우 비디오 URL
        thumbnail_url: data.thumbnail_url,
        duration: data.duration || duration,
        size: data.size || size,
        ...data
      };

      return {
        success: true,
        data: formattedData,
        duration: duration_ms,
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

  // Nanobanana 이미지 생성 (Gemini 2.5 Flash Image Preview)
  async generateNanobananaImage(params: {
    prompt: string;
    width?: number;
    height?: number;
    n?: number;
    aspectRatio?: string;
    negativePrompt?: string;
    seed?: number;
    outputFormat?: string;
  }): Promise<CometAPIResponse> {
    const startTime = Date.now();
    try {
      // Gemini 2.5 Flash Image Preview API 파라미터 구성
      const generationConfig: any = {
        responseModalities: ["IMAGE"]
      };

      // 이미지 개수 설정
      if (params.n && params.n > 1) {
        generationConfig.candidateCount = Math.min(params.n, 4); // 최대 4개
      }

      // Aspect Ratio 설정 (width, height로부터 계산)
      if (params.width && params.height) {
        const ratio = params.width / params.height;
        if (ratio === 1) {
          generationConfig.imageAspectRatio = "1:1";
        } else if (ratio > 1.7) {
          generationConfig.imageAspectRatio = "16:9";
        } else if (ratio < 0.6) {
          generationConfig.imageAspectRatio = "9:16";
        } else if (ratio > 1.2) {
          generationConfig.imageAspectRatio = "4:3";
        } else {
          generationConfig.imageAspectRatio = "3:4";
        }
      } else if (params.aspectRatio) {
        generationConfig.imageAspectRatio = params.aspectRatio;
      }

      // Seed 설정 (재현성)
      if (params.seed !== undefined) {
        generationConfig.seed = params.seed;
      }

      // 출력 형식 설정
      if (params.outputFormat) {
        generationConfig.outputFormat = params.outputFormat; // "image/png" 또는 "image/jpeg"
      }

      // 프롬프트 구성
      let promptText = params.prompt;
      
      // Negative prompt 추가 (있는 경우)
      if (params.negativePrompt) {
        promptText += `\n\nAvoid: ${params.negativePrompt}`;
      }

      const response = await fetch(`${this.baseUrl}/v1beta/models/gemini-2.5-flash-image-preview:generateContent`, {
        method: 'POST',
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: promptText }
            ]
          }],
          generationConfig
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

      // 이미지 URL 추출 및 포맷 변환
      const images: string[] = [];
      if (data.candidates) {
        for (const candidate of data.candidates) {
          if (candidate.content?.parts) {
            for (const part of candidate.content.parts) {
              if (part.inlineData?.data) {
                // Base64 데이터를 data URL로 변환
                const mimeType = part.inlineData.mimeType || 'image/png';
                const imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
                images.push(imageUrl);
              }
            }
          }
        }
      }

      // OpenAI 형식으로 응답 포맷팅
      const formattedData = {
        created: Math.floor(Date.now() / 1000),
        data: images.map((url, index) => ({
          url,
          b64_json: images[index]?.split(',')[1], // base64 부분만 추출
          revised_prompt: params.prompt
        })),
        raw: data // 원본 응답 보존
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

  // Kling 영상 생성 (image2video)
  async generateKlingVideo(params: {
    prompt: string;
    duration: number;
    width?: number;
    height?: number;
    image?: string[];
    image_end?: string[];
    model_name?: string;
    mode?: string;
    cfg_scale?: number;
    static_mask?: string;
    dynamic_masks?: Array<{
      mask: string;
      trajectories: Array<{ x: number; y: number }>;
    }>;
  }): Promise<CometAPIResponse> {
    const startTime = Date.now();
    try {
      const bodyData: any = {
        model_name: params.model_name || 'kling-v2.1-master',
        duration: params.duration.toString(),
        prompt: params.prompt,
      };

      // mode 추가 (pro, std 등)
      if (params.mode) {
        bodyData.mode = params.mode;
      }

      // 스타트 이미지가 있으면 추가
      if (params.image && params.image.length > 0) {
        bodyData.image = params.image[0];
      }

      // cfg_scale 추가
      if (params.cfg_scale !== undefined) {
        bodyData.cfg_scale = params.cfg_scale;
      }

      // static_mask 추가 (선택적)
      if (params.static_mask) {
        bodyData.static_mask = params.static_mask;
      }

      // dynamic_masks 추가 (선택적)
      if (params.dynamic_masks && params.dynamic_masks.length > 0) {
        bodyData.dynamic_masks = params.dynamic_masks;
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

