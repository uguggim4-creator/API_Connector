// Google Gemini API 엔드포인트
import { NextRequest, NextResponse } from 'next/server';
import { geminiClient } from '@/lib/platforms/gemini';
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
    let model = '';

    switch (action) {
      case 'text':
        endpoint = '/generateContent';
        model = params.model || 'gemini-pro';
        result = await geminiClient.generateText(params);
        break;

      case 'vision':
        endpoint = '/generateContent';
        model = 'gemini-pro-vision';
        result = await geminiClient.generateTextWithImage(params.prompt, params.imageData);
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    // 사용 로그 저장
    UsageLogService.add({
      platform: 'gemini',
      apiKeyId: 'gemini-default',
      endpoint,
      method: 'POST',
      model,
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
