# AI Platform API Hub

다양한 AI 플랫폼의 API를 통합 관리할 수 있는 웹 애플리케이션입니다.

## 지원 플랫폼

- **OpenAI**: GPT-4, GPT-3.5, DALL-E 3/2, Whisper
- **Google Gemini**: Gemini Pro, Gemini Pro Vision
- **Google Veo 3.1**: AI 비디오 생성 (최대 60초, 1080p)
- **Kling AI**: 텍스트/이미지에서 비디오 생성
- **Seedream 4.0**: ByteDance의 4K AI 이미지 생성

## 주요 기능

- API 키 안전 관리 (암호화 저장)
- 통합 API 인터페이스
- 실시간 API 테스트 플레이그라운드
- 사용량 로그 및 추적
- 응답 시간 모니터링

## 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **데이터베이스**: JSON 기반 파일 저장소
- **스토리지**: Supabase Storage (이미지 업로드)
- **AI SDK**:
  - OpenAI SDK
  - Google Generative AI SDK
  - Axios (Kling, Seedream, Veo)
  - Supabase JS (@supabase/supabase-js)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 필수 환경 변수
DATABASE_URL="file:./dev.db"
ENCRYPTION_KEY="your-secret-encryption-key-change-this-in-production"

# Supabase 설정 (Seedream 이미지 업로드용)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_BUCKET_NAME="seedream-images"

# API 키 (선택사항 - 자동 연결 사용 시)
OPENAI_API_KEY="sk-..."
GOOGLE_API_KEY="AI..."
KLING_API_KEY="..."
SEEDREAM_API_KEY="..."
```

**Supabase 설정 방법**:
1. [Supabase](https://supabase.com/)에서 새 프로젝트 생성
2. Storage → 새 버킷 생성 (`seedream-images`)
3. Settings → API → URL과 `anon` `public` 키 복사
4. `.env` 파일에 추가

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 4. API 키 추가

**방법 1: 자동 연결 (권장)**

1. `.env` 파일에 API 키를 입력:
   ```env
   OPENAI_API_KEY=sk-...
   GOOGLE_API_KEY=AI...
   KLING_API_KEY=...
   SEEDREAM_API_KEY=...
   AUTO_IMPORT_API_KEYS=true
   ```

2. [http://localhost:3000/setup](http://localhost:3000/setup)로 이동하여 "자동 연결 시작" 클릭
3. 또는 설정 페이지에서 "⚡ 환경 변수에서 자동 연결" 버튼 클릭

**방법 2: 수동 입력**

1. [http://localhost:3000/settings](http://localhost:3000/settings)로 이동
2. 각 플랫폼의 API 키를 추가
3. [http://localhost:3000/playground](http://localhost:3000/playground)에서 테스트

## 프로젝트 구조

```
API_Connector/
├── app/
│   ├── api/
│   │   ├── keys/          # API 키 관리 엔드포인트
│   │   └── platforms/     # 각 플랫폼별 API 엔드포인트
│   ├── settings/          # API 키 관리 페이지
│   ├── playground/        # API 테스트 인터페이스
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── db.ts             # JSON 데이터베이스 유틸리티
│   └── platforms/        # 각 플랫폼별 클라이언트
│       ├── openai.ts
│       ├── gemini.ts
│       ├── veo.ts
│       ├── kling.ts
│       └── seedream.ts
├── data/
│   └── db.json           # API 키 및 로그 저장소
└── prisma/
    └── schema.prisma     # 데이터베이스 스키마 (향후 마이그레이션용)
