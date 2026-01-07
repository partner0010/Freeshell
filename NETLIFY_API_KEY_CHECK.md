# Netlify API Key 설정 확인 가이드

## 현재 상황

빌드 로그에 나타나는 "GOOGLE_API_KEY가 설정되지 않았습니다" 메시지는 **로컬 빌드 환경**에서만 나타나는 것입니다.

- ✅ **로컬 빌드**: 환경 변수가 없어서 경고 메시지 표시 (정상)
- ✅ **Netlify 배포**: 환경 변수가 설정되어 있으면 정상 작동

## Netlify 환경 변수 확인 방법

### 1. Netlify 대시보드에서 확인

1. https://app.netlify.com 접속
2. 사이트 선택 (freeshell.co.kr)
3. **Site settings** → **Environment variables** 이동
4. 다음 변수가 설정되어 있는지 확인:
   - `GOOGLE_API_KEY` ✅
   - `PEXELS_API_KEY` (선택)
   - `UNSPLASH_ACCESS_KEY` (선택)
   - `PIXABAY_API_KEY` (선택)

### 2. 사이트에서 직접 확인

배포된 사이트에서 다음 URL로 접속하여 확인:

```
https://freeshell.co.kr/api/ai-diagnostics
```

또는

```
https://freeshell.co.kr/admin
```

관리자 페이지의 "AI 서비스 상태" 섹션에서 각 API의 상태를 확인할 수 있습니다.

### 3. API 키가 설정되지 않은 경우

#### Google Gemini API 키 발급

1. https://aistudio.google.com/ 접속
2. Google 계정으로 로그인
3. **Get API key** 클릭
4. 새 프로젝트 생성 또는 기존 프로젝트 선택
5. API 키 복사

#### Netlify에 환경 변수 설정

1. Netlify 대시보드 → **Site settings** → **Environment variables**
2. **Add variable** 클릭
3. **Key**: `GOOGLE_API_KEY`
4. **Value**: (발급받은 API 키 붙여넣기)
5. **Save** 클릭
6. **Trigger deploy** 클릭하여 재배포

## 실제 작동 확인 방법

### 방법 1: AI 테스트 센터 사용

1. https://freeshell.co.kr/test-ai 접속
2. "AI 처리 과정" 탭 선택
3. 질문 입력 (예: "인공지능이란 무엇인가요?")
4. AI 처리 과정이 실시간으로 표시되는지 확인
5. 최종 응답이 실제 AI 응답인지 확인

### 방법 2: 검색 기능 사용

1. https://freeshell.co.kr 접속
2. 상단 검색창에 질문 입력
3. 결과에서 API 상태 확인:
   - ✅ "실제 AI API 사용" → API 키 정상 작동
   - ⚠️ "시뮬레이션 모드" → API 키 미설정 또는 오류

### 방법 3: 관리자 페이지 확인

1. https://freeshell.co.kr/admin 접속
2. "AI 서비스 상태" 섹션 확인
3. 각 서비스의 상태 확인:
   - **healthy** (녹색) → 정상 작동
   - **error** (빨간색) → API 키 문제
   - **not_configured** (노란색) → API 키 미설정

## 문제 해결

### API 키가 설정되어 있는데도 작동하지 않는 경우

1. **재배포 확인**
   - Netlify에서 환경 변수를 추가/수정한 후 반드시 재배포 필요
   - **Deploys** 탭 → **Trigger deploy** 클릭

2. **환경 변수 이름 확인**
   - 정확히 `GOOGLE_API_KEY` (대소문자 구분)
   - 공백이나 특수문자 없음

3. **API 키 유효성 확인**
   - Google AI Studio에서 API 키가 활성화되어 있는지 확인
   - API 키가 만료되지 않았는지 확인

4. **빌드 로그 확인**
   - Netlify 대시보드 → **Deploys** → 최신 배포 → **Build log**
   - 실제 배포 환경에서의 로그 확인

## 로컬 개발 환경 설정 (선택사항)

로컬에서도 테스트하려면 `.env.local` 파일 생성:

```env
GOOGLE_API_KEY=your_api_key_here
PEXELS_API_KEY=your_pexels_key_here
UNSPLASH_ACCESS_KEY=your_unsplash_key_here
PIXABAY_API_KEY=your_pixabay_key_here
```

⚠️ **주의**: `.env.local` 파일은 Git에 커밋하지 마세요! (이미 `.gitignore`에 포함됨)

## 요약

- 로컬 빌드 경고는 정상입니다 (환경 변수 없음)
- Netlify 배포 환경에서는 환경 변수가 설정되어 있으면 정상 작동
- 실제 작동 여부는 배포된 사이트에서 확인
- API 키가 없어도 기본 AI 기능은 작동합니다 (지능형 fallback)

