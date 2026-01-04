# 무료 AI/API 통합 계획

## 🎯 목표
여러 곳에서 따로따로 사용해야 하는 무료 AI/API 서비스들을 한 곳에서 통합 사용할 수 있도록 구현

## 📋 통합할 무료 서비스 목록

### 1. 텍스트 생성 AI
- ✅ **Google Gemini API** (무료 티어)
  - 텍스트 생성, 질문 답변, 코드 생성
  - 이미지 분석
- ✅ **Hugging Face Inference API** (무료 티어)
  - 다양한 오픈소스 모델
  - 텍스트 생성, 요약, 감정 분석
- ✅ **Groq API** (무료 티어, 매우 빠름)
  - 텍스트 생성

### 2. 번역
- ✅ **Google Gemini API** (번역 기능 포함)
- ✅ **DeepL API** (무료 티어, 제한적)
- ✅ **Google Translate API** (무료 티어)

### 3. 웹 검색
- ✅ **DuckDuckGo API** (완전 무료, API 키 불필요)
  - 웹 검색 결과
- ✅ **Wikipedia API** (완전 무료)
  - 백과사전 정보

### 4. 이미지 검색/제공
- ✅ **Unsplash API** (무료 티어)
  - 고품질 이미지
- ✅ **Pexels API** (완전 무료)
  - 이미지/동영상
- ✅ **Pixabay API** (무료 티어)
  - 이미지/동영상

### 5. 음성 (선택적)
- ✅ **Web Speech API** (브라우저 내장, 완전 무료)
  - 음성 인식, 음성 합성
- ✅ **ElevenLabs API** (무료 티어, 제한적)
  - 고품질 음성 합성

## 🏗️ 구현 계획

### Phase 1: Google Gemini로 기존 기능 전환
1. `/api/search` → Google Gemini 사용
2. `/api/spark` → Google Gemini 사용
3. `/api/models` → Google Gemini만 지원
4. `/api/research` → Google Gemini 사용
5. `lib/ai-models.ts` → Google Gemini만 등록

### Phase 2: 무료 웹 검색 통합
1. DuckDuckGo API 통합
2. Wikipedia API 통합
3. 검색 결과 페이지 개선

### Phase 3: 무료 이미지 검색 통합
1. Pexels API 통합
2. Unsplash API 통합
3. 이미지 검색 기능 추가

### Phase 4: 추가 무료 기능
1. Hugging Face 모델 통합 (선택적)
2. Groq API 통합 (선택적)
3. 음성 기능 (Web Speech API)

## 📁 새로운 메뉴 구조

```
1. AI 검색 엔진
   - Google Gemini 기반 검색
   - DuckDuckGo 웹 검색 통합
   - Wikipedia 백과사전 검색

2. Spark 워크스페이스
   - Google Gemini 기반 작업 생성
   - 텍스트 생성, 문서 작성

3. 번역
   - Google Gemini 번역
   - 다국어 지원

4. 이미지 검색 (신규)
   - Pexels 이미지 검색
   - Unsplash 이미지 검색

5. AI 드라이브
   - 생성된 콘텐츠 저장
```

## 🔧 기술 스택

- **텍스트 AI**: Google Gemini API (주), Hugging Face (보조)
- **웹 검색**: DuckDuckGo API, Wikipedia API
- **이미지**: Pexels API, Unsplash API
- **번역**: Google Gemini API

## 📝 구현 순서

1. ✅ 유료 기능 제거 (완료)
2. 🔄 Google Gemini로 전환
3. ⏳ 웹 검색 통합
4. ⏳ 이미지 검색 추가
5. ⏳ 추가 기능 통합

