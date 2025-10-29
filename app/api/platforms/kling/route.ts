// Kling AI API 엔드포인트 (직접 연결)
import { NextRequest, NextResponse } from 'next/server';
import { klingAIClient } from '@/lib/kling-client';
import { UsageLogService } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      );
    }

    let result;
    let endpoint = '';

    switch (action) {
      case 'video':
        endpoint = '/v1/videos/image2video';
        
        // Kling AI 파라미터 구조로 변환
        const klingParams: any = {
          model_name: params.model_name || 'kling-v2.1-master',
          duration: params.duration?.toString() || '5',
          mode: params.mode || 'std',
        };

        // 필수: image 또는 image_tail 중 하나는 필요
        if (params.image && params.image.length > 0) {
          klingParams.image = params.image[0];
        }
        if (params.image_tail) {
          klingParams.image_tail = params.image_tail;
        }

        // 프롬프트
        if (params.prompt) {
          klingParams.prompt = params.prompt;
        }
        if (params.negative_prompt) {
          klingParams.negative_prompt = params.negative_prompt;
        }

        // cfg_scale
        if (params.cfg_scale !== undefined) {
          klingParams.cfg_scale = params.cfg_scale;
        }

        // static_mask
        if (params.static_mask) {
          klingParams.static_mask = params.static_mask;
        }

        // dynamic_masks
        if (params.dynamic_masks && params.dynamic_masks.length > 0) {
          klingParams.dynamic_masks = params.dynamic_masks;
        }

        // camera_control
        if (params.camera_control) {
          klingParams.camera_control = params.camera_control;
        }

        result = await klingAIClient.generateImageToVideo(klingParams);
        break;

      case 'status':
        endpoint = `/v1/videos/image2video/${params.taskId}`;
        result = await klingAIClient.getTaskStatus(params.taskId);
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    // 사용 로그 저장
    UsageLogService.add({
      platform: 'kling',
      apiKeyId: 'kling-direct',
      endpoint,
      method: 'POST',
      statusCode: result.success ? 200 : 500,
      success: result.success,
      errorMessage: result.success ? undefined : result.error,
      duration: result.duration,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