```

## 주요 페이지

- **홈 (`/`)**: 지원 플랫폼 개요 및 빠른 링크
- **초기 설정 마법사 (`/setup`)**: 환경 변수에서 API 키 자동 연결
- **API 키 관리 (`/settings`)**: API 키 수동 추가/수정/삭제
- **Playground (`/playground`)**: 실시간 API 테스트 인터페이스

## API 엔드포인트

### API 키 관리

- `GET /api/keys` - 모든 API 키 조회
- `POST /api/keys` - 새 API 키 추가
- `PATCH /api/keys` - API 키 업데이트
- `DELETE /api/keys?id={id}` - API 키 삭제

### 자동 연결

- `GET /api/auto-import` - 환경 변수에서 API 키 자동 가져오기
- `POST /api/auto-import` - JSON 데이터로 일괄 가져오기
- `GET /api/connection-status` - 플랫폼별 연결 상태 확인

### 플랫폼 호출

- `POST /api/platforms/openai` - OpenAI API 호출
- `POST /api/platforms/gemini` - Google Gemini API 호출
- `POST /api/platforms/veo` - Google Veo API 호출
- `POST /api/platforms/kling` - Kling AI API 호출
- `POST /api/platforms/seedream` - Seedream API 호출

## 보안

- API 키는 AES-256-CBC 암호화로 저장됩니다
- 암호화 키는 환경 변수로 관리됩니다
- 프로덕션 환경에서는 강력한 암호화 키를 사용하세요

## API 키 발급 방법

### OpenAI
[https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### Google Gemini
[https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

### Google Veo 3.1
1. [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)에서 API 키 발급
2. Google Cloud Console에서 **Generative Language API** 활성화 필요
   - API 키와 연결된 프로젝트에서 API를 활성화해야 합니다
   - 오류 발생 시 에러 메시지에 표시되는 활성화 링크를 클릭하세요
   - 또는 새 API 키를 발급받으세요 (자동으로 필요한 권한이 설정됨)
3. Gemini와 동일한 API 키를 사용할 수 있습니다

### Kling AI
- 공식: [https://app.klingai.com/](https://app.klingai.com/)
- 서드파티: PiAPI, UseAPI 등

### Seedream 4.0
- BytePlus: [https://console.byteplus.com/](https://console.byteplus.com/)
- 서드파티: Kie.ai, CometAPI 등

## Supabase Storage 설정 (Seedream 이미지 업로드)

Seedream 모델에서 이미지를 업로드할 때 Supabase Storage를 사용합니다. 다음 단계를 따라 설정하세요:

### 1. Supabase 프로젝트 생성

1. [https://supabase.com](https://supabase.com)에서 계정 생성 및 로그인
2. "New Project" 클릭하여 새 프로젝트 생성
3. 프로젝트 이름, 데이터베이스 비밀번호, 리전 선택

### 2. Storage Bucket 생성

1. Supabase 대시보드에서 **Storage** 메뉴로 이동
2. "Create a new bucket" 클릭
3. Bucket 설정:
   - **Name**: `seedream-images` (또는 원하는 이름)
   - **Public bucket**: ✅ 체크 (공개 URL 사용을 위해)
4. "Create bucket" 클릭

### 3. Bucket 정책 설정 (공개 업로드 허용)

1. 생성한 `seedream-images` 버킷 클릭
2. 상단의 **Policies** 탭으로 이동
3. "New Policy" 클릭
4. 다음 정책 추가:

**업로드 허용 정책:**
```sql
CREATE POLICY "Public upload"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'seedream-images');
```

**읽기 허용 정책 (이미 public bucket이면 자동 설정):**
```sql
CREATE POLICY "Public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'seedream-images');
```

### 4. 환경 변수 설정

1. Supabase 대시보드에서 **Settings** > **API** 이동
2. 다음 정보를 복사:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbG...`

3. `.env` 파일에 추가:
```env
SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_ANON_KEY="eyJhbG..."
SUPABASE_BUCKET_NAME="seedream-images"
```

### 5. 테스트

1. 개발 서버 재시작: `npm run dev`
2. [http://localhost:3000/playground?model=seedream](http://localhost:3000/playground?model=seedream) 접속
3. "📁 파일 업로드" 버튼으로 이미지 업로드 테스트
4. 업로드 성공 시 Supabase 공개 URL이 생성됩니다

### 주의사항

- Supabase 무료 플랜: 1GB 스토리지, 2GB 대역폭/월
- 프로덕션 환경에서는 적절한 보안 정책 설정 권장
- 민감한 정보가 포함된 이미지는 public bucket 사용 지양

## 라이선스

MIT

## 기여

이슈 및 풀 리퀘스트를 환영합니다!
