// Nanobanana API 엔드포인트 (CometAPI 통합)
import { NextRequest, NextResponse } from 'next/server';
import { cometAPIClient } from '@/lib/cometapi';
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
      case 'image':
        endpoint = '/v1/images/generations';
        result = await cometAPIClient.generateNanobananaImage(params);
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    // 사용 로그 저장
    UsageLogService.add({
      platform: 'nanobanana',
      apiKeyId: 'cometapi',
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

