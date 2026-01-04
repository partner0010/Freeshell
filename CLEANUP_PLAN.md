# 무료 전용 기능 정리 계획

## 📋 기능 분류

### ✅ 유지할 기능 (Google Gemini API로 전환)
1. **AI 검색 엔진** - Google Gemini로 대체 가능
2. **Spark 워크스페이스** - Google Gemini로 대체 가능
3. **번역** - Google Gemini로 대체 가능
4. **연구 (Research)** - Google Gemini로 대체 가능
5. **AI 드라이브** - 저장 기능만 유지 (AI 기능은 Google Gemini 사용)

### ❌ 제거할 기능 (유료 API 필요)
1. **이미지 생성 (ImageGenerator)** - DALL-E 3 필요 (OpenAI, 유료)
2. **Pocket (동영상 제작)** - 이미지/동영상 생성 필요 (유료)
3. **교차 검색 (CrossSearch)** - 복잡하고 일부 유료 API 필요
4. **AI 에이전트 협력 (AIAgentCollaboration)** - OpenAI API 사용

## 🔧 변경 사항

### 1. 메인 페이지 (`app/page.tsx`)
- 제거: 이미지 생성, Pocket, 교차 검색, AI 에이전트 탭
- 유지: AI 검색, Spark, AI 드라이브, 번역

### 2. API 라우트
- 제거:
  - `/api/generate` (이미지 생성)
  - `/api/video/animate` (동영상)
  - `/api/video/compose` (동영상)
  - `/api/audio/generate` (오디오)
- 수정:
  - `/api/search` → Google Gemini 사용
  - `/api/spark` → Google Gemini 사용
  - `/api/models` → Google Gemini만 지원 (OpenAI/Anthropic 제거)
  - `/api/research` → Google Gemini 사용

### 3. 라이브러리 (`lib/`)
- `lib/openai.ts` → 제거 또는 비활성화
- `lib/ai-models.ts` → Google Gemini만 지원하도록 수정

### 4. 컴포넌트 (`components/`)
- 제거:
  - `ImageGenerator.tsx`
  - `Pocket.tsx`
  - `CrossSearch.tsx`
  - `AIAgentCollaboration.tsx`
- 유지/수정:
  - `SearchEngine.tsx` → Google Gemini 사용
  - `SparkWorkspace.tsx` → Google Gemini 사용
  - `Translator.tsx` → Google Gemini 사용

### 5. 네비게이션 (`components/Navbar.tsx`)
- 유료 기능 관련 메뉴 제거 (필요시)

## 📝 작업 순서
1. 메인 페이지에서 유료 기능 탭 제거
2. API 라우트 정리 (유료 API 제거, Google Gemini로 전환)
3. 라이브러리 파일 정리 (OpenAI 클라이언트 제거)
4. 컴포넌트 파일 제거
5. 네비게이션 정리

