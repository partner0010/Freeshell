# MVP Phase 1 상세 설계

## 목표
AI Orchestrator + 기본 콘텐츠 생성 검증 (0-3개월)

## 핵심 기능

### 1. AI Orchestrator

**기능:**
- 무료 AI API 자동 라우팅
- Fallback 체인 관리
- 비용 최적화

**구현:**
```typescript
AI Providers (우선순위):
1. Ollama (로컬, 무료)
2. HuggingFace Inference API (무료)
3. Groq API (무료 티어)
4. Together AI (무료 티어)
5. Fallback: 템플릿 기반
```

**API 엔드포인트:**
- `POST /api/ai/generate` - 텍스트 생성
- `POST /api/ai/image` - 이미지 생성
- `GET /api/ai/status` - AI 상태 확인

### 2. 텍스트 콘텐츠 생성

**기능:**
- 블로그 글
- 소셜 미디어 포스트
- 마케팅 카피
- 이메일 템플릿

**UI:**
- 프롬프트 입력
- AI 생성 결과
- 편집기 (Rich Text)
- 다운로드/공유

### 3. 이미지 생성

**기능:**
- 프롬프트 → 이미지
- 스타일 변환
- 이미지 편집 (기본)

**AI:**
- HuggingFace Stable Diffusion
- Fallback: 템플릿 이미지

**UI:**
- 프롬프트 입력
- 스타일 선택
- 생성 결과
- 다운로드

### 4. 템플릿 라이브러리

**기능:**
- 100개 기본 템플릿
- 카테고리별 분류
- 검색/필터
- 커스터마이징

**템플릿 타입:**
- 텍스트 템플릿 (30개)
- 이미지 템플릿 (40개)
- 통합 템플릿 (30개)

### 5. 사용자 시스템

**기능:**
- 회원가입/로그인
- 프로필 관리
- 사용량 추적
- 구독 관리

**인증:**
- NextAuth.js
- 소셜 로그인 (Google, GitHub)

### 6. 대시보드

**기능:**
- 생성된 콘텐츠 목록
- 사용량 통계
- 최근 활동
- 빠른 생성 버튼

## 기술 스택 (Phase 1)

### Frontend
```json
{
  "framework": "Next.js 14+",
  "language": "TypeScript",
  "styling": "Tailwind CSS",
  "state": "Zustand",
  "ui": "shadcn/ui",
  "editor": "Tiptap (Rich Text)",
  "auth": "NextAuth.js"
}
```

### Backend
```json
{
  "api": "Next.js API Routes",
  "database": "PostgreSQL (Supabase)",
  "storage": "Supabase Storage",
  "cache": "Redis (Upstash 무료)",
  "ai": {
    "local": "Ollama",
    "cloud": ["HuggingFace", "Groq", "Together"]
  }
}
```

### AI Services
```typescript
// 무료 AI API 우선순위
const AI_PROVIDERS = [
  { name: 'Ollama', type: 'local', cost: 0 },
  { name: 'HuggingFace', type: 'api', cost: 0, limit: '30/min' },
  { name: 'Groq', type: 'api', cost: 0, limit: '30/min' },
  { name: 'Together', type: 'api', cost: 0, limit: '1000/day' }
];
```

## 데이터베이스 스키마

### Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  plan VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Contents
```sql
CREATE TABLE contents (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type VARCHAR(50), -- 'text', 'image', 'template'
  title VARCHAR(255),
  data JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Templates
```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  category VARCHAR(100),
  type VARCHAR(50),
  data JSONB,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP
);
```

### AI_Usage
```sql
CREATE TABLE ai_usage (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  provider VARCHAR(50),
  type VARCHAR(50),
  tokens_used INTEGER,
  cost DECIMAL(10,4),
  created_at TIMESTAMP
);
```

## API 설계

### AI Generation
```typescript
POST /api/ai/generate
Body: {
  prompt: string;
  type: 'text' | 'image';
  options?: {
    style?: string;
    length?: number;
  };
}
Response: {
  success: boolean;
  content: string | string[]; // text or image URLs
  provider: string;
  fallback_used: boolean;
}
```

### Content Management
```typescript
GET /api/contents
POST /api/contents
GET /api/contents/:id
PUT /api/contents/:id
DELETE /api/contents/:id
```

### Templates
```typescript
GET /api/templates?category=text&search=blog
GET /api/templates/:id
POST /api/templates/:id/use
```

## UI/UX 설계

### 메인 페이지
- Hero Section (AI 생성 강조)
- 빠른 생성 버튼
- 템플릿 갤러리
- 사용자 통계

### 생성 페이지
- 프롬프트 입력
- 옵션 선택
- 생성 버튼
- 결과 표시
- 편집/다운로드

### 대시보드
- 콘텐츠 목록
- 사용량 차트
- 빠른 액션

## 수익 모델 (Phase 1)

### 무료 플랜
- 텍스트 생성: 10회/일
- 이미지 생성: 5회/일
- 기본 템플릿 사용

### 유료 플랜 ($9.99/월)
- 무제한 생성
- 프리미엄 템플릿
- 고급 편집 기능
- 우선 AI 처리

## 개발 로드맵

### Week 1-2: 기반 구축
- 프로젝트 초기화
- 인증 시스템
- 데이터베이스 설정
- 기본 UI

### Week 3-4: AI Orchestrator
- Ollama 통합
- HuggingFace API 통합
- Fallback 시스템
- 모니터링

### Week 5-6: 콘텐츠 생성
- 텍스트 생성 UI/API
- 이미지 생성 UI/API
- 결과 저장/관리

### Week 7-8: 템플릿 시스템
- 템플릿 DB
- 템플릿 갤러리
- 커스터마이징

### Week 9-10: 사용자 시스템
- 프로필
- 사용량 추적
- 구독 관리

### Week 11-12: 테스트 & 배포
- 통합 테스트
- 성능 최적화
- 배포 준비

---

**다음 단계:**
1. 프로젝트 디렉토리 구조 생성
2. 핵심 모듈 구현 시작
