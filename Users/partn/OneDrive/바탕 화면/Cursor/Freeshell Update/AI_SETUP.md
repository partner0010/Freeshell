# Shell AI 기능 실제 실행 가이드

## 🔑 환경 변수 설정

실제 AI 기능을 사용하려면 `.env.local` 파일을 생성하고 다음 API 키를 설정하세요:

```env
# OpenAI API (필수 - 검색, Spark, 이미지 생성, AI 코파일럿 등)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Anthropic Claude API (선택사항 - Claude 모델 사용 시)
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# Google Gemini API (선택사항 - Gemini 모델 사용 시)
GOOGLE_API_KEY=your-google-api-key-here
```

## 📝 API 키 발급 방법

### OpenAI API 키
1. [OpenAI Platform](https://platform.openai.com/)에 접속
2. 계정 생성 또는 로그인
3. API Keys 메뉴에서 새 키 생성
4. 생성된 키를 `.env.local`에 추가

### Anthropic Claude API 키 (선택사항)
1. [Anthropic Console](https://console.anthropic.com/)에 접속
2. API Keys에서 새 키 생성
3. 생성된 키를 `.env.local`에 추가

### Google Gemini API 키 (선택사항)
1. [Google AI Studio](https://makersuite.google.com/app/apikey)에 접속
2. API 키 생성
3. 생성된 키를 `.env.local`에 추가

## ✅ AI 기능 작동 확인

### 1. 검색 엔진
- API 키 설정 후: 실제 OpenAI GPT-4를 사용하여 검색 결과 생성
- API 키 없을 때: 시뮬레이션된 응답 반환 (기능은 정상 작동)

### 2. Spark 워크스페이스
- API 키 설정 후: 실제 AI가 작업 수행
- API 키 없을 때: 시뮬레이션된 응답 반환

### 3. AI 코파일럿
- API 키 설정 후: 실제 AI가 페이지 컨텍스트를 분석하여 답변
- API 키 없을 때: 기본 응답 반환

### 4. 이미지 생성
- API 키 설정 후: DALL-E 3를 사용하여 실제 이미지 생성
- API 키 없을 때: 플레이스홀더 이미지 반환

### 5. 번역
- API 키 설정 후: 실제 AI 번역
- API 키 없을 때: 기본 번역 반환

### 6. 심층 연구
- API 키 설정 후: 실제 AI가 심층 분석 수행
- API 키 없을 때: 시뮬레이션된 연구 결과 반환

### 7. AI 에이전트 협력
- API 키 설정 후: 실제 AI 에이전트들이 협력하여 작업 수행
  - **검색 에이전트**: 실제 검색 API 호출하여 정보 수집
  - **분석 에이전트**: 실제 AI 모델(GPT-4)로 데이터 분석
  - **요약 에이전트**: 실제 AI 모델(GPT-4)로 내용 요약
  - 각 에이전트는 이전 에이전트의 결과를 활용하여 순차적으로 작업
- API 키 없을 때: 시뮬레이션된 에이전트 작업 반환

## 🚀 실행 방법

1. `.env.local` 파일 생성
2. API 키 설정
3. 개발 서버 재시작:
   ```bash
   npm run dev
   ```

## ⚠️ 중요 사항

- API 키는 절대 공개 저장소에 커밋하지 마세요
- `.env.local`은 `.gitignore`에 포함되어 있습니다
- API 사용량에 따라 비용이 발생할 수 있습니다
- 무료 티어 제한이 있을 수 있으니 확인하세요

## 🔧 문제 해결

### API 키가 작동하지 않는 경우
1. `.env.local` 파일이 프로젝트 루트에 있는지 확인
2. 파일 이름이 정확한지 확인 (`.env.local`)
3. 개발 서버를 재시작했는지 확인
4. API 키 앞뒤에 공백이 없는지 확인

### API 오류 발생 시
- 코드는 자동으로 폴백 모드로 전환됩니다
- 시뮬레이션된 응답을 반환하여 기능이 계속 작동합니다
- 콘솔에서 오류 메시지를 확인하세요

