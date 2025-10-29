// API 키 관리 엔드포인트
import { NextRequest, NextResponse } from 'next/server';
import { ApiKeyService } from '@/lib/db';

// GET: 모든 API 키 조회
export async function GET() {
  try {
    const keys = ApiKeyService.getAll();

    // API 키는 숨기고 메타데이터만 반환
    const safeKeys = keys.map(key => ({
      id: key.id,
      platform: key.platform,
      keyName: key.keyName,
      isActive: key.isActive,
      createdAt: key.createdAt,
      lastUsedAt: key.lastUsedAt,
      keyPreview: key.encryptedKey.slice(0, 10) + '...',
    }));

    return NextResponse.json({ success: true, data: safeKeys });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: 새 API 키 추가
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, apiKey, keyName } = body;

    if (!platform || !apiKey) {
      return NextResponse.json(
        { success: false, error: 'Platform and API key are required' },
        { status: 400 }
      );
    }

  // 플랫폼 유효성 검사
  // 추가 요청에 따라 'nanobanana'와 'sora'도 허용
  const validPlatforms = ['openai', 'gemini', 'veo', 'kling', 'seedream', 'nanobanana', 'sora'];
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json(
        { success: false, error: 'Invalid platform' },
        { status: 400 }
      );
    }

    const newKey = ApiKeyService.add(platform, apiKey, keyName);

    return NextResponse.json({
      success: true,
      data: {
        id: newKey.id,
        platform: newKey.platform,
        keyName: newKey.keyName,
        isActive: newKey.isActive,
        createdAt: newKey.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: API 키 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Key ID is required' },
        { status: 400 }
      );
    }

    const deleted = ApiKeyService.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Key not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH: API 키 업데이트
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isActive, keyName } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Key ID is required' },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (typeof isActive !== 'undefined') updates.isActive = isActive;
    if (keyName) updates.keyName = keyName;

    const updatedKey = ApiKeyService.update(id, updates);

    if (!updatedKey) {
      return NextResponse.json(
        { success: false, error: 'Key not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedKey.id,
        platform: updatedKey.platform,
        keyName: updatedKey.keyName,
        isActive: updatedKey.isActive,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
