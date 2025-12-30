# Shell 통합 AI 솔루션 - 기술 명세서

## 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [시스템 아키텍처](#시스템-아키텍처)
3. [기술 스택](#기술-스택)
4. [기능 명세](#기능-명세)
5. [디자인 시스템](#디자인-시스템)
6. [API 명세](#api-명세)
7. [보안 고려사항](#보안-고려사항)
8. [데이터베이스 설계](#데이터베이스-설계)
9. [배포 전략](#배포-전략)
10. [성능 최적화](#성능-최적화)
11. [확장성 계획](#확장성-계획)
12. [마이그레이션 가이드](#마이그레이션-가이드)

---

## 프로젝트 개요

### 1.1 프로젝트 소개

**Shell**은 AI 검색, 콘텐츠 생성, 동영상 제작까지 모든 기능을 하나로 통합한 올인원 AI 플랫폼입니다. 사용자는 단일 인터페이스를 통해 다양한 AI 기능을 활용하여 검색, 콘텐츠 생성, 멀티미디어 제작 등의 작업을 수행할 수 있습니다.

### 1.2 핵심 가치 제안

- **통합된 AI 플랫폼**: 여러 AI 서비스를 하나의 인터페이스로 통합
- **노코드 AI 에이전트**: 복잡한 AI 작업을 자동화하는 Spark 워크스페이스
- **올인원 동영상 제작**: 대본 생성부터 최종 영상 합성까지 자동화된 포켓 시스템
- **다중 AI 모델 지원**: OpenAI GPT-4, Anthropic Claude, Google Gemini 지원
- **실시간 협업**: AI 에이전트 간 협력 작업 지원

### 1.3 주요 특징

- 🌐 **AI 검색 엔진**: 실시간 맞춤형 페이지 생성
- ✨ **Spark 워크스페이스**: 노코드 AI 에이전트
- 📁 **AI 드라이브**: 생성된 콘텐츠 저장 및 관리
- 🎬 **포켓**: 올인원 동영상 제작 시스템
- 🔄 **AI 에이전트 협력**: 다중 에이전트 협업
- 🎨 **이미지 생성**: DALL-E 3 기반 이미지 생성
- 🌍 **다국어 번역**: 실시간 번역 지원
- 🔍 **교차 검색**: 여러 검색 엔진 동시 검색

### 1.4 버전 정보

- **현재 버전**: 2.0.0
- **프레임워크**: Next.js 14.2.0
- **언어**: TypeScript 5.4.0
- **배포 플랫폼**: Netlify
- **도메인**: freeshell.co.kr

---

## 시스템 아키텍처

### 2.1 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (Browser)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   React UI   │  │  Components  │  │  State Mgmt  │      │
│  │   (Next.js)  │  │  (Custom)    │  │  (Zustand)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            │
┌─────────────────────────────────────────────────────────────┐
│                  Next.js Application Server                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  App Router  │  │  API Routes  │  │  Middleware  │      │
│  │  (SSR/SSG)   │  │  (Server)    │  │  (Security)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┼───────────┐
                │           │           │
┌───────────────▼───┐  ┌────▼────┐  ┌──▼──────────────┐
│   OpenAI API      │  │ Claude  │  │  Google Gemini  │
│   (GPT-4, DALL-E) │  │   API   │  │      API        │
└───────────────────┘  └─────────┘  └─────────────────┘
                │           │           │
┌───────────────▼───────────▼───────────▼──────────────┐
│              External AI Services                      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│  │  Kling  │  │ ElevenLabs│ │  Wisk   │ │  Other  │ │
│  │   AI    │  │    AI    │  │   AI    │ │   APIs  │ │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘ │
└────────────────────────────────────────────────────────┘
```

### 2.2 레이어 구조

#### 2.2.1 Presentation Layer
- **Next.js App Router**: 서버 사이드 렌더링 및 정적 생성
- **React Components**: 재사용 가능한 UI 컴포넌트
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **Framer Motion**: 애니메이션 및 전환 효과

#### 2.2.2 Application Layer
- **API Routes**: 서버 사이드 API 엔드포인트
- **Middleware**: 인증, 보안, 라우팅 처리
- **State Management**: Zustand를 통한 전역 상태 관리

#### 2.2.3 Service Layer
- **OpenAI Service**: GPT-4, DALL-E 3 통합
- **Anthropic Service**: Claude API 통합
- **Google Service**: Gemini API 통합
- **Video Production Service**: 동영상 제작 파이프라인
- **Research Service**: 심층 연구 및 분석

#### 2.2.4 Data Layer
- **Environment Variables**: API 키 및 설정 관리
- **Local Storage**: 클라이언트 사이드 데이터 저장
- **Session Storage**: 세션 데이터 관리

### 2.3 컴포넌트 아키텍처

```
components/
├── Layout/
│   ├── Navbar.tsx          # 네비게이션 바
│   ├── Footer.tsx          # 푸터
│   ├── Sidebar.tsx         # 사이드바
│   └── ThemeProvider.tsx   # 테마 관리
├── Features/
│   ├── SearchEngine.tsx    # AI 검색 엔진
│   ├── SparkWorkspace.tsx  # Spark 워크스페이스
│   ├── AIDrive.tsx         # AI 드라이브
│   ├── Pocket.tsx          # 포켓 동영상 제작
│   └── ImageGenerator.tsx  # 이미지 생성
├── UI/
│   ├── Hero.tsx            # 히어로 섹션
│   ├── Features.tsx        # 기능 소개
│   ├── Pricing.tsx         # 가격표
│   └── ResultCard.tsx      # 결과 카드
├── Utilities/
│   ├── VoiceSearch.tsx     # 음성 검색
│   ├── Translator.tsx      # 번역기
│   ├── CrossSearch.tsx     # 교차 검색
│   └── CommandPalette.tsx  # 명령 팔레트
└── Shared/
    ├── ErrorBoundary.tsx   # 에러 바운더리
    ├── SkeletonLoader.tsx  # 스켈레톤 로더
    └── ToastNotifications.tsx # 토스트 알림
```

---

## 기술 스택

### 3.1 프론트엔드

#### 3.1.1 Core Framework
- **Next.js 14.2.0**
  - App Router 기반 라우팅
  - Server Components 및 Client Components 분리
  - Server Side Rendering (SSR)
  - Static Site Generation (SSG)
  - Incremental Static Regeneration (ISR)
  - API Routes

- **React 18.3.0**
  - 함수형 컴포넌트 및 Hooks
  - Concurrent Features
  - Suspense 및 Error Boundaries

- **TypeScript 5.4.0**
  - 정적 타입 검사
  - 타입 안정성 보장
  - 코드 자동완성 및 리팩토링 지원

#### 3.1.2 스타일링
- **Tailwind CSS 3.4.0**
  - 유틸리티 퍼스트 CSS 프레임워크
  - 커스텀 테마 설정
  - 다크 모드 지원
  - 반응형 디자인

- **PostCSS 8.4.0**
  - CSS 변환 및 최적화
  - Autoprefixer 통합

- **Framer Motion 11.0.0**
  - 선언적 애니메이션
  - 제스처 인식
  - 레이아웃 애니메이션
  - 스크롤 애니메이션

#### 3.1.3 상태 관리
- **Zustand 4.5.0**
  - 경량 상태 관리 라이브러리
  - TypeScript 지원
  - 미들웨어 지원

#### 3.1.4 UI 라이브러리
- **Lucide React 0.344.0**
  - 아이콘 라이브러리
  - 트리 쉐이킹 지원

- **React Hot Toast 2.4.0**
  - 토스트 알림 시스템
  - 커스터마이징 가능

- **React Markdown 9.0.0**
  - 마크다운 렌더링
  - 구문 강조 지원

- **React Syntax Highlighter 15.5.0**
  - 코드 블록 구문 강조
  - 다중 언어 지원

### 3.2 백엔드

#### 3.2.1 서버 프레임워크
- **Next.js API Routes**
  - RESTful API 엔드포인트
  - 서버 사이드 로직 처리
  - 미들웨어 통합

#### 3.2.2 인증
- **NextAuth.js 4.24.5**
  - 인증 시스템
  - 세션 관리
  - 소셜 로그인 지원 (Google, GitHub, Facebook, Twitter)
  - JWT 토큰 관리

- **bcryptjs 2.4.3**
  - 비밀번호 해싱
  - 보안 저장

### 3.3 AI 통합

#### 3.3.1 OpenAI
- **OpenAI SDK 4.28.0**
  - GPT-4 Turbo: 텍스트 생성
  - DALL-E 3: 이미지 생성
  - Whisper: 음성 인식 (예정)

#### 3.3.2 Anthropic
- **Anthropic API** (HTTP 통합)
  - Claude 3: 고급 텍스트 생성
  - 긴 컨텍스트 처리

#### 3.3.3 Google
- **Google Gemini API** (HTTP 통합)
  - Gemini Pro: 멀티모달 AI
  - 이미지 및 텍스트 처리

### 3.4 데이터 시각화
- **Recharts 2.12.0**
  - 차트 라이브러리
  - 반응형 차트
  - 인터랙티브 그래프

### 3.5 기타 라이브러리
- **Axios 1.6.0**: HTTP 클라이언트
- **@dnd-kit**: 드래그 앤 드롭 기능
- **React Hot Toast**: 알림 시스템

### 3.6 개발 도구
- **ESLint 8.57.0**: 코드 린팅
- **eslint-config-next**: Next.js 린트 규칙
- **TypeScript**: 타입 체크

---

## 기능 명세

### 4.1 AI 검색 엔진

#### 4.1.1 핵심 기능
- **실시간 페이지 생성**: 검색 쿼리 기반 맞춤형 Spark 페이지 자동 생성
- **다중 AI 모델 지원**: GPT-4, Claude, Gemini 중 선택 가능
- **음성 검색**: Web Speech API를 통한 음성 입력 지원
- **고급 검색 필터**: 날짜, 언어, 파일 유형 등 필터링

#### 4.1.2 기술 구현
```typescript
// app/api/search/route.ts
- POST /api/search: 검색 요청 처리
- 입력: { query: string, model?: string, filters?: object }
- 출력: { results: [], sparkPageId: string }
```

#### 4.1.3 관련 컴포넌트
- `components/SearchEngine.tsx`: 메인 검색 인터페이스
- `components/VoiceSearch.tsx`: 음성 검색
- `components/AdvancedSearchFilters.tsx`: 고급 필터
- `components/SearchHistory.tsx`: 검색 기록
- `components/SearchResultPage.tsx`: 검색 결과 페이지

### 4.2 Spark 워크스페이스

#### 4.2.1 핵심 기능
- **노코드 AI 에이전트**: 복잡한 작업을 자동화하는 AI 에이전트 생성
- **다양한 작업 유형**: 비디오, 문서, 프레젠테이션, 웹사이트 생성
- **워크플로우 빌더**: 시각적 워크플로우 구성
- **버전 관리**: 생성된 콘텐츠의 버전 히스토리 관리

#### 4.2.2 기술 구현
```typescript
// app/api/spark/route.ts
- POST /api/spark: 새로운 Spark 작업 생성
- GET /api/spark/[id]: Spark 작업 조회
- PUT /api/spark/[id]: Spark 작업 업데이트
```

#### 4.2.3 관련 컴포넌트
- `components/SparkWorkspace.tsx`: 메인 워크스페이스
- `app/spark/[id]/page.tsx`: Spark 페이지 상세
- `app/spark/[id]/history/page.tsx`: 버전 히스토리

### 4.3 AI 드라이브

#### 4.3.1 핵심 기능
- **콘텐츠 저장**: 생성된 모든 콘텐츠 저장
- **파일 관리**: 폴더 구조 및 파일 조직
- **버전 관리**: 파일 버전 히스토리
- **공유 및 협업**: 링크 공유 및 팀 협업

#### 4.3.2 기술 구현
```typescript
// app/api/drive/route.ts
- GET /api/drive: 파일 목록 조회
- POST /api/drive: 파일 생성
- PUT /api/drive/[id]: 파일 업데이트
- DELETE /api/drive/[id]: 파일 삭제
```

#### 4.3.3 관련 컴포넌트
- `components/AIDrive.tsx`: 메인 드라이브 인터페이스
- `components/FilePreview.tsx`: 파일 미리보기
- `components/DragAndDrop.tsx`: 드래그 앤 드롭
- `components/ShareLinkManager.tsx`: 공유 링크 관리

### 4.4 포켓 - 올인원 동영상 제작

#### 4.4.1 핵심 기능
포켓은 4단계 파이프라인으로 동영상을 자동 제작합니다:

1. **대본 생성** (ChatGPT)
   - 주제 기반 대본 생성
   - 캐릭터 프롬프트 생성
   - 장면 구성

2. **이미지 생성** (Google Wisk / DALL-E 3)
   - 연출 장면 이미지 생성 (최대 50개)
   - 다양한 스타일 지원 (3D, 실사, 사진 복원)

3. **애니메이션** (Google Wisk + Grok4 / Kling AI)
   - 자연스러운 움직임 생성
   - 이미지-투-비디오 변환
   - 카메라 워크 자동 생성

4. **오디오 합성** (MMAudio AI / ElevenLabs)
   - 나레이션 생성
   - 배경 음악 생성
   - 효과음 추가

#### 4.4.2 기술 구현
```typescript
// lib/video-production.ts
interface VideoProductionPipeline {
  generateScript(topic: string): Promise<Script>;
  generateImages(script: Script): Promise<SceneImage[]>;
  animateImages(images: SceneImage[]): Promise<VideoScene[]>;
  generateAudio(script: Script): Promise<AudioTrack>;
  composeVideo(scenes: VideoScene[], audio: AudioTrack): Promise<Video>;
}
```

#### 4.4.3 관련 컴포넌트
- `components/Pocket.tsx`: 메인 포켓 인터페이스
- `app/api/video/animate/route.ts`: 애니메이션 API
- `app/api/video/compose/route.ts`: 비디오 합성 API
- `app/api/audio/generate/route.ts`: 오디오 생성 API

### 4.5 AI 에이전트 협력

#### 4.5.1 핵심 기능
- **검색 에이전트**: 정보 수집 및 정리
- **분석 에이전트**: 데이터 분석 및 인사이트 도출
- **요약 에이전트**: 내용 요약 및 구조화
- **순차적 협업**: 여러 에이전트가 순차적으로 작업 수행

#### 4.5.2 기술 구현
```typescript
// components/AIAgentCollaboration.tsx
interface Agent {
  name: string;
  role: 'search' | 'analyze' | 'summarize';
  execute(input: any): Promise<any>;
}

class AgentPipeline {
  agents: Agent[];
  execute(input: any): Promise<FinalResult>;
}
```

#### 4.5.3 관련 컴포넌트
- `components/AIAgentCollaboration.tsx`: 에이전트 협업 인터페이스
- `lib/automation.ts`: 자동화 로직

### 4.6 이미지 생성

#### 4.6.1 핵심 기능
- **DALL-E 3 통합**: 고품질 이미지 생성
- **프롬프트 자동 개선**: AI가 프롬프트 최적화
- **스타일 옵션**: 다양한 아트 스타일 지원
- **이미지 최적화**: 자동 이미지 최적화

#### 4.6.2 기술 구현
```typescript
// app/api/generate/route.ts
- POST /api/generate: 이미지 생성 요청
- 입력: { prompt: string, style?: string, size?: string }
- 출력: { url: string, revised_prompt?: string }
```

#### 4.6.3 관련 컴포넌트
- `components/ImageGenerator.tsx`: 이미지 생성 인터페이스
- `components/ImageOptimizer.tsx`: 이미지 최적화

### 4.7 번역 기능

#### 4.7.1 핵심 기능
- **다국어 지원**: 100개 이상 언어 지원
- **실시간 번역**: 즉시 번역 결과 제공
- **문맥 인식**: 문맥을 고려한 정확한 번역
- **일괄 번역**: 여러 텍스트 동시 번역

#### 4.7.2 관련 컴포넌트
- `components/Translator.tsx`: 번역 인터페이스

### 4.8 교차 검색

#### 4.8.1 핵심 기능
- **다중 검색 엔진**: 여러 검색 엔진 동시 검색
- **결과 통합**: 검색 결과 통합 및 정렬
- **중복 제거**: 중복 결과 자동 제거
- **관련성 스코어**: 결과 관련성 점수 제공

#### 4.8.2 관련 컴포넌트
- `components/CrossSearch.tsx`: 교차 검색 인터페이스

### 4.9 사용자 인증 및 관리

#### 4.9.1 핵심 기능
- **회원가입/로그인**: 이메일 기반 인증
- **소셜 로그인**: Google, GitHub, Facebook, Twitter
- **이메일 인증**: 이메일 확인 시스템
- **2단계 인증 (2FA)**: 보안 강화
- **비밀번호 재설정**: 비밀번호 복구 기능

#### 4.9.2 기술 구현
```typescript
// app/api/auth/login
// app/api/auth/signup
// app/api/auth/verify-email
// NextAuth.js 통합
```

#### 4.9.3 관련 컴포넌트
- `app/auth/login/page.tsx`: 로그인 페이지
- `app/auth/signup/page.tsx`: 회원가입 페이지
- `components/TwoFactorAuth.tsx`: 2FA 컴포넌트
- `components/EmailVerification.tsx`: 이메일 인증

### 4.10 대시보드

#### 4.10.1 핵심 기능
- **통계 대시보드**: 사용량 및 활동 통계
- **활동 로그**: 모든 활동 추적
- **사용량 모니터링**: API 사용량 및 쿼터 모니터링
- **청구/결제**: 구독 및 결제 관리
- **설정**: 계정 설정 및 기본 설정
- **팀 관리**: 팀원 초대 및 권한 관리
- **웹훅 관리**: 웹훅 설정 및 관리
- **API 키 관리**: API 키 생성 및 관리

#### 4.10.2 관련 페이지
- `app/dashboard/page.tsx`: 메인 대시보드
- `app/dashboard/analytics/page.tsx`: 분석
- `app/dashboard/activity/page.tsx`: 활동 로그
- `app/dashboard/usage/page.tsx`: 사용량
- `app/dashboard/billing/page.tsx`: 청구
- `app/dashboard/settings/page.tsx`: 설정
- `app/dashboard/team/page.tsx`: 팀 관리
- `app/dashboard/webhooks/page.tsx`: 웹훅 관리

---

## 디자인 시스템

### 5.1 디자인 원칙

#### 5.1.1 핵심 원칙
1. **간결성**: 불필요한 요소 제거, 핵심 기능에 집중
2. **일관성**: 전체 애플리케이션에 걸쳐 일관된 디자인 언어
3. **접근성**: WCAG 2.1 AA 수준 준수
4. **반응형**: 모든 디바이스에서 최적의 경험 제공
5. **성능**: 빠른 로딩 및 부드러운 애니메이션

### 5.2 컬러 시스템

#### 5.2.1 Primary Colors
```typescript
primary: {
  DEFAULT: "#6366f1",  // Indigo 500
  dark: "#4f46e5",     // Indigo 600
  light: "#818cf8",    // Indigo 400
  50: "#eef2ff",
  100: "#e0e7ff",
  200: "#c7d2fe",
  300: "#a5b4fc",
  400: "#818cf8",
  500: "#6366f1",
  600: "#4f46e5",
  700: "#4338ca",
  800: "#3730a3",
  900: "#312e81",
}
```

#### 5.2.2 Secondary Colors
```typescript
secondary: {
  DEFAULT: "#8b5cf6",  // Purple 500
  dark: "#7c3aed",     // Purple 600
  light: "#a78bfa",    // Purple 400
  // ... full palette
}
```

#### 5.2.3 Semantic Colors
- **Success**: Green (#10b981)
- **Error**: Red (#ef4444)
- **Warning**: Yellow (#f59e0b)
- **Info**: Blue (#3b82f6)

#### 5.2.4 다크 모드
- 자동 시스템 테마 감지
- 수동 테마 전환 지원
- localStorage에 테마 저장
- 부드러운 테마 전환 애니메이션

### 5.3 타이포그래피

#### 5.3.1 폰트 패밀리
- **제목**: System font stack (San Francisco, Segoe UI, etc.)
- **본문**: System font stack
- **코드**: Monospace font stack

#### 5.3.2 타이포그래피 스케일
```css
text-5xl: 3rem (48px)    /* Hero 제목 */
text-4xl: 2.25rem (36px) /* 대제목 */
text-3xl: 1.875rem (30px) /* 중제목 */
text-2xl: 1.5rem (24px)   /* 소제목 */
text-xl: 1.25rem (20px)   /* 강조 본문 */
text-lg: 1.125rem (18px)  /* 본문 */
text-base: 1rem (16px)    /* 기본 본문 */
text-sm: 0.875rem (14px)  /* 작은 본문 */
text-xs: 0.75rem (12px)   /* 매우 작은 본문 */
```

### 5.4 간격 시스템

#### 5.4.1 Spacing Scale
Tailwind CSS 기본 spacing scale 사용 (4px 단위):
- `p-1`: 4px
- `p-2`: 8px
- `p-4`: 16px
- `p-6`: 24px
- `p-8`: 32px
- `p-12`: 48px
- `p-16`: 64px
- `p-20`: 80px

### 5.5 컴포넌트 스타일

#### 5.5.1 버튼
```typescript
// Primary Button
className="px-8 py-4 bg-primary text-white rounded-lg 
          font-semibold hover:bg-primary-dark 
          transition-all transform hover:scale-105"

// Secondary Button
className="px-8 py-4 bg-white dark:bg-gray-800 
          text-gray-900 dark:text-white rounded-lg 
          border-2 border-gray-200 dark:border-gray-700 
          hover:border-primary transition-all"
```

#### 5.5.2 카드
```typescript
className="bg-white dark:bg-gray-800 rounded-2xl 
          shadow-2xl p-8 border border-gray-200 
          dark:border-gray-700"
```

#### 5.5.3 입력 필드
```typescript
className="w-full pl-12 pr-4 py-4 
          bg-gray-50 dark:bg-gray-900 
          border border-gray-200 dark:border-gray-700 
          rounded-lg focus:outline-none 
          focus:ring-2 focus:ring-primary"
```

### 5.6 애니메이션

#### 5.6.1 Framer Motion 애니메이션
```typescript
// 페이드 인
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}

// 슬라이드 업
initial={{ opacity: 0, y: 40 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.7, delay: 0.2 }}

// 스케일
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
```

#### 5.6.2 CSS 애니메이션
```css
@keyframes gradient {
  0%, 100% {
    background-size: 200% 200%;
    background-position: left center;
  }
  50% {
    background-size: 200% 200%;
    background-position: right center;
  }
}

.gradient-text {
  background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
  background-size: 200% 200%;
  animation: gradient 8s linear infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### 5.7 반응형 디자인

#### 5.7.1 Breakpoints
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

#### 5.7.2 반응형 패턴
```typescript
// 모바일 우선 접근
<div className="
  flex flex-col sm:flex-row
  text-sm md:text-base lg:text-lg
  p-4 md:p-6 lg:p-8
">
```

### 5.8 접근성

#### 5.8.1 WCAG 2.1 AA 준수
- **색상 대비**: 최소 4.5:1 (본문), 3:1 (UI 요소)
- **키보드 내비게이션**: 모든 인터랙티브 요소 접근 가능
- **스크린 리더**: 적절한 ARIA 레이블 및 역할
- **포커스 표시**: 명확한 포커스 인디케이터
- **알터너티브 텍스트**: 모든 이미지에 alt 텍스트

#### 5.8.2 접근성 컴포넌트
- `components/Accessibility.tsx`: 접근성 기능 통합
- 키보드 단축키 지원
- 스크린 리더 최적화

---

## API 명세

### 6.1 검색 API

#### 6.1.1 POST /api/search
검색 요청을 처리하고 Spark 페이지를 생성합니다.

**Request Body:**
```typescript
{
  query: string;           // 검색 쿼리
  model?: string;          // AI 모델 (gpt-4, claude, gemini)
  filters?: {
    date?: string;         // 날짜 필터
    language?: string;     // 언어 필터
    fileType?: string;     // 파일 유형 필터
  };
}
```

**Response:**
```typescript
{
  results: Array<{
    id: string;
    title: string;
    content: string;
    url?: string;
    score: number;
  }>;
  sparkPageId: string;     // 생성된 Spark 페이지 ID
  model: string;           // 사용된 AI 모델
}
```

### 6.2 Spark API

#### 6.2.1 POST /api/spark
새로운 Spark 작업을 생성합니다.

**Request Body:**
```typescript
{
  type: 'video' | 'document' | 'presentation' | 'website';
  topic: string;
  requirements?: string;
}
```

**Response:**
```typescript
{
  id: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
}
```

#### 6.2.2 GET /api/spark/[id]
Spark 작업을 조회합니다.

**Response:**
```typescript
{
  id: string;
  type: string;
  status: string;
  result: any;
  createdAt: string;
  updatedAt: string;
}
```

### 6.3 이미지 생성 API

#### 6.3.1 POST /api/generate
AI 이미지를 생성합니다.

**Request Body:**
```typescript
{
  prompt: string;          // 이미지 설명
  style?: string;          // 스타일 (3d, realistic, photo, etc.)
  size?: '256x256' | '512x512' | '1024x1024';
}
```

**Response:**
```typescript
{
  url: string;             // 생성된 이미지 URL
  revised_prompt?: string; // 개선된 프롬프트
}
```

### 6.4 동영상 제작 API

#### 6.4.1 POST /api/video/animate
이미지를 애니메이션으로 변환합니다.

**Request Body:**
```typescript
{
  images: Array<{
    url: string;
    prompt: string;
  }>;
  style?: '3d' | 'realistic' | 'photo';
}
```

**Response:**
```typescript
{
  scenes: Array<{
    url: string;           // 생성된 비디오 씬 URL
    duration: number;
  }>;
}
```

#### 6.4.2 POST /api/video/compose
비디오 씬과 오디오를 합성합니다.

**Request Body:**
```typescript
{
  scenes: Array<{ url: string; duration: number }>;
  audio: {
    narration?: string;    // 나레이션 오디오 URL
    background?: string;   // 배경 음악 URL
    effects?: string[];    // 효과음 URL 배열
  };
}
```

**Response:**
```typescript
{
  videoUrl: string;        // 최종 비디오 URL
  duration: number;
}
```

### 6.5 오디오 생성 API

#### 6.5.1 POST /api/audio/generate
오디오를 생성합니다.

**Request Body:**
```typescript
{
  type: 'narration' | 'music' | 'effect';
  text?: string;           // 나레이션 텍스트 (narration인 경우)
  style?: string;          // 음악 스타일 (music인 경우)
  effectType?: string;     // 효과 유형 (effect인 경우)
}
```

**Response:**
```typescript
{
  url: string;             // 생성된 오디오 URL
  duration: number;
}
```

### 6.6 드라이브 API

#### 6.6.1 GET /api/drive
파일 목록을 조회합니다.

**Query Parameters:**
- `folderId?: string`: 폴더 ID
- `page?: number`: 페이지 번호
- `limit?: number`: 페이지당 항목 수

**Response:**
```typescript
{
  files: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    createdAt: string;
    updatedAt: string;
  }>;
  total: number;
  page: number;
  limit: number;
}
```

#### 6.6.2 POST /api/drive
새 파일을 생성합니다.

**Request Body:**
```typescript
{
  name: string;
  type: string;
  content: any;
  folderId?: string;
}
```

**Response:**
```typescript
{
  id: string;
  name: string;
  url: string;
  createdAt: string;
}
```

### 6.7 연구 API

#### 6.7.1 POST /api/research
심층 연구를 수행합니다.

**Request Body:**
```typescript
{
  topic: string;
  depth?: 'basic' | 'standard' | 'deep';
  sources?: number;        // 소스 개수
}
```

**Response:**
```typescript
{
  topic: string;
  summary: string;
  insights: string[];
  data: {
    marketSize?: string;
    growthRate?: string;
    keyPlayers?: string[];
    trends?: string[];
  };
  sources: string[];
  analysis: string;
  generatedAt: string;
}
```

### 6.8 인증 API

#### 6.8.1 POST /api/auth/login
로그인을 처리합니다.

**Request Body:**
```typescript
{
  email: string;
  password: string;
}
```

**Response:**
```typescript
{
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
}
```

#### 6.8.2 POST /api/auth/signup
회원가입을 처리합니다.

**Request Body:**
```typescript
{
  email: string;
  password: string;
  name: string;
}
```

**Response:**
```typescript
{
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
}
```

---

## 보안 고려사항

### 7.1 입력 검증

#### 7.1.1 서버 사이드 검증
모든 사용자 입력은 서버 사이드에서 검증됩니다.

```typescript
// lib/security/input-validation.ts
export function validateInput(input: string, options: {
  maxLength?: number;
  minLength?: number;
  allowHtml?: boolean;
  required?: boolean;
  type?: 'string' | 'number' | 'email' | 'url';
}): { valid: boolean; sanitized: string; error?: string }
```

#### 7.1.2 XSS 방지
- HTML 이스케이프 처리
- Content Security Policy (CSP) 설정
- React의 자동 XSS 방지 기능 활용

### 7.2 인증 및 권한

#### 7.2.1 NextAuth.js
- JWT 토큰 기반 인증
- 세션 관리
- 소셜 로그인 OAuth 2.0

#### 7.2.2 비밀번호 보안
- bcryptjs를 통한 비밀번호 해싱
- 최소 비밀번호 요구사항 강제
- 비밀번호 재설정 토큰 만료

#### 7.2.3 2단계 인증 (2FA)
- TOTP (Time-based One-Time Password) 지원
- 백업 코드 제공

### 7.3 API 보안

#### 7.3.1 Rate Limiting
```typescript
// lib/security/rate-limit.ts
- IP 기반 rate limiting
- 사용자별 rate limiting
- API 키 기반 rate limiting
```

#### 7.3.2 CORS 설정
```typescript
// next.config.js
- 특정 도메인만 허용
- 자격 증명 포함 요청 처리
```

#### 7.3.3 CSRF 보호
```typescript
// lib/security/csrf.ts
- CSRF 토큰 생성 및 검증
- SameSite 쿠키 설정
```

### 7.4 보안 헤더

#### 7.4.1 Next.js 보안 헤더
```typescript
// next.config.js
headers: [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: '...'
  }
]
```

#### 7.4.2 Netlify 보안 헤더
```toml
# netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
```

### 7.5 환경 변수 보안

#### 7.5.1 환경 변수 관리
- `.env.local`: 로컬 개발 (gitignore에 포함)
- 서버 사이드만 접근 가능한 변수는 `NEXT_PUBLIC_` 접두사 없이 사용
- API 키는 서버 사이드에서만 사용

#### 7.5.2 환경 변수 검증
```typescript
// lib/security/env-security.ts
- 필수 환경 변수 존재 확인
- 환경 변수 형식 검증
```

---

## 데이터베이스 설계

### 8.1 데이터 저장 전략

현재 버전은 데이터베이스를 사용하지 않고, 다음 방식으로 데이터를 관리합니다:

1. **클라이언트 사이드 저장**: LocalStorage, SessionStorage
2. **서버 사이드 저장**: 필요시 파일 시스템 또는 외부 스토리지
3. **세션 관리**: NextAuth.js 세션

### 8.2 향후 데이터베이스 통합 계획

#### 8.2.1 권장 데이터베이스
- **PostgreSQL**: 관계형 데이터 (사용자, 파일, 팀 등)
- **MongoDB**: 문서 기반 데이터 (Spark 작업, 콘텐츠 등)
- **Redis**: 캐싱 및 세션 관리

#### 8.2.2 데이터베이스 스키마 (예상)

**Users Table:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  email_verified BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Spark Workspaces Table:**
```sql
CREATE TABLE spark_workspaces (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  topic TEXT NOT NULL,
  content JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Files Table:**
```sql
CREATE TABLE files (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  url TEXT,
  size BIGINT,
  folder_id UUID REFERENCES folders(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 배포 전략

### 9.1 배포 플랫폼: Netlify

#### 9.1.1 Netlify 설정
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"
  base = "."

[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--legacy-peer-deps"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

#### 9.1.2 배포 프로세스
1. GitHub 저장소에 코드 푸시
2. Netlify가 자동으로 빌드 트리거
3. Next.js 프로덕션 빌드 실행
4. 자동 배포

### 9.2 배포 스크립트

#### 9.2.1 deploy.bat (Windows)
```batch
# .github/deploy.bat
1. 의존성 확인 및 설치
2. 빌드 테스트 (npm run build)
3. Git 커밋
4. GitHub 푸시 (master 및 main 브랜치)
```

### 9.3 환경 변수 설정

#### 9.3.1 Netlify 환경 변수
Netlify 대시보드에서 다음 환경 변수를 설정해야 합니다:

```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=...
GOOGLE_API_KEY=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://freeshell.co.kr
```

### 9.4 도메인 설정

- **프로덕션 도메인**: freeshell.co.kr
- **Netlify 도메인**: 자동 생성된 *.netlify.app 도메인
- **SSL/TLS**: Netlify 자동 SSL 인증서

### 9.5 CI/CD 파이프라인

#### 9.5.1 자동 배포 흐름
```
GitHub Push → Netlify Webhook → Build → Deploy → Production
```

#### 9.5.2 브랜치 전략
- **master/main**: 프로덕션 배포
- **develop**: 개발 환경 (선택사항)

---

## 성능 최적화

### 10.1 Next.js 최적화

#### 10.1.1 Server Components
- 가능한 한 Server Components 사용
- 클라이언트 사이드 JavaScript 감소

#### 10.1.2 정적 생성 (SSG)
- 정적 페이지는 빌드 타임에 생성
- ISR을 통한 주기적 재생성

#### 10.1.3 이미지 최적화
```typescript
// next/image 사용
import Image from 'next/image';

<Image
  src="/image.jpg"
  width={800}
  height={600}
  alt="Description"
  priority // LCP 최적화
/>
```

### 10.2 코드 최적화

#### 10.2.1 코드 분할
- 동적 import를 통한 코드 스플리팅
- 라우트 기반 코드 분할

#### 10.2.2 트리 쉐이킹
- 필요한 모듈만 import
- Barrel exports 최소화

#### 10.2.3 번들 최적화
- SWC 컴파일러 사용 (next.config.js)
- Minification 활성화

### 10.3 캐싱 전략

#### 10.3.1 정적 자산 캐싱
```typescript
// next.config.js
headers: [
  {
    source: '/static/:path*',
    headers: [
      {
        key: 'Cache-Control',
        value: 'public, max-age=31536000, immutable',
      },
    ],
  },
]
```

#### 10.3.2 API 응답 캐싱
- 적절한 Cache-Control 헤더 설정
- 필요시 Redis 캐싱 (향후 계획)

### 10.4 네트워크 최적화

#### 10.4.1 HTTP/2
- Netlify 자동 HTTP/2 지원

#### 10.4.2 압축
```typescript
// next.config.js
compress: true
```

#### 10.4.3 CDN
- Netlify Edge Network 활용
- 전역 CDN 배포

### 10.5 모니터링 및 분석

#### 10.5.1 성능 모니터링
- Web Vitals 측정
- Lighthouse CI 통합 (향후 계획)

#### 10.5.2 에러 추적
- Error Boundaries를 통한 에러 처리
- 에러 로깅 (향후 계획)

---

## 확장성 계획

### 11.1 수평 확장

#### 11.1.1 서버리스 아키텍처
- Next.js 서버리스 함수 활용
- Netlify Functions 통합

#### 11.1.2 마이크로서비스 전환 (향후)
- API 서비스 분리
- 독립적인 배포 가능한 서비스

### 11.2 데이터베이스 확장

#### 11.2.1 읽기 복제본
- 읽기 작업 분산
- 성능 향상

#### 11.2.2 샤딩 (향후)
- 대규모 데이터 처리
- 수평 확장

### 11.3 캐싱 전략 확장

#### 11.3.1 Redis 통합 (향후)
- 세션 저장
- API 응답 캐싱
- 실시간 데이터 캐싱

#### 11.3.2 CDN 최적화
- 정적 자산 CDN 배포
- 동적 콘텐츠 에지 캐싱

### 11.4 기능 확장

#### 11.4.1 플러그인 시스템 (향후)
- 서드파티 통합
- 커스텀 워크플로우

#### 11.4.2 API 마켓플레이스 (향후)
- 서드파티 API 통합
- 사용자 정의 AI 모델 지원

---

## 마이그레이션 가이드

### 12.1 기존 솔루션에서 Shell로 마이그레이션

#### 12.1.1 준비 사항
1. **환경 확인**
   - Node.js 18 이상 설치
   - Git 설치 및 설정
   - GitHub 계정 준비

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **환경 변수 설정**
   - `.env.local` 파일 생성
   - 필요한 API 키 설정

#### 12.1.2 데이터 마이그레이션
1. **사용자 데이터**
   - 기존 사용자 데이터 export
   - Shell 형식으로 변환
   - 데이터 import (향후 데이터베이스 통합 시)

2. **콘텐츠 데이터**
   - 생성된 콘텐츠 export
   - 파일 형식 변환
   - AI 드라이브에 import

#### 12.1.3 설정 마이그레이션
1. **도메인 설정**
   - DNS 레코드 업데이트
   - Netlify 도메인 연결

2. **환경 변수 마이그레이션**
   - 기존 환경 변수 export
   - Netlify 환경 변수로 import

#### 12.1.4 테스트
1. **기능 테스트**
   - 모든 주요 기능 테스트
   - 사용자 플로우 확인

2. **성능 테스트**
   - 페이지 로딩 속도 확인
   - API 응답 시간 확인

3. **보안 테스트**
   - 인증/인가 테스트
   - 입력 검증 테스트

#### 12.1.5 배포
1. **스테이징 배포**
   - 테스트 환경에 먼저 배포
   - 검증 완료 후 프로덕션 배포

2. **프로덕션 배포**
   - `.github/deploy.bat` 실행
   - 배포 상태 모니터링

#### 12.1.6 롤백 계획
- 이전 버전 백업 보관
- 빠른 롤백 절차 준비
- 데이터 백업 및 복원 절차

### 12.2 마이그레이션 체크리스트

- [ ] 환경 변수 설정 완료
- [ ] API 키 설정 완료
- [ ] 데이터베이스 마이그레이션 (필요시)
- [ ] 도메인 설정 완료
- [ ] SSL 인증서 설정 완료
- [ ] 기능 테스트 완료
- [ ] 성능 테스트 완료
- [ ] 보안 테스트 완료
- [ ] 사용자 가이드 업데이트
- [ ] 모니터링 설정 완료

---

## 부록

### A. 파일 구조

```
shell/
├── .github/
│   └── deploy.bat              # 배포 스크립트
├── app/                        # Next.js App Router
│   ├── api/                    # API Routes
│   │   ├── admin/              # 관리자 API
│   │   ├── audio/              # 오디오 API
│   │   ├── drive/              # 드라이브 API
│   │   ├── generate/           # 생성 API
│   │   ├── research/           # 연구 API
│   │   ├── search/             # 검색 API
│   │   ├── spark/              # Spark API
│   │   └── video/              # 비디오 API
│   ├── auth/                   # 인증 페이지
│   ├── dashboard/              # 대시보드
│   ├── legal/                  # 법적 페이지
│   ├── research/               # 연구 페이지
│   ├── spark/                  # Spark 페이지
│   ├── globals.css             # 전역 스타일
│   ├── layout.tsx              # 루트 레이아웃
│   └── page.tsx                # 홈페이지
├── components/                 # React 컴포넌트
│   ├── ui/                     # UI 컴포넌트
│   └── ...                     # 기능 컴포넌트
├── lib/                        # 유틸리티 및 라이브러리
│   ├── security/               # 보안 유틸리티
│   ├── ai-models.ts            # AI 모델 통합
│   ├── openai.ts               # OpenAI 클라이언트
│   ├── research.ts             # 연구 기능
│   └── video-production.ts     # 비디오 제작
├── public/                     # 정적 파일
├── types/                      # TypeScript 타입 정의
├── netlify.toml                # Netlify 설정
├── next.config.js              # Next.js 설정
├── tailwind.config.ts          # Tailwind CSS 설정
├── tsconfig.json               # TypeScript 설정
└── package.json                # 프로젝트 의존성
```

### B. 주요 환경 변수

```env
# 필수
OPENAI_API_KEY=sk-...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://freeshell.co.kr

# 선택사항
ANTHROPIC_API_KEY=...
GOOGLE_API_KEY=...
KLING_API_KEY=...
ELEVENLABS_API_KEY=...
NEXT_PUBLIC_APP_URL=https://freeshell.co.kr

# 데이터베이스 (향후)
DATABASE_URL=...
```

### C. 참고 자료

- **Next.js 문서**: https://nextjs.org/docs
- **Tailwind CSS 문서**: https://tailwindcss.com/docs
- **Framer Motion 문서**: https://www.framer.com/motion/
- **OpenAI API 문서**: https://platform.openai.com/docs
- **Netlify 문서**: https://docs.netlify.com/

### D. 지원 및 문의

- **이슈 트래커**: GitHub Issues
- **문서**: 프로젝트 README.md
- **배포 관련**: DEPLOY.md, DEPLOY_TROUBLESHOOTING.md

---

**문서 버전**: 1.0.0  
**최종 업데이트**: 2024-12-29  
**작성자**: Shell Development Team



