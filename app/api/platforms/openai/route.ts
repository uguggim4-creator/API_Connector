// OpenAI API 엔드포인트
import { NextRequest, NextResponse } from 'next/server';
import { openaiClient } from '@/lib/platforms/openai';
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
      case 'chat':
        endpoint = '/chat/completions';
        model = params.model || 'gpt-4';
        result = await openaiClient.chat(params);
        break;

      case 'image':
        endpoint = '/images/generations';
        model = params.model || 'dall-e-3';
        result = await openaiClient.generateImage(params);
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    // 사용 로그 저장
    UsageLogService.add({
      platform: 'openai',
      apiKeyId: 'openai-default',
      endpoint,
      method: 'POST',
      model,
      statusCode: result.success ? 200 : 500,
      success: result.success,
      errorMessage: result.success ? undefined : result.error,
      tokensUsed: ('tokensUsed' in result ? result.tokensUsed : undefined) as number | undefined,
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
