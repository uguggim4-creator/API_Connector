// 이미지 업로드 API - Supabase Storage를 사용하여 공개 URL로 이미지 제공
import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Supabase 환경 변수 확인
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
      return NextResponse.json(
        { success: false, error: 'Supabase configuration missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY' },
        { status: 500 }
      );
    }

    // 파일 형식 검증 (jpeg, png만 허용)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG and PNG are allowed.' },
        { status: 400 }
      );
    }

    // 파일 크기 검증 (최대 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: `File too large. Maximum size is 10MB. Current: ${(file.size / 1024 / 1024).toFixed(2)}MB` },
        { status: 400 }
      );
    }

    // 파일을 버퍼로 변환
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 안전한 파일명 생성
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${safeName}`;

    // Supabase에 업로드
    const bucketName = process.env.SUPABASE_BUCKET_NAME || 'seedream-images';
    const result = await uploadImageToSupabase(buffer, filename, bucketName);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    console.log(`✅ 이미지 업로드 완료: ${filename} (${(file.size / 1024).toFixed(2)}KB) → ${result.url}`);

    return NextResponse.json({
      success: true,
      url: result.url,
      filename,
      size: file.size,
    });
  } catch (error: any) {
    console.error('❌ 업로드 에러:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

