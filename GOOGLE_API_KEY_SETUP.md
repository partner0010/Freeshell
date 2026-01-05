# Google Gemini API 키 설정 가이드

## ✅ API 키 확인

제공하신 API 키: `AIzaSyExample1234567890ABCDEFGHIJKLMNOP` (예시)

이 키는 올바른 Google Gemini API 키 형식입니다 (`AIza...`로 시작).

## 🔧 환경 변수 설정 방법

### 1. 로컬 개발 환경 (.env.local)

프로젝트 루트 디렉토리에 `.env.local` 파일을 생성하고 다음을 추가하세요:

```env
GOOGLE_API_KEY=AIzaSyExample1234567890ABCDEFGHIJKLMNOP
```

**중요:**
- `.env.local` 파일은 Git에 커밋하지 마세요 (이미 `.gitignore`에 포함되어 있음)
- 파일 이름은 정확히 `.env.local`이어야 합니다
- 등호(`=`) 앞뒤에 공백이 없어야 합니다

### 2. Netlify 배포 환경

1. [Netlify 대시보드](https://app.netlify.com) 접속
2. 사이트 선택 (freeshell.co.kr)
3. **Site settings** → **Environment variables** 클릭
4. **Add a variable** 버튼 클릭
5. 다음 정보 입력:
   - **Key**: `GOOGLE_API_KEY`
   - **Value**: `AIzaSyBwagcHisy2dkVBW6jOqLSJtP5PEH4XXGo`
   - **Scopes**: `All scopes` (기본값)
6. **Save** 클릭
7. **Deploys** 탭으로 이동
8. **Trigger deploy** → **Deploy site** 클릭 (재배포 필요)

## ✅ API 키 테스트

### 방법 1: 브라우저에서 테스트
1. 개발 서버 실행: `npm run dev`
2. 브라우저에서 `http://localhost:3000/diagnostics` 접속
3. API 키 상태 확인

### 방법 2: API 엔드포인트 테스트
브라우저에서 `http://localhost:3000/api/status` 접속하여 JSON 응답 확인

## 🔒 보안 주의사항

1. **절대 공유하지 마세요**: API 키는 비밀번호처럼 취급하세요
2. **Git에 커밋 금지**: `.env.local` 파일은 절대 Git에 커밋하지 마세요
3. **용량 모니터링**: Google Gemini API는 무료 티어 제한이 있으니 사용량을 모니터링하세요
4. **키 회전**: 키가 노출되면 즉시 새 키를 발급받아 교체하세요

## 📋 사용 가능한 기능

API 키 설정 후 다음 기능들이 정상 작동합니다:

1. ✅ **AI 검색 엔진** - Google Gemini로 검색 결과 생성
2. ✅ **Spark 워크스페이스** - AI 작업 자동화
3. ✅ **번역** - 다국어 번역 서비스
4. ✅ **연구** - 심층 분석 및 리서치

## 🚨 문제 해결

### API 키가 작동하지 않는 경우

1. **키 형식 확인**: `AIza...`로 시작해야 합니다
2. **환경 변수 이름 확인**: 정확히 `GOOGLE_API_KEY`여야 합니다
3. **서버 재시작**: `.env.local` 파일 수정 후 개발 서버를 재시작하세요
4. **Netlify 재배포**: Netlify 환경 변수 설정 후 재배포가 필요합니다
5. **API 키 활성화 확인**: [Google AI Studio](https://aistudio.google.com/app/api-keys)에서 키가 활성화되어 있는지 확인

### API 키 확인 방법

```bash
# 로컬에서 환경 변수 확인 (Windows PowerShell)
$env:GOOGLE_API_KEY

# 또는 .env.local 파일 내용 확인
cat .env.local
```

## 📚 참고 링크

- [Google AI Studio](https://aistudio.google.com/app/api-keys) - API 키 관리
- [Google Gemini API 문서](https://ai.google.dev/docs) - API 사용 가이드
- [Netlify 환경 변수 설정](https://docs.netlify.com/environment-variables/overview/) - Netlify 가이드

