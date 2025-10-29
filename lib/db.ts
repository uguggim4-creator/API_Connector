// 간단한 JSON 기반 데이터베이스
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// 서버리스 환경(Vercel, Lambda)에서는 /tmp만 쓰기 가능
// 로컬 개발 시에는 ./data 디렉토리 사용
function getDataDirectory(): string {
  // 환경 변수로 데이터 디렉토리 지정 가능
  if (process.env.DATA_DIR) {
    return process.env.DATA_DIR;
  }

  // 프로덕션 환경 감지 (Vercel, AWS Lambda 등)
  const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

  if (isServerless) {
    // 서버리스 환경: /tmp 디렉토리 사용 (유일하게 쓰기 가능)
    return '/tmp/data';
  }

  // 로컬 개발 환경: 프로젝트 디렉토리의 data 폴더 사용
  return path.join(process.cwd(), 'data');
}

const DB_PATH = path.join(getDataDirectory(), 'db.json');

export interface ApiKey {
  id: string;
  platform: string;
  encryptedKey: string;
  keyName?: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt?: string;
  projectId?: string;
  region?: string;
}

export interface UsageLog {
  id: string;
  platform: string;
  apiKeyId: string;
  endpoint: string;
  method: string;
  model?: string;
  statusCode: number;
  success: boolean;
  errorMessage?: string;
  tokensUsed?: number;
  cost?: number;
  duration?: number;
  createdAt: string;
}

interface Database {
  apiKeys: ApiKey[];
  usageLogs: UsageLog[];
}

// 데이터베이스 초기화
function initDb(): Database {
  const dataDir = getDataDirectory();
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
    const initialData: Database = {
      apiKeys: [],
      usageLogs: [],
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
    return initialData;
  }

  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

// 데이터베이스 읽기
export function readDb(): Database {
  if (!fs.existsSync(DB_PATH)) {
    return initDb();
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

// 데이터베이스 쓰기
export function writeDb(data: Database): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// API 키 암호화
export function encryptApiKey(apiKey: string): string {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return iv.toString('hex') + ':' + encrypted;
}

// API 키 복호화
export function decryptApiKey(encryptedKey: string): string {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);

  const parts = encryptedKey.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];

  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// API 키 관리 함수들
export const ApiKeyService = {
  // API 키 추가
  add(platform: string, apiKey: string, keyName?: string): ApiKey {
    const db = readDb();
    const newKey: ApiKey = {
      id: crypto.randomUUID(),
      platform,
      encryptedKey: encryptApiKey(apiKey),
      keyName,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    db.apiKeys.push(newKey);
    writeDb(db);
    return newKey;
  },

  // 플랫폼별 활성 API 키 가져오기
  getActive(platform: string): ApiKey | null {
    const db = readDb();
    return db.apiKeys.find(k => k.platform === platform && k.isActive) || null;
  },

  // 모든 API 키 가져오기
  getAll(): ApiKey[] {
    const db = readDb();
    return db.apiKeys;
  },

  // API 키 업데이트
  update(id: string, updates: Partial<ApiKey>): ApiKey | null {
    const db = readDb();
    const index = db.apiKeys.findIndex(k => k.id === id);
    if (index === -1) return null;

    db.apiKeys[index] = { ...db.apiKeys[index], ...updates };
    writeDb(db);
    return db.apiKeys[index];
  },

  // API 키 삭제
  delete(id: string): boolean {
    const db = readDb();
    const index = db.apiKeys.findIndex(k => k.id === id);
    if (index === -1) return false;

    db.apiKeys.splice(index, 1);
    writeDb(db);
    return true;
  },
};

// 사용 로그 서비스
export const UsageLogService = {
  // 로그 추가
  add(log: Omit<UsageLog, 'id' | 'createdAt'>): UsageLog {
    const db = readDb();
    const newLog: UsageLog = {
      id: crypto.randomUUID(),
      ...log,
      createdAt: new Date().toISOString(),
    };

    db.usageLogs.push(newLog);
    writeDb(db);
    return newLog;
  },

  // 최근 로그 가져오기
  getRecent(limit: number = 100): UsageLog[] {
    const db = readDb();
    return db.usageLogs
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },

  // 플랫폼별 로그 가져오기
  getByPlatform(platform: string, limit: number = 100): UsageLog[] {
    const db = readDb();
    return db.usageLogs
      .filter(log => log.platform === platform)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },
};
